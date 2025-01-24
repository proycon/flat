#!/bin/sh

# This script is meant to be invoked via runit (installed in /etc/service/nginx/run), not directly

echo "Starting foliadocserve..." >&2
mkdir -p "${FLAT_DOCROOT:-/data/flat.docroot}"
chown ${UWSGI_UID:-100}:${UWSGI_GID:-100} "${FLAT_DOCROOT:-/data/flat.docroot}"
chmod g+ws "${FLAT_DOCROOT:-/data/flat.docroot}"
#set very permissive stdout/stderr
chmod a+rwx /proc/self/fd/1
chmod a+rwx /proc/self/fd/2
sudo -u \#${UWSGI_UID:-100} foliadocserve -d ${FLAT_DOCROOT:-/data/flat.docroot} --log ${FOLIADOCSERVE_LOG:-/dev/stdout} --git --gitshare false --expirationtime 120 -p 8080
