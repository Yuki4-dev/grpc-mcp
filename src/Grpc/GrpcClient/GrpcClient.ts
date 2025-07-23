import { CancellationToken } from "../../Common/CancellationToken.js";
import { ErrorStatusObject, ProtocolBuffer } from "../ProtocolBuffer/ProtocolBuffer.js";

export type GrpcClientRequestProto = string | ProtocolBuffer;

export interface GrpcClientRequestUrl {
    host: string;
    port?: number;
}

export interface GrpcClientRequestConfig {
    deadLine?: number;
    SSL?: boolean;
    enableNullValue?: boolean;
}

export interface GrpcClientRequest {
    headers?: Record<string, string>;
    service: string;
    method: string;
    body: string;
}

export type GrpcClientResponse = GrpcClientOKResponse | GrpcClientErrorResponse;

export interface GrpcClientOKResponse {
    ok: true;
    body: string;
}

export interface GrpcClientErrorResponse {
    ok: false;
    error: ErrorStatusObject;
}

export interface GrpcResponseAnalyze {
    time: number;
}

export interface SendGrpcClientRequest {
    proto: GrpcClientRequestProto;
    config?: GrpcClientRequestConfig;
    address: GrpcClientRequestUrl;
    request: GrpcClientRequest;
}

export interface SendGrpcClientResponse {
    analyze: GrpcResponseAnalyze;
    response: GrpcClientResponse;
}

export type ClientOptions = {
    SSL: boolean;
};

export type ClientCallOptions = {
    deadlineMsec?: number;
};

export interface IGrpcClient {
    callAsync(
        method: string,
        request: unknown,
        headers?: Record<string, string>,
        options?: ClientCallOptions,
        token?: CancellationToken,
    ): Promise<any | ErrorStatusObject>;

    close(): void;
}
