📄 Available languages:
- [日本語](https://github.com/Yuki4-dev/grpc-mcp/blob/main/README.ja.md)

# grpc-mcp

grpc-mcp is an MCP server built with Node.js/TypeScript. It enables easy gRPC requests and Protocol Buffer file information retrieval.

## Features

- Retrieve service/method info from Protocol Buffer files
- Send requests to gRPC servers (with SSL, timeout, headers, etc.)
- Get response time statistics
- Operate via natural language from MCP clients or VSCode extensions

## Limitations

- This tool does NOT support gRPC streaming (server streaming, client streaming, or bidirectional streaming).
  Only single-request single-response (unary) RPCs are supported.

## Usage

### MCP Client Example

use npx.
```jsonc
{
  "servers": {
    "grpc-mcp-sample": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "grpc-mcp"]
    }
  }
}
```

or use install module.
```jsonc
{
  "servers": {
    "grpc-mcp-sample": {
      "type": "stdio",
      "command": "node",
      "args": ["C:~\\node_modules\\grpc-mcp\\dist\\index.js"]
    }
  }
}
```

### Start Server
```sh
node C:~\node_modules\grpc-mcp\dist\index.js
```

## Dependencies
- @grpc/grpc-js
- @grpc/proto-loader
- fastmcp
- zod

## MCP Tool Basic Operations

### 1. Load Proto Files
Specify the directory containing proto files to get service/method info.
```jsonc
{
  "tool": "loadProto",
  "parameters": {
    "dir": "C:\\Users\\proto"
  }
}
```

### 2. Get Method Information
Specify service/method to get request/response structure.
```jsonc
{
  "tool": "getMethodInformation",
  "parameters": {
    "path": "C:\\Users\\proto\\your.proto",
    "service": "YourService",
    "method": "YourMethod"
  }
}
```

### 3. Send gRPC Request
Specify proto, service, method, request body, SSL, timeout, etc.
```jsonc
{
  "tool": "sendRequest",
  "parameters": {
    "path": "C:\\Users\\proto\\your.proto",
    "address": "localhost:6565",
    "service": "YourService",
    "method": "YourMethod",
    "body": "{\"key\": \"value\"}",
    "config": {
      "SSL": false, // true: enabled, false: disabled
      "deadLine": 1000 // milliseconds
    }
  }
}
```
#### Response Example
```jsonc
{
  "analyze": {
    "time": 123 // response time (ms)
  },
  "response": {
    "ok": true,
    "body": "{...}" // response body (JSON string)
    // on failure:
    // "ok": false,
    // "error": { "code": 14, "details": "UNAVAILABLE" }
  }
}
```

## License
MIT

## MCP Tool Usage Examples

### Natural Language Usage Examples

- Send gRPC request
  - e.g. "Set id:123 in the request and call GetUser method of User service"
- Multiple requests/statistics
  - e.g. "Call GetUser of Hoge service 10 times and show average/max/min response time"
- Summarize/extract response
  - e.g. "Summarize user list in GetUser response"
  - e.g. "Show only error details if failed"
- Get method info
  - e.g. "Show request/response structure for Sample method of Sample service in sample.proto"

---

## For Developers

### Setup & Build
```sh
npm install
npm run build
```

### Lint & Format
```sh
npm run lint
npm run prettier:write
```

### Example Implementation
```javascript
// Import loader and client from grpc-mcp library
import { loader, client } from "grpc-mcp";

async function main() {
  // Load proto files from the proto directory
  const protoList = await loader.loadAsync("./proto/");
  const proto = protoList[0];
  const service = proto.services[0];
  const method = service.methods[0];

  // Get method information and print it
  const info = await loader.getMethodAsync(proto.path, service.name, method);
  console.log(info);

  // Send a gRPC request and print the response
  const response = await client.requestAsync({
    path: proto.path,
    address: "localhost:6565",
    service: service.name,
    method: method,
    body: JSON.stringify({ key: "value" }),
    config: { SSL: false },
  });
  console.log(response);
}

main();
```