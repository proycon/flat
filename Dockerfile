FROM alpine:latest
LABEL org.opencontainers.image.authors="Maarten van Gompel <proycon@anaproy.nl>"
LABEL description="FLAT - FoLiA Linguistic Annotation Tool. A web-based annotation environment."


ENV FLAT_USER="flat"
ENV FLAT_PASSWORD="flat"
ENV FLAT_EMAIL="flat@example.org"

#The domain on which the site is accessible
ENV FLAT_DOMAIN="localhost"

#replace with your name
ENV FLAT_ADMIN_NAME="FLAT Administrator"

#Set this to 1 if you are behind a reverse proxy that handles HTTPS
#(which you should be in production scenarios)
##Make sure your reverse proxy sets and forwards the X-Forwarded-Proto header, and strips it from incoming user request
ENV FLAT_REVERSE_PROXY_HTTPS=0

ENV FLAT_DATABASE_ENGINE="django.db.backends.sqlite3"
ENV FLAT_DATABASE="/data/flat.db"
#the following are not needed for sqlite:
ENV FLAT_DATABASE_USER=""
ENV FLAT_DATABASE_PASSWORD=""
ENV FLAT_DATABASE_HOST=""
ENV FLAT_DATABASE_PORT=""

ENV FOLIADOCSERVE_HOST="127.0.0.1"
ENV FOLIADOCSERVE_PORT=8080

#Directory where all documents are stored
ENV FLAT_DOCROOT="/data/flat.docroot"

#Change this to something that you don't publish publicly anywhere
ENV FLAT_SECRET_KEY="ki5^nfv01@1g7(+*#l_0fmi9h&cf^_lv6bs4j9^6mpr&(%o4zk"

ENV FLAT_GIT_NAME=$FLAT_ADMIN_NAME
ENV FLAT_GIT_MAIL=$FLAT_EMAIL

# For OpenID Connect Authentication, set FLAT_OIDC=1 and configure all of these:
ENV FLAT_OIDC=0
ENV FLAT_CLIENT_ID=""
# URL of the OIDC OP authorization endpoint
ENV FLAT_AUTH_ENDPOINT=""
#URL of the OIDC OP token endpoint
ENV FLAT_TOKEN_ENDPOINT=""
#URL of the OIDC OP userinfo endpoint
ENV FLAT_USER_ENDPOINT=""



#Leave as-is
ENV DJANGO_SETTINGS_MODULE=flat_settings
ENV UWSGI_UID=100
ENV UWSGI_GID=100

#Sane defaults for light use
ENV UWSGI_PROCESSES=2
ENV UWSGI_THREADS=2

RUN mkdir -p /data

# Temporarily add the sources
COPY . /usr/src/flat

# Install all global dependencies
RUN apk update && apk add git runit curl ca-certificates nginx uwsgi uwsgi-python3 py3-pip py3-yaml py3-lxml py3-requests py3-django py3-wheel py3-numpy py3-cryptography py3-openssl sudo

# Prepare environment
RUN mkdir -p /etc/service/nginx /etc/service/uwsgi /etc/service/foliadocserve

# Patch to set proper mimetypes and maximum upload size
RUN sed -i 's/txt;/txt log;/' /etc/nginx/mime.types &&\
    sed -i 's/xml;/xml xsl;/' /etc/nginx/mime.types &&\
    sed -i 's/client_max_body_size 1m;/client_max_body_size 1000M;/' /etc/nginx/nginx.conf

# Configure webserver and uwsgi server
RUN cp /usr/src/flat/runit.d/nginx.run.sh /etc/service/nginx/run &&\
    chmod a+x /etc/service/nginx/run &&\
    cp /usr/src/flat/runit.d/uwsgi.run.sh /etc/service/uwsgi/run &&\
    chmod a+x /etc/service/uwsgi/run &&\
    cp /usr/src/flat/runit.d/foliadocserve.run.sh /etc/service/foliadocserve/run &&\
    chmod a+x /etc/service/foliadocserve/run &&\
    cp /usr/src/flat/flat/wsgi.py /etc/flat.wsgi &&\
    chmod a+x /etc/flat.wsgi &&\
    cp -f /usr/src/flat/nginx.conf /etc/nginx/http.d/default.conf

# Install FLAT
RUN cd /usr/src/flat && pip install . &&\
    ln -s /usr/lib/python3.*/site-packages/flat /opt/flat &&\
    ln -s /usr/lib/python3.*/site-packages/django /opt/django &&\
    sed '/remove me/d' settings.py > flat_settings.py &&\
    cp flat_settings.py /usr/lib/python3.*/site-packages/ &&\
    sudo -u nginx -- git config --global user.email "$FLAT_GIT_MAIL" &&\
    sudo -u nginx -- git config --global user.name "$FLAT_GIT_NAME" &&\
    rm -Rf /usr/src/flat


# Database and document root will be created on first start

VOLUME ["/data"]
EXPOSE 80
WORKDIR /

ENTRYPOINT ["runsvdir","-P","/etc/service"]
