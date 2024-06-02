#!/bin/bash

cd server
echo "mybatis generatorによってファイルを生成します"
./gradlew mbGenerator
