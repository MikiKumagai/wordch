output "app_public_ip" {
  description = "Public IP address of the Spring Boot EC2 instance."
  value       = aws_instance.app.public_ip
}

output "api_url" {
  description = "Base URL for REACT_APP_API_URL."
  value       = "http://${aws_instance.app.public_dns}:8080"
}

output "client_bucket_name" {
  description = "S3 bucket for the React build artifacts."
  value       = aws_s3_bucket.client.bucket
}

output "client_website_url" {
  description = "S3 static website endpoint."
  value       = local.client_website_url
}

output "db_endpoint" {
  description = "RDS PostgreSQL endpoint."
  value       = aws_db_instance.postgres.endpoint
}
