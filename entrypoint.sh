#!/bin/sh
# Script ini dieksekusi oleh Nginx Alpine secara otomatis

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV = {
  API_BASE_URL: "${API_BASE_URL}",
  WS_BASE_URL: "${WS_BASE_URL}"
};
EOF
