import { Status } from "@grpc/grpc-js/build/src/constants.js";

export interface ProtocolBuffer {
    readonly serial: string;
    readonly metadata: ProtocolBufferMetaData;
    readonly packageName: string;
    readonly services: readonly ProtocolBufferService[];
    readonly messages: readonly ProtocolBufferMessage[];
    readonly enums: readonly ProtocolBufferEnum[];
}
export const equalsProtocolBuffer = (a: ProtocolBuffer, b: ProtocolBuffer) => {
    return a.serial === b.serial;
};

export interface ProtocolBufferMetaData {
    readonly protoFileName: string;
    readonly protoPath: string;
}

export interface ProtocolBufferService {
    readonly name: string;
    readonly methods: readonly ProtocolBufferMethod[];
}
export const equalsProtocolBufferService = (a: ProtocolBufferService, b: ProtocolBufferService) => {
    return a.name === b.name;
};

export interface ProtocolBufferMethod {
    readonly name: string;
    readonly path: string;
    readonly requestMessageName: string;
    readonly responseMessageName: string;
}
export const equalsProtocolBufferMethod = (a: ProtocolBufferMethod, b: ProtocolBufferMethod) => {
    return a.name === b.name;
};

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

export const protocolBufferErrorCodeArray = [
    "OK",
    "CANCELLED",
    "UNKNOWN",
    "INVALID_ARGUMENT",
    "DEADLINE_EXCEEDED",
    "NOT_FOUND",
    "ALREADY_EXISTS",
    "PERMISSION_DENIED",
    "UNAUTHENTICATED",
    "RESOURCE_EXHAUSTED",
    "FAILED_PRECONDITION",
    "ABORTED",
    "OUT_OF_RANGE",
    "UNIMPLEMENTED",
    "INTERNAL",
    "UNAVAILABLE",
    "DATA_LOSS",
] as const;

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

export const isErrorStatusObject = (obj: any): obj is ErrorStatusObjectRow => {
    const target = obj as ErrorStatusObjectRow;
    return (
        target &&
        typeof target.code === "number" &&
        (target.details === undefined || typeof target.details === "string") &&
        (target.metadata === undefined || typeof target.metadata === "object")
    );
};

export const protocolBufferMethodForEach = (
    protocolBuffers: ProtocolBuffer[],
    callback: (proto: ProtocolBuffer, service: ProtocolBufferService, method: ProtocolBufferMethod) => boolean | void,
) => {
    for (const proto of protocolBuffers) {
        for (const service of proto.services) {
            for (const method of service.methods) {
                if (callback(proto, service, method)) {
                    return;
                }
            }
        }
    }
};

export const toGrpcStatusCode = (status: Status): ProtocolBufferErrorCode => {
    switch (status) {
        case Status.OK:
            return "OK";
        case Status.CANCELLED:
            return "CANCELLED";
        case Status.UNKNOWN:
            return "UNKNOWN";
        case Status.INVALID_ARGUMENT:
            return "INVALID_ARGUMENT";
        case Status.DEADLINE_EXCEEDED:
            return "DEADLINE_EXCEEDED";
        case Status.NOT_FOUND:
            return "NOT_FOUND";
        case Status.ALREADY_EXISTS:
            return "ALREADY_EXISTS";
        case Status.PERMISSION_DENIED:
            return "PERMISSION_DENIED";
        case Status.RESOURCE_EXHAUSTED:
            return "RESOURCE_EXHAUSTED";
        case Status.FAILED_PRECONDITION:
            return "FAILED_PRECONDITION";
        case Status.ABORTED:
            return "ABORTED";
        case Status.OUT_OF_RANGE:
            return "OUT_OF_RANGE";
        case Status.UNIMPLEMENTED:
            return "UNIMPLEMENTED";
        case Status.INTERNAL:
            return "INTERNAL";
        case Status.UNAVAILABLE:
            return "UNAVAILABLE";
        case Status.DATA_LOSS:
            return "DATA_LOSS";
        case Status.UNAUTHENTICATED:
            return "UNAUTHENTICATED";
        default:
            return "UNKNOWN";
    }
};
