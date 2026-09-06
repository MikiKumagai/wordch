# wordch

ワード当て系のオンラインボードゲーム

[このカードゲーム](https://arclightgames.jp/product/651wordocchi/)のルールをベースに、親とプレイヤーが同じ部屋に入り、WebSocketでゲーム進行を同期する

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

Python版APIを起動

```bash
cd server-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Reactクライアントを起動

```bash
cd client
npm install
npm start
```

ブラウザで `http://localhost:3000` を開く。`client/package.json` の `proxy` が `http://localhost:8080` を向いているため、ローカルではAPI URLを明示しなくても動作する。

## データ

Python版はSQLiteを使う。初回起動時に `server-python/wordch.sqlite3` が作成され、`db/initdb.d/csv/*.csv` から初期データが投入される。

DBファイルの保存先を変える場合は `WORDCH_SQLITE_PATH` を指定する。

```bash
export WORDCH_SQLITE_PATH=/path/to/wordch.sqlite3
```

Java版はPostgreSQLを使う。ローカルDBを作る場合は次を実行する。

```bash
./script/init_db.sh
```

## AWSデプロイ

Python版は [terraform-python/README.md](./terraform-python/README.md) を参照。EC2上でFastAPIをsystemdサービスとして動かし、SQLiteはEC2内のファイルとして保存する。

Java版は [terraform-java/README.md](./terraform-java/README.md) を参照。

## 注意

- HTTPSや独自ドメインはまだTerraformに含めていません。
- `server-python/wordch.sqlite3` や `.venv` はGit管理対象外。
