# wordch Terraform

AWS に `wordch` の本番用リソースを作るためのたたき台です。

作るもの:

- React 配信用の S3 static website bucket
- FastAPI API 用の EC2
- EC2 ローカルの SQLite 保存先
- VPC、public subnets、security group

## 使い方

```bash
cd terraform-python
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` の `ssh_allowed_cidr`、必要なら `key_name` や `sqlite_path` を変更します。

```bash
terraform init
terraform plan
terraform apply
```

`apply` 後、`api_url` を使って React をビルドします。

```bash
cd ../client
REACT_APP_API_URL=http://example.compute.amazonaws.com:8080 npm run build
aws s3 sync build/ s3://<client_bucket_name> --delete
```

FastAPI アプリは EC2 に配置して、仮想環境を作成してから systemd を起動します。

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

## メモ

- SQLite は EC2 の `sqlite_path` に保存します。EC2を作り直すとDBも消えるため、必要なら別途バックアップしてください。
- API の 8080 は S3 website から直接呼ぶ前提で公開しています。
- HTTPS や独自ドメインを使う場合は、次の段階で CloudFront、ACM、Route 53、ALB を追加する想定です。
