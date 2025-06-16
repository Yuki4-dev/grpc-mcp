import { grpcClientSender } from "./Grpc/GrpcClient/GrpcClientSender.js";
export const client = {
    async requestAsync(req) {
        const grpcRequest = {
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
