terraform {
  # Terraform 本体のバージョン
  required_version = ">= 1.6.0"

  # 使用するプロバイダー（外部サービスを操作するためのプラグイン）のソースとバージョン
  # terraform init のときに使われる
  required_providers {
    # AWSプロバイダー
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    # ランダムプロバイダー（S3 bucket名の末尾に使う）
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# AWS provider の設定
# terraform plan / terraform apply のときに使われる
provider "aws" {
  region = var.aws_region
}
