#!/bin/sh

# This script is meant to be invoked via runit (installed in /etc/service/nginx/run), not directly

ln -sf /dev/stdout /var/log/nginx/access.log
nginx -g 'daemon off; error_log /dev/stdout info;'
