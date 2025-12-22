# MCP Server grpc-mcp README for AI instructions

This document collects procedures, templates, and examples to operate the grpc-mcp by AI. The AI can automatically select and execute the best gRPC request from natural language instructions.

---

## 1. Preparation

Please ask the user to provide the following information required for execution.

- **Proto directory**: Absolute path to the directory containing proto files (comma-separated allowed)
- **Server address**: gRPC server URL (host:port)
- **SSL**: true (use)/false (do not use) (default: true)
- **Timeout**: milliseconds (default: 180000)
- **Default headers**: e.g. `{ "X-HOGE-HEADER": "1234", "X-FOO-HEADER": "XXX" }` (optional)
- **Proxy usage**: If using a proxy, set `HTTP_PROXY` or `HTTPS_PROXY` environment variables on the machine running this tool

#### Input template

Use this template when asking the user to provide inputs:

```
- Proto directory: C:/path/to/proto
- Server address: host:port
- SSL: true
- Timeout: 180000
- Default headers:
  { "X-HOGE-HEADER": "1234", "X-FOO-HEADER": "XXX" }
```

---

## 2. Loading proto files

- Use the `loadProto` function with the proto directory specified in the preparation step to load proto information (if multiple directories are provided, call `loadProto` for each).

---

## 3. API request procedure

1. From the proto information obtained by loading the proto files, select the target gRPC method.
2. Call `getMethodInformation` to obtain detailed information about the request and response (fields, types, descriptions, etc.).
3. Execute the gRPC API with the specified parameters by calling `sendRequest`.

---

## 4. Example natural language requests

- "Get the foo name for hogeId 'AAA'"
- "Use the response field 'HogeKey' from SampleAPI to call AnotherAPI"

You can issue requests in natural language like the above. The AI will automatically select the most appropriate gRPC service, method, and request.

---

## 5. API response analysis format

Responses are returned in the following format:

```json
{
  "analyze": {
    "time": 1728701234567 // UNIX timestamp in milliseconds (same as Date.now())
  },
  "response": {
    "ok": true,           // false if an error occurred
    "body": ""          // response returned as a JSON string
  }
}
```

- If `ok` is false, error details are stored in an `error` field.
- `body` is returned as a JSON string; parse it if you need to access fields.

---

## 6. Field descriptions and Japanese-language explanations

- You can also ask the AI for field explanations and response content summaries in Japanese.
- Example: `"hogeId": { "value": "1234" } // hogeId (numeric string)`

---

## 7. Troubleshooting

- For connection or business logic errors, the AI will explain probable causes and countermeasures.
- You can ask the AI to check proto/method information before sending requests.

---

## 8. Additional example requests

You can also request the following:

- Retrieve data using an arbitrary proto file, service, method, and request body
- Explain each proto field and type in Japanese, or summarize gRPC responses in Japanese
- Create sample request bodies for you
- Use obtained API responses to call other APIs automatically
- Repeatedly call the API with multiple parameters and use `analyze.time` (execution time) to measure API performance
- Infer and describe API specifications from request/response contents
- Use design documents or API specification drafts to construct request items and call APIs


## 9. Selecting APIs and proposing request examples

If you don't know which API, method, or request body will obtain the information you want, describe the information you need in natural language and the AI will propose the most suitable gRPC service, method, and example request.

- When you say what information you want to retrieve (for example, "I want to search for a username"), the AI will suggest appropriate gRPC service, method, and request examples.
- Even if proto files or API specifications are unknown, the AI will attempt to infer the best API and request to use and guide you.

---

## 10. Constraints and notes

- This tool does not support gRPC streaming (server streaming, client streaming, or bidirectional streaming).
  Only unary RPC (single request, single response) is supported.

