# wordch Terraform for Python

AWSにPython版 `wordch` を配置するためのTerraformです。FastAPIサーバーはEC2上でsystemdサービスとして起動し、SQLite DBはEC2内のファイルとして保存します。

## 作るもの

- React配信用のS3 static website bucket
- FastAPI API用のEC2
- SQLite DB保存用ディレクトリ
- VPC、public subnets、Internet Gateway、route table
- EC2用security group

RDSは作りません。Python版はSQLiteを使うため、DB用subnetや5432番ポートも不要です。

## 前提

- Terraform CLI
- AWS CLIの認証設定
- EC2へSSHするためのKey Pair
- ReactのビルドとS3 syncに使うAWS権限

## 初期設定

```bash
cd terraform-python
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` の主な項目:

| 変数 | 説明 |
| --- | --- |
| `aws_region` | デプロイ先リージョン |
| `ssh_allowed_cidr` | SSHを許可する送信元CIDR |
| `app_allowed_cidr` | API 8080番を許可する送信元CIDR |
| `key_name` | EC2 Key Pair名 |
| `sqlite_path` | EC2上のSQLite DB保存先 |
| `client_bucket_name` | 任意。指定しない場合はランダムsuffix付きで作成 |

## Terraform実行

```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

`apply` 後に確認するoutput:

- `app_public_ip`: SSH接続先
- `api_url`: Reactの `REACT_APP_API_URL`
- `client_bucket_name`: React buildを配置するS3 bucket
- `client_website_url`: 公開される画面URL
- `sqlite_path`: EC2上のSQLite DBファイルパス

## APIデプロイ

FastAPIアプリとCSV初期データをEC2へ配置します。

```bash
cd ..
rsync -av --delete --exclude .venv --exclude '*.sqlite3' --exclude '*.db' server-python/ ec2-user@<app_public_ip>:/tmp/server-python/
ssh ec2-user@<app_public_ip> 'mkdir -p /tmp/db/initdb.d/csv'
rsync -av db/initdb.d/csv/ ec2-user@<app_public_ip>:/tmp/db/initdb.d/csv/
ssh ec2-user@<app_public_ip> '
  sudo rm -rf /opt/wordch/server-python /opt/wordch/db
  sudo mkdir -p /opt/wordch/server-python /opt/wordch/db/initdb.d/csv
  sudo cp -a /tmp/server-python/. /opt/wordch/server-python/
  sudo cp -a /tmp/db/initdb.d/csv/. /opt/wordch/db/initdb.d/csv/
  cd /opt/wordch/server-python
  sudo python3 -m venv .venv
  sudo .venv/bin/pip install -r requirements.txt
  sudo systemctl restart wordch
'
```

確認:

```bash
curl http://<app_public_ip>:8080/ping
curl http://<app_public_ip>:8080/api/admin
```

ログ確認:

```bash
ssh ec2-user@<app_public_ip> 'sudo journalctl -u wordch -f'
```

## Reactデプロイ

Terraform outputの `api_url` を使ってReactをビルドし、S3へ配置します。

```bash
cd client
REACT_APP_API_URL=http://example.compute.amazonaws.com:8080 npm run build
aws s3 sync build/ s3://<client_bucket_name> --delete
```

## SQLite運用メモ

- SQLite DBは `sqlite_path` に保存されます。
- EC2を作り直すとDBも消えるため、必要な場合はバックアップしてください。
- 初回起動時、DBが空なら `db/initdb.d/csv/*.csv` から初期データが入ります。
- 既にデータがある場合、CSV seedはスキップされます。

バックアップ例:

```bash
ssh ec2-user@<app_public_ip> 'sudo cp /var/lib/wordch/wordch.sqlite3 /tmp/wordch.sqlite3'
scp ec2-user@<app_public_ip>:/tmp/wordch.sqlite3 ./wordch.sqlite3.backup
```

## 注意

- APIの8080番はS3 websiteから直接呼ぶ前提で公開しています。
- HTTPSや独自ドメインはまだ含めていません。必要ならCloudFront、ACM、Route 53、ALBを追加します。
- 既にRDS付きの古い `terraform-python` をapply済みの場合、現在の構成をapplyするとRDS関連リソースは削除対象になります。
