# wordch FastAPI server

Spring Boot 版の `server-java` と同じ API/リアルタイム通知を FastAPI で実装したサーバーです。

## 起動

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

DB 接続先は `WORDCH_DATABASE_URL` で変更できます。

```bash
export WORDCH_DATABASE_URL=postgresql://kmmk:uwfyzcyr@localhost:5432/wordch
```

ローカルDBが未作成の場合は、リポジトリルートから既存の初期化スクリプトを実行してください。

```bash
./script/init_db.sh
```

## 対応エンドポイント

- `GET /ping`
- `GET /api/admin`
- `GET /api/admin/edit/{theme_id}`
- `GET /api/admin/delete/{theme_id}`
- `GET /gs-guide-websocket/info`
- `WS /gs-guide-websocket/{server_id}/{session_id}/websocket`
- `WS /gs-guide-websocket/websocket`

WebSocket は既存 React クライアントの `SockJS` + `@stomp/stompjs` に合わせた簡易 SockJS/STOMP 互換です。
