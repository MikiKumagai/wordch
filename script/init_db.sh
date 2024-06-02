#!/bin/bash
set -eux

pushd $(dirname $0) >/dev/null
trap "popd > /dev/null" EXIT

PROJECT_NAME="wordch"
ROOT_DIR=./..
DOCKER_COMPOSE_PATH="${ROOT_DIR}/docker/docker-compose.yaml"
OPTIONS="--project-name ${PROJECT_NAME} --project-directory ${ROOT_DIR} --file ${DOCKER_COMPOSE_PATH}"

docker compose \
  ${OPTIONS} down \
  --volumes
docker compose \
  ${OPTIONS} up \
  --detach
