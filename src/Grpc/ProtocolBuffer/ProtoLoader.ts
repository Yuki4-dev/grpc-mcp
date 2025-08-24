import * as _protoLoader from "@grpc/proto-loader";
import { getFileAsync, separator } from "../../Common/File.js";
import { obj2Hash } from "../../Common/Hash.js";
import { Logger } from "../../Common/Logger.js";
import {
    ProtocolBufferEnum,
    ProtocolBufferMessage,
    ProtocolBufferMetaData,
    ProtocolBufferMethod,
    ProtocolBufferService,
} from "./ProtocolBuffer.js";
import { ProtocolBufferPackageDefinition } from "./ProtocolBufferPackageDefinition.js";

export interface IProtoLoader {
    loadAsync(pathOrDir: string): Promise<ProtocolBufferPackageDefinition[]>;
}

const proto_ext = ".proto";

interface ServiceMessageType {
    field: ServiceMessageField[];
    nestedType: ServiceMessageType[];
    enumType: EnumType[];
    name: string;
}

interface ServiceMessageField {
    name: string;
    number: number;
    label: string;
    type: string;
    typeName: string;
    defaultValue: string;
    oneofIndex: number;
}

interface EnumType {
    value: EnumValue[];
    name: string;
}

interface EnumValue {
    name: string;
    number: number;
}

interface ProtobufTypeDefinition {
    format: string;
    type: object;
    // fileDescriptorProtos: Buffer[];
}

interface MethodDefinition {
    path: string;
    originalName?: string;
    requestType: ProtobufTypeDefinition;
    responseType: ProtobufTypeDefinition;
}

interface ServiceDefinition {
    [index: string]: MethodDefinition;
}

interface PackageDefinition {
    [index: string]: ServiceDefinition | ProtobufTypeDefinition;
}

type ProtocolBufferServiceWithPackage = ProtocolBufferService & { packageName: string };

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

class ProtoLoader implements IProtoLoader {
    async loadAsync(fileOrDir: string): Promise<ProtocolBufferPackageDefinition[]> {
        const files = await getFileAsync(fileOrDir, { extensions: [proto_ext] });
        const protoTask = files.map((file) => this.loadProtoAsync(file));
        return Promise.all(protoTask);
    }

    async loadProtoAsync(path: string): Promise<ProtocolBufferPackageDefinition> {
        let packageDefinition: _protoLoader.PackageDefinition;
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
        } catch (e: unknown) {
            Logger.error(e);
            throw e;
        }

        // const proto = grpc.loadPackageDefinition(packageDefinition);
        // console.log();
        // console.log(obj2String(proto));
        // console.log();

        const protoFileName = path.replace(proto_ext, "").split(separator).pop() + "." + path.split(".").pop();
        const metadata: ProtocolBufferMetaData = {
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

    getProtocolBufferServiceMessageEnum(packageDefinition: PackageDefinition): {
        packageName: string;
        services: ProtocolBufferService[];
        messages: ProtocolBufferMessage[];
        enums: ProtocolBufferEnum[];
    } {
        const services: ProtocolBufferServiceWithPackage[] = [];
        const messages: ProtocolBufferMessage[] = [];
        const enums: ProtocolBufferEnum[] = [];

        const keys = Object.keys(packageDefinition);
        keys.forEach((key) => {
            const proto = packageDefinition[key];
            const result = this.getServiceMessageEnum(key, proto);
            if (result.service) {
                services.push(result.service);
            } else if (result.message) {
                messages.push(...result.message.messages);
                enums.push(...result.message.enums);
            } else if (result.en) {
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

    getServiceMessageEnum(
        key: string,
        proto: ServiceDefinition | ProtobufTypeDefinition,
    ): {
        service?: ProtocolBufferServiceWithPackage;
        message?: { messages: ProtocolBufferMessage[]; enums: ProtocolBufferEnum[] };
        en?: ProtocolBufferEnum;
    } {
        if (proto.format === "Protocol Buffer 3 DescriptorProto") {
            const messageType = proto.type as ServiceMessageType;
            return {
                message: this.getTypeMessage(messageType),
            };
        } else if (proto.format === "Protocol Buffer 3 EnumDescriptorProto") {
            const enumType = proto.type as EnumType;
            return {
                en: this.getEnum(enumType),
            };
        } else {
            const methods: ProtocolBufferMethod[] = [];
            Object.keys(proto).forEach((mk) => {
                const method = (proto as ServiceDefinition)[mk];
                const requestType = method.requestType.type as ServiceMessageType;
                const responseType = method.responseType.type as ServiceMessageType;
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

    getTypeMessage(
        messageType: ServiceMessageType,
        parentMessageName?: string,
    ): { messages: ProtocolBufferMessage[]; enums: ProtocolBufferEnum[] } {
        const messages: ProtocolBufferMessage[] = [];
        const fields = messageType.field.map((field) => {
            return {
                name: field.name,
                type: this.getProtocolBufferMessageType(field),
                repeated: field.label.indexOf("LABEL_REPEATED") > -1 ? (true as const) : undefined,
            };
        });
        messages.push({
            name: messageType.name,
            fields,
            parentMessageName,
        });

        const enums: ProtocolBufferEnum[] = [];
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

    getEnum(enumType: EnumType, parentMessageName?: string): ProtocolBufferEnum {
        return {
            name: enumType.name,
            values: enumType.value.map((e) => e.name),
            parentMessageName,
        };
    }

    getProtocolBufferMessageType(field: ServiceMessageField): string {
        const type = protocolBufferMessageTypeMap.get(field.type);
        if (type) {
            return type;
        } else {
            return field.typeName;
        }
    }
}

export const protoLoader: IProtoLoader = new ProtoLoader();
