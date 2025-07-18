
# grpc-mcp

gRPCサーバーへのリクエスト送信や、Protocol Bufferファイルのロード・サービス情報の取得を行うNode.js/TypeScript製ライブラリです。
`fastmcp`をベースに、gRPCクライアント機能やスキーマバリデーション（zod）を組み合わせて、柔軟なgRPC通信を実現します。

## 主な機能

- gRPCサーバーへのリクエスト送信（アドレス・サービス・メソッド・リクエストボディを指定可能）
- Protocol Bufferファイルのロードとサービス・メソッド情報の取得
- JSON変換やロギングのユーティリティ
- TypeScriptによる型安全な実装

## 依存ライブラリ

- `@grpc/grpc-js`, `@grpc/proto-loader`（gRPC通信）
- `fastmcp`（MCPツール基盤）
- `zod`（バリデーション）
- `typescript`, `eslint`, `prettier`（開発用）

## セットアップ

```sh
npm install
```

## ビルド

```sh
npm run build
```

## コードチェック・整形

```sh
npm run lint
npm run prettier:write
```

## 使い方例

### gRPCリクエスト送信

```ts
import { client } from "./src/client";

const response = await client.requestAsync({
  path: "your.proto",
  address: "localhost:50051",
  service: "YourService",
  method: "YourMethod",
  body: JSON.stringify({ /* リクエスト内容 */ }),
  headers: { /* 任意 */ },
  config: { SSL: false }
});
console.log(response);
```

### Protocol Bufferファイルのロード

```ts
import { loader } from "./src/loader";

const protos = await loader.loadAsync("./protos");
console.log(protos);
```

## ライセンス

MIT

---

必要に応じて、詳細な使い方やAPI仕様を追記してください。
