# 変数作るクラス

# terraform.tfvarsに設定
variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
}

variable "project" {
  description = "Project name used for resource names and tags."
  type        = string
  default     = "wordch"
}

variable "environment" {
  description = "Environment name used for resource names and tags."
  type        = string
  default     = "prd"
}

# VPC全体のIPアドレス範囲のCIDR表記
variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  # CIDR表記:10.20.0.0/24 = 10.20.x.x
  default = "10.20.0.0/16"
}

# publicサブネット（vpc_cidrの中から設定）
variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  # CIDR表記:10.20.0.0/24 = 10.20.0.x
  # CIDR表記:10.20.1.0/24 = 10.20.1.x
  default = ["10.20.0.0/24", "10.20.1.0/24"]
}

# EC2にSSH接続できる送信元IP範囲
# terraform.tfvarsに設定
variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into the app EC2 instance."
  type        = string
}

# APIにリクエストを送れる送信元IP範囲（全体公開）
# terraform.tfvarsに設定
variable "app_allowed_cidr" {
  description = "CIDR block allowed to access the FastAPI app port."
  type        = string
}

# terraform.tfvarsに設定
# default = nullだと設定無くても動くけど、SSH接続できなくなる
variable "key_name" {
  description = "Existing EC2 key pair name for SSH. Leave null to launch without a key pair."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the FastAPI app."
  type        = string
  default     = "t3.micro"
}

variable "sqlite_path" {
  description = "SQLite database file path on the app EC2 instance."
  type        = string
  default     = "/var/lib/wordch/wordch.sqlite3"
}

# nullの場合は main.tf の locals の client_bucket_name で
# ランダムなsuffix付きで自動生成
variable "client_bucket_name" {
  description = "S3 bucket name for the React static website. Leave null to generate one."
  type        = string
  default     = null
}

# APIがCORSで許可するURLの一部
# 空の場合は main.tf の locals の cors_allowed_origins で
# このTerraformで作るURL（client_website_url）を自動で使う
variable "cors_allowed_origins" {
  description = "CORS origins for the API. Leave empty to allow the generated S3 website endpoint."
  type        = list(string)
  default     = []
}
