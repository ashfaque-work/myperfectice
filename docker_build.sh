#!/bin/bash

# Define an array of services and their respective tags
SERVICES=(
  "gateway-production"
  "auth-production"
  "administration-production"
  "notify-production"
  "assessment-production"
  "classroom-production"
  "course-production"
  "ecommerce-production"
  "questionbank-production"
  "attempt-production"
)

# Loop through each service and tag/push to ECR
for service in "${SERVICES[@]}"
do
  # Tag the image
  docker-compose build "${service}"
done
