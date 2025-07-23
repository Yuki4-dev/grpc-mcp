import { SendGrpcClientRequest, SendGrpcClientResponse } from "./GrpcClient.js";
export interface IGrpcClientSender {
    sendAsync(request: SendGrpcClientRequest): Promise<SendGrpcClientResponse>;
    cancel(): void;
}
export declare const grpcClientSender: IGrpcClientSender;
