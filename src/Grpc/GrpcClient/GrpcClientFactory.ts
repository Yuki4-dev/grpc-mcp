import * as grpc from "@grpc/grpc-js";
import { CancellationToken } from "../../Common/CancellationToken.js";
import { ListenOnlyTypedEvent, TypedEvent } from "../../Common/EventHandler.js";
import { obj2String } from "../../Common/Json.js";
import { Logger } from "../../Common/Logger.js";
import { ErrorStatusObject } from "../ProtocolBuffer/ProtocolBuffer.js";
import { ProtocolBufferPackageDefinition } from "../ProtocolBuffer/ProtocolBufferPackageDefinition.js";
import { ClientCallOptions, IGrpcClient } from "./GrpcClient.js";

export interface IGrpcClientFactory {
    create(
        address: string,
        serviceName: string,
        proto: ProtocolBufferPackageDefinition,
        option?: grpc.ClientOptions,
    ): IGrpcClient;
}

type ClientCallCallback = (error: grpc.StatusObject | undefined, response: unknown | undefined) => void;

type ClientCall = (request: unknown, metadata: grpc.Metadata | {}, callback: ClientCallCallback) => { cancel(): void };

type ServiceClient = {
    [methodName: string]: ClientCall | Function;
    close(): void;
};

class GrpcClient implements IGrpcClient {
    private isClosed = false;
    private readonly client: ServiceClient;

    private _closed: TypedEvent = new TypedEvent();
    get closed(): ListenOnlyTypedEvent {
        return this._closed;
    }

    constructor(
        readonly address: string,
        readonly serviceName: string,
        readonly proto: ProtocolBufferPackageDefinition,
        readonly option?: grpc.ClientOptions,
    ) {
        if (!this.checkProto(serviceName, proto)) {
            throw new Error(`Not contains service: ${serviceName} ${this.getProtoInformation(proto)}`);
        }
        this.client = this.createClient(address, serviceName, proto, option);
    }

    callAsync(
        method: string,
        request: unknown,
        headers?: Record<string, string>,
        options?: ClientCallOptions,
        token?: CancellationToken,
    ): Promise<any | ErrorStatusObject> {
        if (this.isClosed) {
            throw new Error("Client closed.");
        }

        if (!this.checkClient(method)) {
            throw new Error(`Not contains method: ${method} ${this.getProtoInformation()}`);
        }

        const callInfo = this.proto.protocolBuffer.packageName + "." + this.serviceName + "/" + method;
        Logger.debug("GrpcClient call  -> " + callInfo);
        Logger.debug("GrpcClient request -> " + obj2String(request));
        Logger.debug("GrpcClient request header -> " + obj2String(headers));

        const methodFunc = this.client[method] as ClientCall;
        return new Promise((resolve, reject) => {
            let timerId: NodeJS.Timeout;
            try {
                const call = methodFunc.call(
                    this.client,
                    request,
                    this.createMetaData(headers, options),
                    (error?: grpc.StatusObject, value?: unknown) => {
                        let response;
                        if (error) {
                            response = {
                                code: error.code,
                                details: error.details,
                            };
                        } else {
                            response = value;
                        }
                        Logger.debug("GrpcClient response -> " + obj2String(response));
                        clearInterval(timerId);
                        resolve(response);
                    },
                );

                if (token) {
                    timerId = setInterval(() => {
                        if (token.isCancellationRequested) {
                            clearInterval(timerId);
                            call.cancel();
                            const message = "GrpcClient cancel request -> " + callInfo;
                            Logger.debug(message);
                            reject(new Error(message));
                        }
                    }, 100);
                }
            } catch (e) {
                const message = `GrpcClient call failed. address: ${this.address} service: ${this.serviceName} ${this.getProtoInformation()} \r\n ${e}`;
                Logger.warn(message);
                Logger.warn(e);
                reject(new Error(message));
            }
        });
    }

    close(): void {
        if (this.isClosed) {
            return;
        }
        this.isClosed = true;

        try {
            this.client.close();
        } catch (e) {
            Logger.warn(e);
        } finally {
            this._closed.emit(undefined);
        }
    }

    private checkProto(serviceName: string, proto: ProtocolBufferPackageDefinition): boolean {
        if (!Object.keys(proto.packageDefinition).includes(proto.protocolBuffer.packageName + "." + serviceName)) {
            return false;
        }
        return true;
    }

    private checkClient(method: string): boolean {
        if (typeof this.client[method] !== "function") {
            return false;
        }
        return true;
    }

    private getProtoInformation(proto?: ProtocolBufferPackageDefinition): string {
        const p = proto ?? this.proto;
        return `(path: ${p.protocolBuffer.metadata.protoPath}, name: ${p.protocolBuffer.metadata.protoFileName})`;
    }

    private createClient(
        address: string,
        serviceName: string,
        proto: ProtocolBufferPackageDefinition,
        option?: grpc.ClientOptions,
    ): ServiceClient {
        const serviceDefinition = proto.packageDefinition[
            proto.protocolBuffer.packageName + "." + serviceName
        ] as grpc.ServiceDefinition;
        const clientConstructor = grpc.makeClientConstructor(serviceDefinition, serviceName);
        return new clientConstructor(
            address,
            this.createCredentials(option),
            this.createOptions(address, option),
        ) as unknown as ServiceClient;
    }

    private createMetaData(headers?: Record<string, string>, options?: ClientCallOptions): grpc.Metadata {
        const metadata = new grpc.Metadata();
        if (headers) {
            const metaHeaders = new grpc.Metadata();
            Object.keys(headers).forEach((k) => metaHeaders.add(k, headers[k]));
            metadata.merge(metaHeaders);
        }
        if (options?.deadlineMsec) {
            metadata.set(
                "deadline",
                new Date().setMilliseconds(new Date().getMilliseconds() + options?.deadlineMsec).toString(),
            );
        }
        return metadata;
    }

    private createCredentials(option?: grpc.ClientOptions): grpc.ChannelCredentials {
        if (option?.SSL) {
            return grpc.credentials.createSsl();
        } else {
            return grpc.credentials.createInsecure();
        }
    }

    private createOptions(address: string, option?: grpc.ClientOptions): grpc.ChannelOptions {
        let options: grpc.ChannelOptions = {};
        const httpProxy = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
        if (httpProxy) {
            options = {
                ...options,
                "grpc.enable_http_proxy": 0,
                // "grpc.http_proxy": httpProxy,
            };
        }
        // if (option?.SSL) {
        //     options = {
        //         ...options,
        //         "grpc.ssl_target_name_override": address,
        //         "grpc.default_authority": address,
        //     };
        // }
        return options;
    }
}

class GrpcClientFactory implements IGrpcClientFactory {
    create(
        address: string,
        serviceName: string,
        proto: ProtocolBufferPackageDefinition,
        option?: grpc.ClientOptions,
    ): IGrpcClient {
        return new GrpcClient(address, serviceName, proto, option);
    }
}

export const grpcClientFactory: IGrpcClientFactory = new GrpcClientFactory();
