#!/bin/bash
set -eux

pushd $(dirname $0) >/dev/null
trap "popd > /dev/null" EXIT

cd ./../client

npm run build

aws s3 cp \
  ./build \
  s3://wordch-client/ \
  --recursive