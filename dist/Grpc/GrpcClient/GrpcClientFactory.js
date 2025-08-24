import * as grpc from "@grpc/grpc-js";
import { TypedEvent } from "../../Common/EventHandler.js";
import { obj2String } from "../../Common/Json.js";
import { Logger } from "../../Common/Logger.js";
class GrpcClient {
    address;
    serviceName;
    proto;
    option;
    isClosed = false;
    client;
    _closed = new TypedEvent();
    get closed() {
        return this._closed;
    }
    constructor(address, serviceName, proto, option) {
        this.address = address;
        this.serviceName = serviceName;
        this.proto = proto;
        this.option = option;
        if (!this.checkProto(serviceName, proto)) {
            throw new Error(`Not contains service: ${serviceName} ${this.getProtoInformation(proto)}`);
        }
        this.client = this.createClient(address, serviceName, proto, option);
    }
    callAsync(method, request, headers, options, token) {
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
        const methodFunc = this.client[method];
        return new Promise((resolve, reject) => {
            let timerId;
            try {
                const call = methodFunc.call(this.client, request, this.createMetaData(headers, options), (error, value) => {
                    let response;
                    if (error) {
                        response = {
                            code: error.code,
                            details: error.details,
                        };
                    }
                    else {
                        response = value;
                    }
                    Logger.debug("GrpcClient response -> " + obj2String(response));
                    clearInterval(timerId);
                    resolve(response);
                });
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
            }
            catch (e) {
                const message = `GrpcClient call failed. address: ${this.address} service: ${this.serviceName} ${this.getProtoInformation()} \r\n ${e}`;
                Logger.warn(message);
                Logger.warn(e);
                reject(new Error(message));
            }
        });
    }
    close() {
        if (this.isClosed) {
            return;
        }
        this.isClosed = true;
        try {
            this.client.close();
        }
        catch (e) {
            Logger.warn(e);
        }
        finally {
            this._closed.emit(undefined);
        }
    }
    checkProto(serviceName, proto) {
        if (!Object.keys(proto.packageDefinition).includes(proto.protocolBuffer.packageName + "." + serviceName)) {
            return false;
        }
        return true;
    }
    checkClient(method) {
        if (typeof this.client[method] !== "function") {
            return false;
        }
        return true;
    }
    getProtoInformation(proto) {
        const p = proto ?? this.proto;
        return `(path: ${p.protocolBuffer.metadata.protoPath}, name: ${p.protocolBuffer.metadata.protoFileName})`;
    }
    createClient(address, serviceName, proto, option) {
        const serviceDefinition = proto.packageDefinition[proto.protocolBuffer.packageName + "." + serviceName];
        const clientConstructor = grpc.makeClientConstructor(serviceDefinition, serviceName);
        return new clientConstructor(address, this.createCredentials(option), this.createOptions(address, option));
    }
    createMetaData(headers, options) {
        const metadata = new grpc.Metadata();
        if (headers) {
            const metaHeaders = new grpc.Metadata();
            Object.keys(headers).forEach((k) => metaHeaders.add(k, headers[k]));
            metadata.merge(metaHeaders);
        }
        if (options?.deadlineMsec) {
            metadata.set("deadline", new Date().setMilliseconds(new Date().getMilliseconds() + options?.deadlineMsec).toString());
        }
        return metadata;
    }
    createCredentials(option) {
        if (option?.SSL) {
            return grpc.credentials.createSsl();
        }
        else {
            return grpc.credentials.createInsecure();
        }
    }
    createOptions(address, option) {
        let options = {};
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
class GrpcClientFactory {
    create(address, serviceName, proto, option) {
        return new GrpcClient(address, serviceName, proto, option);
    }
}
export const grpcClientFactory = new GrpcClientFactory();
