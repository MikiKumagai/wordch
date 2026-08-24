# terraform apply の結果表示

# EC2のpublic IP
output "app_public_ip" {
  description = "Public IP address of the FastAPI EC2 instance."
  value       = aws_instance.app.public_ip
}

# API側のURL（REACT_APP_API_URLはReactアプリでの環境変数）
output "api_url" {
  description = "Base URL for REACT_APP_API_URL."
  value       = "http://${aws_instance.app.public_dns}:8080"
}

# S3 bucket（ファイルを保存するための入れ物）名
output "client_bucket_name" {
  description = "S3 bucket for the React build artifacts."
  value       = aws_s3_bucket.client.bucket
}

# 画面のURL
output "client_website_url" {
  description = "S3 static website endpoint."
  value       = local.client_website_url
}

# SQLite DB のパス
output "sqlite_path" {
  description = "SQLite database file path on the app EC2 instance."
  value       = var.sqlite_path
}
