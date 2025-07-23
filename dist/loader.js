import { protocolBufferMethodForEach, } from "./Grpc/ProtocolBuffer/ProtocolBuffer.js";
import { protoLoader } from "./Grpc/ProtocolBuffer/ProtoLoader.js";
export const loader = {
    async loadAsync(dir) {
        const proto = await protoLoader.loadAsync(dir);
        const result = [];
        for (const p of proto) {
            const services = [];
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
    async getMethodAsync(path, service, method) {
        const proto = await protoLoader.loadAsync(path);
        let result = undefined;
        protocolBufferMethodForEach(proto.map((p) => p.protocolBuffer), (p, s, m) => {
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
        });
        return result;
    },
};
