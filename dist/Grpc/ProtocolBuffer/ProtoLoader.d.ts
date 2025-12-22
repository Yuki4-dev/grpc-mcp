import { ProtocolBufferPackageDefinition } from "./ProtocolBufferPackageDefinition.js";
export interface IProtoLoader {
    loadAsync(pathOrDir: string): Promise<ProtocolBufferPackageDefinition[]>;
}
export declare const protoLoader: IProtoLoader;
