#!/bin/bash
echo "========================================================="
echo " Starting IntelliLearn Microservices & React UI "
echo "========================================================="
echo "Building and starting Docker containers..."

# Run docker compose in detached mode so we can also start streamlit if we want
# But usually seeing the logs is better for the user. We will run it attached.
docker compose up --build
