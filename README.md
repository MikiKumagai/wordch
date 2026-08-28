# wordch

ワード当て系のオンラインボードゲームです。

[このカードゲーム](https://arclightgames.jp/product/651wordocchi/)のルールをベースに、親とプレイヤーが同じ部屋に入り、WebSocketでゲーム進行を同期します。

## 特徴

- 部屋IDごとに親とプレイヤーが参加
- 親がテーマを選び、プレイヤーがワードを投稿
- 回答、勝者選択、最終回答をリアルタイムに配信
- 管理画面でテーマの有効/無効切り替えと削除が可能
- Java版バックエンドとPython版バックエンドを併設

## 構成

```text
client/            Reactクライアント
server-java/       Spring Boot + MyBatis版API
server-python/     FastAPI + SQLite版API
db/initdb.d/csv/   テーマと初期ワードのCSV
terraform-java/    Java版をAWSへ置くTerraform
terraform-python/  Python版をAWSへ置くTerraform
```

## 使用技術

- フロントエンド: React / React Bootstrap / axios / SockJS / STOMP
- Javaバックエンド: Spring Boot / MyBatis / PostgreSQL
- Pythonバックエンド: FastAPI / SQLite / WebSocket
- インフラ: AWS EC2 / S3 static website / Terraform

## ローカル起動

Python版APIを起動します。

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Reactクライアントを起動します。

```bash
cd client
npm install
npm start
```

ブラウザで `http://localhost:3000` を開きます。`client/package.json` の `proxy` が `http://localhost:8080` を向いているため、ローカルではAPI URLを明示しなくても動かせます。

## データ

Python版はSQLiteを使います。初回起動時に `server-python/wordch.sqlite3` が作成され、`db/initdb.d/csv/*.csv` から初期データが投入されます。

DBファイルの保存先を変える場合は `WORDCH_SQLITE_PATH` を指定します。

```bash
export WORDCH_SQLITE_PATH=/path/to/wordch.sqlite3
```

Java版はPostgreSQLを使います。ローカルDBを作る場合は次を実行します。

```bash
./script/init_db.sh
```

## API

HTTP:

- `GET /ping`
- `GET /api/admin`
- `GET /api/admin/edit/{theme_id}`
- `GET /api/admin/delete/{theme_id}`

WebSocket/STOMP:

- 接続先: `/gs-guide-websocket`
- publish: `/app/start/{roomId}`
- publish: `/app/prepared/{roomId}`
- publish: `/app/role/{roomId}`
- publish: `/app/answer/{roomId}`
- publish: `/app/winner/{roomId}`
- publish: `/app/final/{roomId}`
- publish: `/app/final/select/{roomId}`
- publish: `/app/final/theme/{roomId}`

配信先は対応する `/topic/.../{roomId}` です。

## AWSデプロイ

Python版は [terraform-python/README.md](./terraform-python/README.md) を参照してください。EC2上でFastAPIをsystemdサービスとして動かし、SQLiteはEC2内のファイルとして保存します。

Java版は [terraform-java/README.md](./terraform-java/README.md) を参照してください。

## 注意

- HTTPSや独自ドメインはまだTerraformに含めていません。
- `server-python/wordch.sqlite3` や `.venv` はGit管理対象外です。
