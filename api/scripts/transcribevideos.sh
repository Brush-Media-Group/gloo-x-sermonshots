#!/bin/bash

API_URL="http://localhost:3000/videos/transcribe"
ACCESS_TOKEN="$1"
PAGE="$2"
LIMIT="$3"

if [[ -z "$ACCESS_TOKEN" || -z "$PAGE" || -z "$LIMIT" ]]; then
  echo "Usage: $0 <accessToken> <page> <limit>"
  exit 1
fi

# Make the POST request and capture the response
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"accessToken\":\"$ACCESS_TOKEN\",\"page\":$PAGE,\"limit\":$LIMIT}")

echo "$response" > "$(dirname "$0")/transcribed_videos.txt"

echo "IDs written to transcribed_videos.txt"