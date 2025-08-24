import { Status } from "@grpc/grpc-js/build/src/constants.js";
export const equalsProtocolBuffer = (a, b) => {
    return a.serial === b.serial;
};
export const equalsProtocolBufferService = (a, b) => {
    return a.name === b.name;
};
export const equalsProtocolBufferMethod = (a, b) => {
    return a.name === b.name;
};
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
];
export const isErrorStatusObject = (obj) => {
    const target = obj;
    return (target &&
        typeof target.code === "number" &&
        (target.details === undefined || typeof target.details === "string") &&
        (target.metadata === undefined || typeof target.metadata === "object"));
};
export const protocolBufferMethodForEach = (protocolBuffers, callback) => {
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
export const toGrpcStatusCode = (status) => {
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
