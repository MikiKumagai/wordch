# wordch Terraform

AWS に `wordch` の本番用リソースを作るためのたたき台。

作るもの:

- React 配信用の S3 static website bucket
- Spring Boot API 用の EC2
- PostgreSQL 用の RDS
- VPC、public/private subnets、security groups

## 使い方

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` の `db_password`、`ssh_allowed_cidr`、必要なら `key_name` を変更する。

```bash
terraform init
terraform plan
terraform apply
```

`apply` 後、`api_url` を使って React をビルドする。

```bash
cd ../client
REACT_APP_API_URL=http://example.compute.amazonaws.com:8080 npm run build
aws s3 sync build/ s3://<client_bucket_name> --delete
```

API jar は EC2 に配置して systemd を起動する。

```bash
cd ../server
./gradlew bootJar
scp build/libs/*.jar ec2-user@<app_public_ip>:/tmp/wordch.jar
ssh ec2-user@<app_public_ip> 'sudo mv /tmp/wordch.jar /opt/wordch/wordch.jar && sudo systemctl restart wordch'
```

## メモ

- RDS は private subnet に置き、EC2 からだけ 5432 を許可する。
- API の 8080 は S3 website から直接呼ぶ前提で公開する。
- HTTPS や独自ドメインを使う場合は、次の段階で CloudFront、ACM、Route 53、ALB を追加する想定。
