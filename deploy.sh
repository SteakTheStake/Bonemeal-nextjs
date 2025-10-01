#!/usr/bin/env bash
set -e
APP_DIR=/var/html/Bonemeal-nextjs/

cd $APP_DIR

##curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
##  -H "Authorization: Bearer $API_TOKEN" \
##  -H "Content-Type: application/json" \
##  --data '{"purge_everything":true}'


npm ci
npm run build                  # produces new standalone
pm2 reload bonemeal            # zero-downtime reload
