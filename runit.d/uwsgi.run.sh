#!/bin/sh

# This script is meant to be invoked via runit (installed in /etc/service/nginx/run), not directly

echo "Applying migrations...">&2
django-admin migrate --run-syncdb

echo "Creating FLAT superuser and (re)setting password...">&2
echo -ne "
from django.contrib.auth.models import User
username = '${FLAT_USER:-flat}'
password = '${FLAT_PASSWORD:-flat}'
email = '${FLAT_EMAIL}'
if User.objects.filter(username=username).count() == 0:
    User.objects.create_superuser(username, email, password)
    print('Superuser created.')
else:
    try:
        obj = User.objects.get(username=username)
        print('Updating existing password for superuser.')
        obj.set_password(password)
        obj.save()
    except:
        print('Superuser creation skipped.')
" | django-admin shell -i python


#echo "Configuring FLAT domain...">&2
#echo -ne "
#from django.contrib.sites.models import Site
#one = Site.objects.all()[0]
#one.domain = '${FLAT_DOMAIN:localhost}'
#one.name = 'FLAT'
#one.save()" | django-admin shell -i python

chown ${UWSGI_UID:-100}:${UWSGI_GID:-100} "$(dirname "$FLAT_DATABASE")"
chown ${UWSGI_UID:-100}:${UWSGI_GID:-100} "${FLAT_DATABASE}"
chmod ug+rw "${FLAT_DATABASE}"

echo "Starting FLAT via uwsgi..." >&2
uwsgi --plugin python3 \
      --uid ${UWSGI_UID:-100} \
      --gid ${UWSGI_GID:-100} \
      --master \
      --socket "127.0.0.1:8888" \
      --wsgi-file /etc/flat.wsgi \
      --processes ${UWSGI_PROCESSES:-2} \
      --single-interpreter
      --threads ${UWSGI_THREADS:-2} \
      --manage-script-name

