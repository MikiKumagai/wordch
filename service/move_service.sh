#!/bin/bash
set -eux

pushd $(dirname $0) >/dev/null
trap "popd > /dev/null" EXIT

sudo mv ~/wordch.jar /wordch.jar
sudo mv ~/service/wordch.service /etc/systemd/system/wordch.service

# サービスの起動
sudo systemctl daemon-reload
sudo systemctl enable wordch
sudo systemctl restart wordch