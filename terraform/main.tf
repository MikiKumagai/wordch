locals {
  # リソース名のprefix
  name_prefix = "${var.project}-${var.environment}"

  # バケット名が指定されていればそれを使い、未指定ならランダムsuffix付きで作る
  client_bucket_name = coalesce(var.client_bucket_name, "${local.name_prefix}-client-${random_id.bucket_suffix.hex}")

  # 画面のURL
  client_website_url = "http://${local.client_bucket_name}.s3-website.${var.aws_region}.amazonaws.com"

  # APIのCORSで許可するオリジン
  cors_allowed_origins = length(var.cors_allowed_origins) > 0 ? join(",", var.cors_allowed_origins) : local.client_website_url

  # AWS コンソール上で表示
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# 利用可能なAvailability Zoneを動的に取得
data "aws_availability_zones" "available" {
  # デフォルトだけど明示しておく
  state = "available"
}

# 下記の条件に合う最新のOS（AMI）の情報を自動で探して取得する
# 「Amazon Linux 2023」
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  # 「x86_64（Intel/AMD系）」IntelやAMDの、一般的な64ビットCPU向けのシステム
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  # 「HVM仮想化」ハードウェアの利点を活かした高速な仮想化の仕組み
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# S3 bucketは一意である必要があるので、
# 名前衝突を避けるため、バケット名の末尾にランダム値を付ける
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# VPCの設定
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  # DNS名の設定
  # DNS = ドメインをIPアドレスに変換するもの
  enable_dns_hostnames = true
  enable_dns_support   = true

  # AWSのコンソールで表示 
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

# VPCをインターネットへ接続する
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  # AWSのコンソールで表示 
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_subnet" "public" {
  # cidrsの数だけサブネットを作る
  count = length(var.public_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  # このサブネットに起動したEC2にパブリックIPを自動付与
  map_public_ip_on_launch = true

  # AWSのコンソールで表示 
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-${count.index + 1}"
  })
}

resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-${count.index + 1}"
  })
}

# publicサブネット用のルートテーブル（internet_gatewayとつなぐ）
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

# 作成したpublicサブネットにpublicルートテーブルを関連付ける
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# EC2（app）に付ける 仮想ファイアウォール（security_group）
resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app-sg"
  description = "Security group for the wordch Spring Boot app"
  vpc_id      = aws_vpc.main.id

  # SSH接続を許可
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  # 8080番ポートへの接続を許可
  ingress {
    description = "Spring Boot API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.app_allowed_cidr]
  }

  # EC2 → 外部の通信はすべて許可
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app-sg"
  })
}

# RDS（db）に付ける 仮想ファイアウォール（security_group）
resource "aws_security_group" "db" {
  name        = "${local.name_prefix}-db-sg"
  description = "Security group for the wordch PostgreSQL database"
  vpc_id      = aws_vpc.main.id

  # 5432番ポートへの接続をEC2からだけ許可
  # 同じVPC内にある別のリソース間はsecurity_groupsを使う
  ingress {
    description     = "PostgreSQL from app"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-sg"
  })
}

# RDSは複数サブネットを指定する必要があるため、privateサブネットをまとめる
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-subnets"
  })
}

# DBの定義
resource "aws_db_instance" "postgres" {
  identifier             = "${local.name_prefix}-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  # falseはパブリックIPを持たせない → privateサブネット内に閉じる
  publicly_accessible = false

  # trueはterraform destroy時に最終snapshotを作らず削除する
  # TODO: falseはお金がかかるのでtrueとして、別途データ保持する仕組み用意したい
  skip_final_snapshot = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db"
  })
}

# APIの定義（どのサブネット使うか、どのOS使うかとか設定）
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type

  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.app.id]

  key_name                    = var.key_name
  # EC2インスタンス作成時にパブリックIPアドレスを自動で割り当てる
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/templates/user_data.sh.tftpl", {
    db_host              = aws_db_instance.postgres.address
    db_name              = var.db_name
    db_username          = var.db_username
    db_password          = var.db_password
    cors_allowed_origins = local.cors_allowed_origins
  })

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app"
  })
}

# S3バケットの定義
resource "aws_s3_bucket" "client" {
  bucket = local.client_bucket_name

  tags = merge(local.common_tags, {
    Name = local.client_bucket_name
  })
}

# インデックスページやエラーページ、リダイレクトルールを設定
resource "aws_s3_bucket_website_configuration" "client" {
  bucket = aws_s3_bucket.client.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3バケットへの公開制限を設定
resource "aws_s3_bucket_public_access_block" "client" {
  bucket = aws_s3_bucket.client.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

# S3バケット内のオブジェクトに対する詳細なアクセス権限を制御
resource "aws_s3_bucket_policy" "client_public_read" {
  bucket = aws_s3_bucket.client.id
  # 下のリソースをJSON形式にしたもの
  policy = data.aws_iam_policy_document.client_public_read.json

  # 上のリソースに依存
  depends_on = [aws_s3_bucket_public_access_block.client]
}

# policy JSON を生成
data "aws_iam_policy_document" "client_public_read" {
  statement {
    sid = "PublicReadGetObject"

    # 全員
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    # objectの読み取りだけ許可
    actions = ["s3:GetObject"]

    # bucket配下のすべてのobject
    resources = ["${aws_s3_bucket.client.arn}/*"]
  }
}
