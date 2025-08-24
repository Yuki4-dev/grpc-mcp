#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { obj2String } from "./Common/Json.js";
import { Logger } from "./Common/Logger.js";
import { client } from "./client.js";
import { loader } from "./loader.js";
const server = new FastMCP({
    name: "GRPC Client",
    version: "1.0.0",
});
server.addTool({
    name: "sendRequest",
    description: "Send a request to a gRPC server",
    parameters: z.object({
        path: z.string().describe("Path to the proto file (Full path)"),
        address: z.string().describe("Address of the gRPC server (e.g., it2.trylion-customer-api.askul-it.com:443)"),
        service: z.string().describe("Service name (e.g., AddressService)"),
        method: z.string().describe("Method name (e.g., GetAddress)"),
        body: z.string().describe("Request body in JSON format"),
        headers: z.record(z.string()).optional().describe("Optional headers to include in the request"),
        config: z
            .object({
            deadLine: z.number().optional().describe("Deadline for the request in milliseconds"),
            SSL: z.boolean().optional().describe("Whether to use SSL for the request"),
        })
            .optional()
            .describe("Configuration options for the request"),
    }),
    execute: async (args) => {
        try {
            const res = await client.requestAsync(args);
            return obj2String(res, true);
        }
        catch (e) {
            Logger.error(e);
            return e instanceof Error ? e.message : "An unknown error occurred";
        }
    },
});
server.addTool({
    name: "loadProto",
    description: "Load a proto file and return its content",
    parameters: z.object({
        dir: z.string().describe("Directory containing the proto file (e.g., /path/to/proto)"),
    }),
    execute: async (args) => {
        try {
            const res = await loader.loadAsync(args.dir);
            return obj2String(res, true);
        }
        catch (e) {
            Logger.error(e);
            return e instanceof Error ? e.message : "An unknown error occurred";
        }
    },
});
server.addTool({
    name: "getMethodInformation",
    description: "Get information about methods in a proto file",
    parameters: z.object({
        path: z.string().describe("Path to the proto file (Full path)"),
        service: z.string().describe("Service name (e.g., AddressService)"),
        method: z.string().describe("Method name (e.g., GetAddress)"),
    }),
    execute: async (args) => {
        try {
            const res = await loader.getMethodAsync(args.path, args.service, args.method);
            return obj2String(res, true);
        }
        catch (e) {
            Logger.error(e);
            return e instanceof Error ? e.message : "An unknown error occurred";
        }
    },
});
server.start({
    transportType: "stdio",
});
