variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "ap-northeast-3"
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

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.20.0.0/24", "10.20.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.20.10.0/24", "10.20.11.0/24"]
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into the app EC2 instance."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_allowed_cidr" {
  description = "CIDR block allowed to access the Spring Boot app port."
  type        = string
  default     = "0.0.0.0/0"
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH. Leave null to launch without a key pair."
  type        = string
  default     = null
}

variable "instance_type" {
  description = "EC2 instance type for the Spring Boot app."
  type        = string
  default     = "t3.micro"
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "wordch"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "kmmk"
}

variable "db_password" {
  description = "PostgreSQL master password."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated RDS storage in GiB."
  type        = number
  default     = 20
}

variable "client_bucket_name" {
  description = "S3 bucket name for the React static website. Leave null to generate one."
  type        = string
  default     = null
}

variable "cors_allowed_origins" {
  description = "CORS origins for the API. Leave empty to allow the generated S3 website endpoint."
  type        = list(string)
  default     = []
}
