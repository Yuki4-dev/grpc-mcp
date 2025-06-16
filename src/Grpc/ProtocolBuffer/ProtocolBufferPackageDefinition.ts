import { PackageDefinition } from "@grpc/proto-loader";
import { ProtocolBuffer } from "./ProtocolBuffer.js";

export interface ProtocolBufferPackageDefinition {
    protocolBuffer: ProtocolBuffer;
    packageDefinition: PackageDefinition;
}
