import { ProtocolBufferEnum, ProtocolBufferMessage } from "./Grpc/ProtocolBuffer/ProtocolBuffer.js";
export type Service = {
    name: string;
    methods: string[];
};
export type Proto = {
    path: string;
    services: Service[];
};
export type Method = {
    name: string;
    request: string;
    response: string;
    messages: ProtocolBufferMessage[];
    enums: ProtocolBufferEnum[];
};
export declare const loader: {
    loadAsync(dir: string): Promise<Proto[]>;
    getMethodAsync(path: string, service: string, method: string): Promise<Method | undefined>;
};
