#!/bin/bash
set -eux

pushd $(dirname $0) >/dev/null
trap "popd > /dev/null" EXIT

PROJECT_NAME="wordch"
VERSION="0.0.1-SNAPSHOT"
EC2_USER="ec2-user"
EC2_HOST="ec2-15-152-30-0.ap-northeast-3.compute.amazonaws.com"

cd ./../server

# jarファイルをビルド
./gradlew build

# jarファイルをEC2にコピー
scp \
  -i ~/.ssh/wordch.pem \
  ./build/libs/${PROJECT_NAME}-${VERSION}.jar \
  ${EC2_USER}@${EC2_HOST}:~/wordch.jar

# サービスディレクトリをEC2にコピー
cd ./..
scp \
  -r \
  -i ~/.ssh/wordch.pem \
  ./service \
  ${EC2_USER}@${EC2_HOST}:~/

# サービスファイルを移動 & サービス起動
ssh \
  -i ~/.ssh/wordch.pem \
  ${EC2_USER}@${EC2_HOST} \
  "bash ~/service/move_service.sh"