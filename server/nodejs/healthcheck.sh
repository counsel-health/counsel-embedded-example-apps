#!/bin/bash
# Start the server
npm start & NPM_PID=$! & sleep 5

URL="http://localhost:4003/health"

# check if the server is healthy
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS_CODE" -ne 200 ]; then
  echo "Healthcheck failed: Request to $URL failed with status code $STATUS_CODE"
  kill $NPM_PID 2>/dev/null || true # kill the server if it's running
  exit 1
fi

echo "Healthcheck passed"
kill $NPM_PID 2>/dev/null

exit 0