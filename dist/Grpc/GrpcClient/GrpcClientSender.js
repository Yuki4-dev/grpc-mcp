import { CancellationTokenSource } from "../../Common/CancellationToken.js";
import { obj2String, string2Obj } from "../../Common/Json.js";
import { Logger } from "../../Common/Logger.js";
import { isErrorStatusObject, toGrpcStatusCode } from "../ProtocolBuffer/ProtocolBuffer.js";
import { protoLoader } from "../ProtocolBuffer/ProtoLoader.js";
import { grpcClientFactory } from "./GrpcClientFactory.js";
const MAX_SEND_REQUEST_TIMEOUT = 180 * 1000;
class GrpcClientSender {
    protoLoader;
    grpcClientFactory;
    runTokenSourceList = [];
    constructor(protoLoader, grpcClientFactory) {
        this.protoLoader = protoLoader;
        this.grpcClientFactory = grpcClientFactory;
    }
    async sendAsync(request) {
        const errMessage = this.validateRequest(request);
        if (errMessage.length > 0) {
            return this.toErrorResponse(0, "UNAVAILABLE", errMessage.join(", "));
        }
        let reqProtoPath;
        if (typeof request.proto === "string") {
            reqProtoPath = request.proto;
        }
        else {
            reqProtoPath = request.proto.metadata.protoPath;
        }
        const loadProto = await this.protoLoader.loadAsync(reqProtoPath);
        const proto = loadProto[0];
        if (loadProto.length !== 1) {
            Logger.warn("PostGrpcRequest use file path. Not directory path : " + reqProtoPath);
        }
        let option;
        if (request.config?.SSL) {
            option = {
                SSL: request.config?.SSL,
            };
        }
        Logger.debug(obj2String(proto.protocolBuffer, true));
        const client = this.grpcClientFactory.create(request.address.host + (request.address.port ? ":" + request.address.port : ""), request.request.service, proto, option);
        const tokenSource = this.createCancellationTokenSource();
        const timerId = setTimeout(() => {
            tokenSource.cancel();
        }, MAX_SEND_REQUEST_TIMEOUT);
        let callOption;
        if (request.config?.deadLine) {
            callOption = {
                deadlineMsec: request.config?.deadLine,
            };
        }
        const startTime = performance.now();
        let callResult;
        try {
            callResult = await client.callAsync(request.request.method, string2Obj(request.request.body), request.request.headers, callOption, tokenSource.token);
        }
        catch (e) {
            const ex = e instanceof Error ? e : new Error(String(e));
            return this.toErrorResponse(performance.now() - startTime, "UNKNOWN", `GrpcClient call failed: ${ex.message}`);
        }
        finally {
            clearTimeout(timerId);
            client.close();
        }
        const analyze = {
            time: performance.now() - startTime,
        };
        if (isErrorStatusObject(callResult)) {
            return {
                analyze,
                response: {
                    ok: false,
                    error: {
                        ...callResult,
                        code: toGrpcStatusCode(callResult.code),
                    },
                },
            };
        }
        if (!request.config?.enableNullValue) {
            callResult = this.cleanCallResult(callResult);
        }
        return { analyze, response: { ok: true, body: obj2String(callResult, true) } };
    }
    cancel() {
        this.runTokenSourceList.forEach((ts) => ts.cancel());
        this.runTokenSourceList = [];
    }
    toErrorResponse(time, code, details) {
        return {
            analyze: {
                time,
            },
            response: {
                ok: false,
                error: {
                    code: code,
                    details: details,
                },
            },
        };
    }
    validateRequest(request) {
        const errorMessage = [];
        if (!request.address.host) {
            errorMessage.push("Host is empty.");
        }
        if (request.address.port !== undefined && (request.address.port < 1 || Number.isNaN(request.address.port))) {
            errorMessage.push("Invalid port : " + request.address.port);
        }
        const bodyObj = string2Obj(request.request.body);
        if (bodyObj === undefined) {
            errorMessage.push("Invalid Request json.");
        }
        return errorMessage;
    }
    cleanCallResult(result) {
        if (result === null || result === undefined) {
            return undefined;
        }
        if (typeof result !== "object") {
            return result;
        }
        if (Array.isArray(result)) {
            if (result.length !== 0) {
                return result.map((v) => this.cleanCallResult(v));
            }
            else {
                return undefined;
            }
        }
        const newResult = {};
        for (const [key, value] of Object.entries(result)) {
            newResult[key] = this.cleanCallResult(value);
        }
        return newResult;
    }
    createCancellationTokenSource() {
        const tokenSource = new CancellationTokenSource();
        this.runTokenSourceList = this.runTokenSourceList.filter((ts) => !ts.token.isCancellationRequested);
        this.runTokenSourceList.push(tokenSource);
        return tokenSource;
    }
}
export const grpcClientSender = new GrpcClientSender(protoLoader, grpcClientFactory);
