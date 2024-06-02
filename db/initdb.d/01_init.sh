#!/bin/bash

BASE_DIR="$(dirname $0)"

# データベース接続情報
# export PGHOST="localhost"
export PGPORT="5432"
export PGUSER="developer"
# export PGPASSWORD="1234"
export PGDATABASE="wordch"

# SQLファイルのパス
SQL_DIR="${BASE_DIR}/sql"
CREATE_TABLE_FILE="${SQL_DIR}/create-table.sql"

# psqlコマンドを使用してSQLファイルを実行
psql -f $CREATE_TABLE_FILE

# テストデータの挿入
# CSV ファイルのディレクトリパス
CSV_DIR="${BASE_DIR}/csv"
# ループで COPY コマンドを生成して実行
for f in $(ls $CSV_DIR); do
  table="${f%.csv}"
  psql -c "\COPY ${table} FROM '${CSV_DIR}/${f}' WITH (FORMAT csv, HEADER true);"
  psql -c "SELECT setval('${table}_id_seq', (SELECT MAX(id) FROM ${table}));"
done