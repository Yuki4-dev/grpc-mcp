import { SendGrpcClientResponse } from "./Grpc/GrpcClient/GrpcClient.js";
export type ClientRequest = {
    path: string;
    address: string;
    service: string;
    method: string;
    body: string;
    headers?: Record<string, string>;
    config?: {
        deadLine?: number;
        SSL?: boolean;
    };
};
export type ClientResponse = SendGrpcClientResponse;
export declare const client: {
    requestAsync(req: ClientRequest): Promise<ClientResponse>;
};
