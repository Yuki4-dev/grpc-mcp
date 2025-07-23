import {
    ProtocolBufferEnum,
    ProtocolBufferMessage,
    protocolBufferMethodForEach,
} from "./Grpc/ProtocolBuffer/ProtocolBuffer.js";
import { protoLoader } from "./Grpc/ProtocolBuffer/ProtoLoader.js";

export type Service = {
    name: string;
    methods: string[]
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

export const loader = {
    async loadAsync(dir: string): Promise<Proto[]> {
        const proto = await protoLoader.loadAsync(dir);
        const result: Proto[] = [];
        for (const p of proto) {
            const services: Service[] = [];
            for (const s of p.protocolBuffer.services) {
                services.push({
                    name: s.name,
                    methods: s.methods.map(m => m.name),
                });
            }
            result.push({
                path: p.protocolBuffer.metadata.protoPath,
                services: services,
            });
        }
        return result;
    },

    async getMethodAsync(path: string, service: string, method: string): Promise<Method | undefined> {
        const proto = await protoLoader.loadAsync(path);

        let result: Method | undefined = undefined;
        protocolBufferMethodForEach(
            proto.map((p) => p.protocolBuffer),
            (p, s, m) => {
                if (s.name === service && m.name === method) {
                    result = {
                        name: method,
                        request: m.requestMessageName,
                        response: m.responseMessageName,
                        messages: [...p.messages],
                        enums: [...p.enums],
                    };
                }
                return result !== undefined;
            },
        );

        return result;
    },
};
