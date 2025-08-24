import { SendGrpcClientRequest, SendGrpcClientResponse } from "./Grpc/GrpcClient/GrpcClient.js";
import { grpcClientSender } from "./Grpc/GrpcClient/GrpcClientSender.js";

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

export const client = {
    async requestAsync(req: ClientRequest): Promise<ClientResponse> {
        const grpcRequest: SendGrpcClientRequest = {
            address: {
                host: req.address.split(":")[0],
                port: req.address.split(":")[1] ? Number(req.address.split(":")[1]) : undefined,
            },
            proto: req.path,
            config: {
                deadLine: req.config?.deadLine,
                SSL: req.config?.SSL,
            },
            request: {
                headers: req.headers,
                service: req.service,
                method: req.method,
                body: req.body,
            },
        };

        return await grpcClientSender.sendAsync(grpcRequest);
    },
};
