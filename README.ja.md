
# grpc-mcp
gRPCサーバーへのリクエスト送信や、Protocol Bufferファイルの情報の取得を行うNode.js/TypeScript製のMCPサーバーです。

## 主な機能

- Protocol Bufferファイルのサービス/メソッド情報の取得
- gRPCサーバーへのリクエスト送信
- レスポンスの応答時間の取得
- MCPクライアントやVSCode拡張から自然言語で操作可能

## 制約

- 本ツールは gRPC のストリーミング（サーバーストリーミング、クライアントストリーミング、双方向ストリーミング）には対応していません。
  単一リクエスト・単一レスポンス型（Unary）のみサポートしています。

## AI 指示用プロンプト

このリポジトリには、AI に自然言語で操作させるためのプロンプトテンプレートが含まれています。実装や利用手順の自動化に役立つ説明・テンプレートは以下のファイルをご確認ください。

- 英語: [grpc-mcp.prompt.md](https://github.com/Yuki4-dev/grpc-mcp/blob/main/grpc-mcp.prompt.md)
- 日本語: [grpc-mcp.ja.prompt.md](https://github.com/Yuki4-dev/grpc-mcp/blob/main/grpc-mcp.ja.prompt.md)

## Usage

### MCP クライアントからの使用
upxコマンドを使用する場合
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

インストールしたモジュールを使用する場合
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

### サーバーの起動
```sh
node C:~\node_modules\grpc-mcp\dist\index.js
```

## 依存ライブラリ
- @grpc/grpc-js
- @grpc/proto-loader
- fastmcp
- zod

## MCPツールの基本操作

### 1. Protoファイルのロード
Protoファイルが配置されているディレクトリを指定して、サービス・メソッド情報を取得します。
```jsonc
{
  "tool": "loadProto",
  "parameters": {
    "dir": "C:\\Users\\proto"
  }
}
```

### 2. メソッド情報の取得
サービス名・メソッド名を指定して、詳細なリクエスト/レスポンス構造を取得します。
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

### 3. gRPCリクエスト送信
Protoファイル・サービス・メソッド・リクエスト内容・SSL有無・タイムアウト等を指定してリクエストを送信します。
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
      "SSL": false, // True：有効、False：無効
      "deadLine": 1000 // ミリ秒
    }
  }
}
```
#### レスポンス
応答時間とレスポンスをJSON形式で取得できます。
```jsonc
{
  "analyze": {
    "time": 123 // 応答時間（ミリ秒）
  },
  "response": {
    "ok": true,
    "body": "{...}" // サーバーからのレスポンス内容（JSON文字列）
    // 失敗時は
    // "ok": false,
    // "error": { "code": 14, "details": "UNAVAILABLE" }
  }
}
```

## ライセンス
MIT

## MCPツールの利用例

### MCPツールの利用例（自然言語で指示可能）

- gRPCリクエスト送信
  - 例）「id:123をリクエストに設定してUserサービスのGetUserメソッドを呼び出して」

- 複数回リクエスト・統計取得
  - 例）「HogeサービスのGetUserを10回呼び出して、平均・最大・最小応答時間を出して」

- レスポンス内容の要約・抽出
  - 例）「GetUserのレスポンスのuser一覧を要約して」
  - 例）「エラーの場合はエラー内容だけ表示して」

- メソッド情報の取得
  - 例）「sample.protoのSampleサービスのSampleメソッドのリクエスト・レスポンス構造を表示して」

---

## 開発者向け

### セットアップ・ビルド

```sh
npm install
npm run build
```

### コードチェック・整形

```sh
npm run lint
npm run prettier:write
```

### 実装例
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
    config: { SSL: true },
  });
  console.log(response);
}

main();

```