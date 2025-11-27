#!/bin/sh
set -e

mkdir -p ./database
touch ./database/db.sqlite
chmod 666 ./database/db.sqlite

npm run drizzle-generate

npm run drizzle-migrate

npm run drizzle-studio-docker &

npm run dev -- --ip 0.0.0.0
