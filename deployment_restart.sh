#!/bin/bash

# Define an array of services and their respective tags
SERVICES=(
  "gateway"
  "auth"
  "administration"
  "notify"
  "assessment"
  "classroom"
  "course"
  "ecommerce"
  "questionbank"
  "attempt"
)

# Loop through each service and tag/push to ECR
for service in "${SERVICES[@]}"
do
  # Tag the image
  kubectl rollout restart deployment "${service}"
done
