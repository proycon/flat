#!/bin/sh

# This script is meant to be invoked via runit (installed in /etc/service/nginx/run), not directly

echo "Starting foliadocserve..." >&2
mkdir -p "${FLAT_DOCROOT:-/data/flat.docroot}"
chown ${UWSGI_UID:-100}:${UWSGI_GID:-100} "${FLAT_DOCROOT:-/data/flat.docroot}"
chmod g+ws "${FLAT_DOCROOT:-/data/flat.docroot}"
sudo -u nginx foliadocserve -d ${FLAT_DOCROOT:-/data/flat.docroot} --log /dev/stderr --git --gitshare false --expirationtime 120 -p 8080
