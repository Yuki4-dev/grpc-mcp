import { Status } from "@grpc/grpc-js/build/src/constants.js";
export interface ProtocolBuffer {
    readonly serial: string;
    readonly metadata: ProtocolBufferMetaData;
    readonly packageName: string;
    readonly services: readonly ProtocolBufferService[];
    readonly messages: readonly ProtocolBufferMessage[];
    readonly enums: readonly ProtocolBufferEnum[];
}
export declare const equalsProtocolBuffer: (a: ProtocolBuffer, b: ProtocolBuffer) => boolean;
export interface ProtocolBufferMetaData {
    readonly protoFileName: string;
    readonly protoPath: string;
}
export interface ProtocolBufferService {
    readonly name: string;
    readonly methods: readonly ProtocolBufferMethod[];
}
export declare const equalsProtocolBufferService: (a: ProtocolBufferService, b: ProtocolBufferService) => boolean;
export interface ProtocolBufferMethod {
    readonly name: string;
    readonly path: string;
    readonly requestMessageName: string;
    readonly responseMessageName: string;
}
export declare const equalsProtocolBufferMethod: (a: ProtocolBufferMethod, b: ProtocolBufferMethod) => boolean;
export interface ProtocolBufferNestedType {
    readonly parentMessageName?: string;
}
export interface ProtocolBufferMessage extends ProtocolBufferNestedType {
    readonly name: string;
    readonly fields: readonly ProtocolBufferMessageField[];
}
export interface ProtocolBufferMessageField {
    readonly name: string;
    readonly type: ProtocolBufferMessageFieldType;
    readonly repeated?: boolean;
}
export type ProtocolBufferMessageFieldType = "string" | "number" | "long" | "boolean" | string;
export interface ProtocolBufferEnum extends ProtocolBufferNestedType {
    readonly name: string;
    readonly values: readonly string[];
}
export declare const protocolBufferErrorCodeArray: readonly ["OK", "CANCELLED", "UNKNOWN", "INVALID_ARGUMENT", "DEADLINE_EXCEEDED", "NOT_FOUND", "ALREADY_EXISTS", "PERMISSION_DENIED", "UNAUTHENTICATED", "RESOURCE_EXHAUSTED", "FAILED_PRECONDITION", "ABORTED", "OUT_OF_RANGE", "UNIMPLEMENTED", "INTERNAL", "UNAVAILABLE", "DATA_LOSS"];
export type ProtocolBufferErrorCode = (typeof protocolBufferErrorCodeArray)[number];
export interface ErrorStatusObjectRow {
    code: number;
    details?: string;
    metadata?: Record<string, string>;
}
export interface ErrorStatusObject {
    code: ProtocolBufferErrorCode;
    details?: string;
    metadata?: Record<string, string>;
}
export declare const isErrorStatusObject: (obj: any) => obj is ErrorStatusObjectRow;
export declare const protocolBufferMethodForEach: (protocolBuffers: ProtocolBuffer[], callback: (proto: ProtocolBuffer, service: ProtocolBufferService, method: ProtocolBufferMethod) => boolean | void) => void;
export declare const toGrpcStatusCode: (status: Status) => ProtocolBufferErrorCode;
