import * as grpc from "@grpc/grpc-js";
import { ProtocolBufferPackageDefinition } from "../ProtocolBuffer/ProtocolBufferPackageDefinition.js";
import { IGrpcClient } from "./GrpcClient.js";
export interface IGrpcClientFactory {
    create(address: string, serviceName: string, proto: ProtocolBufferPackageDefinition, option?: grpc.ClientOptions): IGrpcClient;
}
export declare const grpcClientFactory: IGrpcClientFactory;
