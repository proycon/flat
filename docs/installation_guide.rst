*************************************
FLAT Installation Guide
*************************************


=================
Installation
=================

Setting up a web application is often a fairly complex endeavour. To facilitate this process we provide an OCI/Docker
container image which you can use. For this we assume some basic familiarity with docker on your part::

    $ docker pull proycon/flat

You can subsequently start a container as follows (minimal example)::

    $ docker run -p 8080:80 -v /path/to/data:/data proycon/flat

The ``/path/to/data`` is the data on the host system you want to mount into the container. This is where all FoLiA
documents will be stored. Make sure you have write permission here; the FLAT container will use UID and GID 100 internally (by default), which will translate to higher UIDS/GIDS on the host based on 
your subordinate user/group configuration, you may need to need to `remap subordinate user/group IDs <https://docs.docker.com/engine/security/userns-remap/>`_ .

The setting ``-p 8080:80`` maps port 8080 on the host to 80 in the container,
so after the container is started you can navigate to
``https://localhost:8080``. By default you can login with user ``flat`` and password ``flat``
if you haven't made any modifications to the default configuration.

Usage of our container images is the recommended way to install in production
environments. The container accepts a wide variety of environment variables to
configure FLAT. See the `Dockerfile
<https://github.com/proycon/flat/blob/master/Dockerfile>`_ for the various
variables you can set, you can subsequently pass them to ``docker run`` using
``--env`` (can be passed multiple times), for example::

    $ docker run -p 8080:80 -v /path/to/data:/data --env FLAT_REVERSE_PROXY_HTTPS=1 proycon/flat

In order to configure FLAT for specific annotation tasks we recommend you use
of external YAML files. The format of these is described in the `FLAT
Administration Guide
<https://github.com/proycon/flat/blob/master/docs/administration_guide.rst>`_.
Once you have a directory on your host (e.g. `/path/to/config`) containing one or more such
external YAML files (use extension `.yml`, an example is provided `here <https://github.com/proycon/flat/blob/master/flat.d/full.yml>`_), you can make them available inside the container by
setting ``FLAT_CONFIG_DIR`` and mounting another volume as follows::

    $ docker run -p 8080:80 -v /path/to/data:/data -v /path/to/config:/etc/flat --env FLAT_CONFIG_DIR=/etc/flat proycon/flat


---------------------
Manual Installatiion
---------------------

FLAT runs on Python 3. If you don't use the container image, we recommend installation in a Python *virtualenv* with
Python 3, create one as follows::

    $ virtualenv --python=python3 env

Activate the virtual environment as follows (you will need to do this every
time you want to access the virtual environment)::

    $ . env/bin/activate

FLAT can then simply be installed through the Python Package Index::

    $ pip install FoLiA-Linguistic-Annotation-Tool

Or alternatively from the cloned git repository::

    $ pip install -r requires.txt    #(to install the dependencies)
    $ python3 setup.py install

If you are the system administrator and opt for a global installation instead
of using a virtualenv, then just add ``sudo`` on most Linux distributions.

The following dependencies will be pulled in automatically if you follow either
of the above steps:

* foliadocserve (https://github.com/proycon/foliadocserve)
* foliapy (https://github.com/proycon/foliapy)
* django (https://www.djangoproject.com)

*Troubleshooting*: If the pip installation procedure fails because of libxml2
issues, you are missing one or more global dependencies. Make to
install the following through your distribution's package manager::

    $ apt-get install libxml2 libxml2-dev libxslt1.1-dev libxslt1

Then run ``pip install FoLiA-Linguistic-Annotation-Tool`` again. Note that the
above instruction is geared towards Debian/Ubuntu systems, look up the
corresponding package names and invoke your distribution's package manager if
you are on another system.


------------
Upgrade
------------

If you use the container images as recommended, just pull in the latest image version from Docker Hub and you can ignore the rest of this section.

To upgrade your existing *manual* installation of flat to the latest version, run the
following from within your virtual environment::

    $ pip install -U FoLiA-Linguistic-Annotation-Tool

New versions of FLAT may introduce new configuration options for your
``settings.py`` (introduced in next section). Please inspect the differences
between your variant of ``settings.py`` and the one provided with FLAT, and
copy what is needed. If you use external YAML configuration files, you likely won't have this problem.

New versions may also introduce database migrations. To
run these, set ``PYTHONPATH`` to the directory that contains your
``settings.py``, and ``DJANGO_SETTINGS_MODULE`` to the name of the file without the extension::

    $ export PYTHONPATH=/your/settings/path/
    $ export DJANGO_SETTINGS_MODULE=settings
    $ django-admin migrate --run-syncdb

Don't forget to restart your webserver or development server, as well as the
FoLiA Document Server (``foliadocserve``) after each upgrade.

---------------------------
FLAT Configuration
---------------------------

You can configure FLAT either by editing ``settings.py``, or by passing environment variables and some external YAML
files at run time, the latter is recommended as it means you can use the container image as-is.

If you do use ``settings.py`` directly, download a copy from
https://raw.githubusercontent.com/proycon/flat/master/settings.py to some
custom location, edit it and add a configuration for your system. The file is
heavily commented to guide you along with the configuration. It is here where
you specify what your users will see and what function are enabled.

Further documentation on configuration FLAT, after completing the installation
and configuration described in the remainder of this section, can be found in
the `FLAT Administration Guide
<https://github.com/proycon/flat/blob/master/docs/administration_guide.rst>`_.

~~~~~~~~~~~~~~~~~~~~~~~~~
Database Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~

FLAT uses a database only to store user accounts. In your ``settings.py`` you refer
to this database. Multiple backends are supported  (MySQL, PostgreSQL and
others). Make sure you create the desired database and user, with proper rights
to access and modify the database, in your database management system.

If you use the container image (as recommended), you can set environment variables to configure the database
(see https://github.com/proycon/flat/blob/master/Dockerfile). In most cases you won't need to edit anything and the
default sqlite database the containers offers should be sufficient as FLAT only makes light usage of the database.

* ``$FLAT_DATABASE_ENGINE``: can be set to ``django.db.backends.sqlite3``, ``django.db.backends.mysql``,
  ``django.db.backends.postgresql_psycopg2`` and others.
* ``$FLAT_DATABASE``: name of the database, filename in case of sqlite3
* ``$FLAT_DATABASE_USER``
* ``$FLAT_DATABASE_PASSWORD``
* ``$FLAT_DATABASE_HOST``
* ``$FLAT_DATABASE_PORT``

In manual installations, before you start FLAT for the first time, the database needs to be
populated. Set ``PYTHONPATH`` to the directory that contains your
``settings.py``, and ``DJANGO_SETTINGS_MODULE`` to the name of the file without the extension::

    $ export PYTHONPATH=/your/settings/path/
    $ export DJANGO_SETTINGS_MODULE=settings
    $ django-admin migrate --run-syncdb
    $ django-admin createsuperuser

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
OpenID Connect Authentication
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Flat supports OpenID Connect as a means of authenticating with a single-sign on authentication provider. Set ``OIDC =
True`` in ``settings.py`` or set environment variable ``FLAT_OIDC=1`` and configure all the other variables needed for
OpenID Connect Authentication, either by editing ``settings.py`` or by passing the proper environment variables when
starting the container:

* ``$FLAT_CLIENT_ID`` - Client ID as registered with the OpenID Connect Provider
* ``$FLAT_CLIENT_SECRET`` - Client secret as registered with the OpenID Connect Provider
* ``$FLAT_AUTH_ENDPOINT`` - URL of the authorization endpoint at the OpenID Connect Provider
* ``$FLAT_TOKEN_ENDPOINT`` - URL of the token endpoint at the OpenID Connect Provider
* ``$FLAT_USER_ENDPOINT`` - URL of the userinfo endpoint at the OpenID Connect Provider
* ``$FLAT_TOKEN_USE_BASIC_AUTH`` - Set to 1 to use client_secret_basic rather than client_secret_post  (depends on your
  provider)
* ``$FLAT_SIGN_ALGO`` - Sign algorithm your OpenID Connect provider uses, defaults to RS256 (can be set to HS256)
* ``$FLAT_JWKS_ENDPOINT`` - URL of the OIDC OP JWKS endpoint, to obtain the signing key automatically
* ``$FLAT_IDP_SIGN_KEY`` - The full signing key manually (alternative to the above), the content of this variable is interpreted as JSON. Example::

    key: {
          "kty": "rsa",
          "use": "sig",
          "alg": "rs256",
          "n": "SOME VALUE!",
          "e": "aqab"
    }

Users that are authenticated in this way are still added to the internal user database, which is needed when you want to
configure groups and rights. Matching OpenID Connect users with users in the database is always done on the basis of the
user's e-mail address. FLAT will consistently use e-mail addresses to represent users if you enabled Open ID Connect.

--------------------------------
Starting the Document Server
--------------------------------

FLAT constantly talks to a document server running in the background.

We need to start the FoLiA document server prior to starting FLAT, it is a
required component that needs not necessarily be on the same host. The container image we provide already contains both FLAT and
the document server, so you don't need to do anything for it and can skip this section entirely.

Your copy of ``settings.py`` should point to the host and port where FLAT can reach the
document server, this can also be done using environment variables ``FOLIADOCSERVE_HOST``, ``FOLIADOCSERVE_PORT`` and
``FLAT_DOCROOT``. In manual installations you can then start it as follows::

    $ foliadocserve -d /path/to/document/root -p 8080 --git

The document path will be a directory that will contain all FoLiA documents.
Create a root directory and ensure the user the foliadocserve is running under has
sufficient write permission there. The document server needs no further
configuration. Note that it does not provide any authentication features so it
should run somewhere where the outside world **can NOT reach** it, only FLAT needs
to be able to connect to it. Often, FLAT and the document server run on the
same host (like in our container setup), so a localhost connection is sufficient. You can set the document root using
environment variable ``FLAT_DOCROOT``.

The ``--git`` option to ``foliadocserve`` enables git versioning support, allowing users to undo annotations
and go back to previous revisions, it requires ``git`` to be installed on the
system and your git identity to be configured::

    $ git config --global user.email "you@example.com"
    $ git config --global user.name "Your Name"

-------------------------------------
Starting FLAT as development server
-------------------------------------

If you followed the manual installation route, you can start a development server using your ``settings.py`` by setting
``PYTHONPATH`` to the directory that contains it, and ``DJANGO_SETTINGS_MODULE`` to the name of the file without the
extension::

    $ export PYTHONPATH=/your/settings/path/
    $ export DJANGO_SETTINGS_MODULE=settings
    $ django-admin runserver

FLAT will advertise the host and port it is running on (as configured in your
``settings.py`` or ``$FOLIADOCSERVE_HOST`` and ``$FOLIADOCSERVE_PORT``), and you can access it in your browser.

~~~~~~~~~~~~~~~~~~~~~~~
Tests
~~~~~~~~~~~~~~~~~~~~~~~

FLAT has integration and automatic interface tests for the annotation editor, point your
browser to ``http://127.0.0.1:8000/editor/testflat/testflat`` to execute all tests.

=============================
Deployment in Production
=============================

For production environments we strongly recommend use of our container image as-is and using environment variables (and YAML
files) for the configuration. This allows for nice integration in infrastructure using container orchestration
platforms like kubernetes, or simpler solutions like docker compose.

A significant part of the deployment-specific configuration (database settings, authentication etc) can be configured by
setting environment variables when starting the container. Here are some of the key environment variables you absolutely
need to change:

* ``$FLAT_DOMAIN`` - The domain FLAT is served from (without scheme), e.g. ``flat.yourdomain.org``
* ``$FLAT_BASE_PREFIX`` - If don't serve under the root of the domain, set the prefix here (with leading slash ut without trailing slash)
* ``$FLAT_SECRET_KEY`` - You need to set this to some random string
* ``$FLAT_USER`` - The default administrative user (default: flat)
* ``$FLAT_PASSWORD`` - The password for the administrative user (default: flat)
* ``$FLAT_REVERSE_PROXY_HTTPS`` - You should set this to 1 after making sure you are behind a reverse proxy that handles
  SSL.
* ``$FLAT_CONFIG_DIR`` - Set this to a directory on the ``/data/`` mount that holds the external configuration files in YAML format. Example: ``/data/flat.d/``. You may omit this if you instead decided to edit ``settings.py`` directly.
* ``$FLAT_ADMIN_NAME`` - The full name of the FLAT administrator
* ``$FLAT_EMAIL`` - The email address for the administrator
* ``$FLAT_OIDC`` -  Set this to 1 if you want OpenID Connect Authentication (see the relevant section in this
  documentation for the rest of this configuration).
* ``$FLAT_DEFAULTCONFIGURATION`` -  Set to the name of your default configuration (the filename part without the ``.yml`` extension).
* ``$FLAT_DOCROOT`` - Defaults to ``/data/flat.docroot`` if unset, this is the directory that holds the documents and
  should always reside on the ``/data/`` mount.

The remaining configurations for actual annotation tasks can be specified in the external YAML files.

If you prefer editing ``settings.py`` rather than passing environment variables, you could build a
customised container image with your ``settings.py`` configuration that is derived from our image. For your own
``settings.py``, you can create the following simple ``Dockerfile`` alongside it::


    FROM proycon:flat
    COPY settings.py /tmp/flat_settings.py
    RUN cp -f /tmp/flat_settings.py /usr/lib/python3.*/site-packages/


Build your image with ``docker build .`` and you have a docker image derived on the image we provide, which merely overrides it with your configuration.

As said before, SSL should be handled by your own reverse proxy, it's not handled by the container. Your reverse proxy should
simply handle SSL and forward all traffic to the container. The following is a reverse proxy configuration
example for nginx, assuming the container is mapped to localhost on port 8080 and you have certificates ready::

    server {
        listen 443;
        server_name flat.yourdomain.org;

        ssl on;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";
        ssl_prefer_server_ciphers on;
        ssl_certificate /etc/letsencrypt/live/flat.yourdomain.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/flat.yourdomain.org/privkey.pem;

        client_max_body_size 750m;

        location / {
            proxy_set_header  Host             $host;
            proxy_set_header  X-Real-IP        $remote_addr;
            proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header  X-Forwarded-Proto "https";
            proxy_set_header  X-Forwarded-Host $host;
            proxy_pass http://127.0.0.1:8080/;
        }
    }


If you don't want to use our container image or don't want to use a reverse proxy, then you'll have to dive a bit deeper
to get things working. In such cases we recommend using ``uwsgi`` for serving FLAT. Apache2 users can use it with
``mod_uwsgi_proxy``. Even if you don't use our container image, studying our `Dockerfile` and configurations provides a
good reference for how you can set up things.

