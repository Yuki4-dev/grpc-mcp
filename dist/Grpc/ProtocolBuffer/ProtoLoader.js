import * as _protoLoader from "@grpc/proto-loader";
import { getFileAsync, separator } from "../../Common/File.js";
import { obj2Hash } from "../../Common/Hash.js";
import { Logger } from "../../Common/Logger.js";
const proto_ext = ".proto";
// https://github.com/grpc/grpc-node/blob/master/packages/proto-loader/golden-generated/google/protobuf/FieldDescriptorProto.ts
const protocolBufferMessageTypeMap = new Map([
    ["TYPE_DOUBLE", "number"],
    ["TYPE_FLOAT", "number"],
    ["TYPE_INT64", "long"],
    ["TYPE_UINT64", "long"],
    ["TYPE_INT32", "number"],
    ["TYPE_FIXED64", "long"],
    ["TYPE_FIXED32", "number"],
    ["TYPE_BOOL", "boolean"],
    ["TYPE_STRING", "string"],
    ["TYPE_GROUP", undefined],
    ["TYPE_MESSAGE", undefined],
    ["TYPE_BYTES", "string"],
    ["TYPE_UINT32", "number"],
    ["TYPE_ENUM", undefined],
    ["TYPE_SFIXED32", "number"],
    ["TYPE_SFIXED64", "long"],
    ["TYPE_SINT32", "number"],
    ["TYPE_SINT64", "long"],
]);
class ProtoLoader {
    async loadAsync(fileOrDir) {
        const files = await getFileAsync(fileOrDir, { extensions: [proto_ext] });
        const protoTask = files.map((file) => this.loadProtoAsync(file));
        return Promise.all(protoTask);
    }
    async loadProtoAsync(path) {
        let packageDefinition;
        try {
            packageDefinition = await _protoLoader.load(path, {
                keepCase: true,
                defaults: true,
                arrays: true,
                objects: true,
                longs: String,
                enums: String,
            });
            // console.log();
            // console.log(obj2String(packageDefinition));
            // console.log();
        }
        catch (e) {
            Logger.error(e);
            throw e;
        }
        // const proto = grpc.loadPackageDefinition(packageDefinition);
        // console.log();
        // console.log(obj2String(proto));
        // console.log();
        const protoFileName = path.replace(proto_ext, "").split(separator).pop() + "." + path.split(".").pop();
        const metadata = {
            protoFileName,
            protoPath: path,
        };
        const { packageName, services, messages, enums } = this.getProtocolBufferServiceMessageEnum(packageDefinition);
        const serial = obj2Hash({
            // metadata,
            packageName,
            services,
            messages,
            enums,
        }).toString();
        return {
            protocolBuffer: {
                serial,
                metadata,
                packageName,
                services,
                messages,
                enums,
            },
            packageDefinition,
        };
    }
    getProtocolBufferServiceMessageEnum(packageDefinition) {
        const services = [];
        const messages = [];
        const enums = [];
        const keys = Object.keys(packageDefinition);
        keys.forEach((key) => {
            const proto = packageDefinition[key];
            const result = this.getServiceMessageEnum(key, proto);
            if (result.service) {
                services.push(result.service);
            }
            else if (result.message) {
                messages.push(...result.message.messages);
                enums.push(...result.message.enums);
            }
            else if (result.en) {
                enums.push(result.en);
            }
        });
        const packageName = services[0].packageName;
        return {
            packageName,
            services,
            messages,
            enums,
        };
    }
    getServiceMessageEnum(key, proto) {
        if (proto.format === "Protocol Buffer 3 DescriptorProto") {
            const messageType = proto.type;
            return {
                message: this.getTypeMessage(messageType),
            };
        }
        else if (proto.format === "Protocol Buffer 3 EnumDescriptorProto") {
            const enumType = proto.type;
            return {
                en: this.getEnum(enumType),
            };
        }
        else {
            const methods = [];
            Object.keys(proto).forEach((mk) => {
                const method = proto[mk];
                const requestType = method.requestType.type;
                const responseType = method.responseType.type;
                methods.push({
                    name: method.originalName
                        ? method.originalName.charAt(0).toUpperCase() + method.originalName.slice(1)
                        : "",
                    path: method.path,
                    requestMessageName: requestType.name,
                    responseMessageName: responseType.name,
                });
            });
            return {
                service: {
                    packageName: key.slice(0, key.lastIndexOf(".")),
                    name: key.split(".").pop() ?? "",
                    methods,
                },
            };
        }
    }
    getTypeMessage(messageType, parentMessageName) {
        const messages = [];
        const fields = messageType.field.map((field) => {
            return {
                name: field.name,
                type: this.getProtocolBufferMessageType(field),
                repeated: field.label.indexOf("LABEL_REPEATED") > -1 ? true : undefined,
            };
        });
        messages.push({
            name: messageType.name,
            fields,
            parentMessageName,
        });
        const enums = [];
        if (messageType.nestedType) {
            messageType.nestedType
                .flatMap((nst) => this.getTypeMessage(nst, messageType.name))
                .forEach((tm) => {
                messages.push(...tm.messages);
                enums.push(...tm.enums);
            });
        }
        if (messageType.enumType) {
            messageType.enumType.forEach((en) => {
                enums.push(this.getEnum(en, messageType.name));
            });
        }
        return { messages, enums };
    }
    getEnum(enumType, parentMessageName) {
        return {
            name: enumType.name,
            values: enumType.value.map((e) => e.name),
            parentMessageName,
        };
    }
    getProtocolBufferMessageType(field) {
        const type = protocolBufferMessageTypeMap.get(field.type);
        if (type) {
            return type;
        }
        else {
            return field.typeName;
        }
    }
}
export const protoLoader = new ProtoLoader();
