#!/bin/bash

# Define your ECR repository URL prefix
ECR_URL_PREFIX="637423273026.dkr.ecr.ap-south-1.amazonaws.com"

# Define an array of services and their respective tags
SERVICES=(
  "gateway:latest"
  "auth:latest"
  "administration:latest"
  "notify:latest"
  "assessment:latest"
  "classroom:latest"
  "course:latest"
  "ecommerce:latest"
  "questionbank:latest"
  "attempt:latest"
)

# Loop through each service and tag/push to ECR
for service in "${SERVICES[@]}"
do
  # Tag the image
  docker tag "${ECR_URL_PREFIX}/${service}" "${ECR_URL_PREFIX}/${service}"

  # Push the image to ECR
  docker push "${ECR_URL_PREFIX}/${service}"
done
