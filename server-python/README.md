# wordch FastAPI server

`server-java` と同じHTTP APIとリアルタイム通知をFastAPIで実装したサーバーです。Reactクライアントは既存の `SockJS` + `@stomp/stompjs` のまま接続できます。

## 役割

- 管理画面向けのテーマ一覧、編集、削除APIを提供
- ゲーム進行用のSTOMPメッセージを受け取り、部屋ごとに配信
- SQLiteのテーブル作成とCSV初期データ投入を起動時に実行
- 親/プレイヤーの参加状態をメモリ上で管理

## ディレクトリ

```text
app/main.py     FastAPIアプリの作成、CORS、startup処理
app/config.py   環境変数と定数
app/routes.py   HTTP/WebSocketエンドポイント
app/db.py       SQLite接続、テーブル作成、テーマ/初期ワード取得
app/rooms.py    部屋ごとの親/プレイヤー状態
app/stomp.py    SockJS/STOMP互換の受信、配信、フレーム処理
```

## 起動

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

疎通確認:

```bash
curl http://localhost:8080/ping
curl http://localhost:8080/api/admin
```

## SQLite

DBファイルは初回起動時に自動作成されます。デフォルトは `server-python/wordch.sqlite3` です。

保存先を変える場合:

```bash
export WORDCH_SQLITE_PATH=/var/lib/wordch/wordch.sqlite3
```

初期データはリポジトリルートの次のCSVから投入します。

- `db/initdb.d/csv/theme.csv`
- `db/initdb.d/csv/default_value.csv`

既にテーブルにデータがある場合、起動時seedはスキップします。既存データを上書きしないためです。

## 環境変数

| 変数 | デフォルト | 説明 |
| --- | --- | --- |
| `WORDCH_SQLITE_PATH` | `server-python/wordch.sqlite3` | SQLite DBファイルの保存先 |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | CORSで許可するOrigin。複数指定はカンマ区切り |

## HTTP API

| Method | Path | 内容 |
| --- | --- | --- |
| `GET` | `/ping` | ヘルスチェック |
| `GET` | `/api/admin` | テーマ一覧を取得 |
| `GET` | `/api/admin/edit/{theme_id}` | テーマの `active` を切り替え |
| `GET` | `/api/admin/delete/{theme_id}` | テーマを削除 |
| `GET` | `/gs-guide-websocket/info` | SockJS接続前情報 |

## WebSocket/STOMP

Reactクライアントは `/gs-guide-websocket` にSockJSで接続します。サーバー側ではSockJS互換URLと、テスト用の素のWebSocket URLを受け付けます。

| 種別 | Path |
| --- | --- |
| SockJS互換 | `/gs-guide-websocket/{server_id}/{session_id}/websocket` |
| 素のWebSocket | `/gs-guide-websocket/websocket` |

publish先:

| Destination | 配信先 | 内容 |
| --- | --- | --- |
| `/app/start/{roomId}` | `/topic/start/{roomId}` | テーマ候補と初期ワードを配信 |
| `/app/prepared/{roomId}` | `/topic/prepared/{roomId}` | 選択テーマを配信 |
| `/app/role/{roomId}` | `/topic/role_amount/{roomId}` | 親とプレイヤー一覧を配信 |
| `/app/answer/{roomId}` | `/topic/answer/{roomId}` | 新しい回答を配信 |
| `/app/winner/{roomId}` | `/topic/winner/{roomId}` | 勝者を配信 |
| `/app/final/{roomId}` | `/topic/final/{roomId}` | 最終回答を配信 |
| `/app/final/select/{roomId}` | `/topic/final/select/{roomId}` | 最終勝者を配信 |
| `/app/final/theme/{roomId}` | `/topic/final/theme/{roomId}` | 最終テーマ表示フラグを配信 |

## 開発メモ

- `rooms.py` の役職状態はメモリ管理なので、サーバー再起動で消えます。
- `stomp.py` は既存クライアント互換のための簡易STOMP実装です。外部ブローカーは使っていません。
- `server-python/wordch.sqlite3`、`.venv`、`__pycache__` はGit管理対象外です。

## 検証

```bash
python3 -m py_compile app/*.py
```
