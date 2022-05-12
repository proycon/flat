*************************************
FLAT Installation Guide
*************************************


=================
Installation
=================

Setting up a web application is often a fairly complex endeavour. To facilitate this process we provide an OCI/Docker
container image which you can use. For thi we assume some basic familiarity with docker on your part::

    $ docker pull proycon/flat

You can subsequently start a container as follows::

    $ docker run -p 8080:80 -v /path/to/data:/data proycon/flat

The ``/path/to/data`` is the data on the host system you want to mount into the container. This is where all FoLiA
documents will be stored. Make sure you have write permission here; the FLAT container will use UID and GID 100, you may
need to `remap subordinate user/group IDs <https://docs.docker.com/engine/security/userns-remap/>` .

After the container is started you can navigate to ``https://localhost:8080`` and login with user ``flat`` and password
``flat`` if you haven't made any modifications to the default configuration.

Usage of our container images is the recommended way to install in production environments. The container accepts a wide
variety of environment variables to configure FLAT. See the `Dockerfile
<https://github.com/proycon/flat/blob/master/Dockerfile>` for the precise details.


---------------------
Manual Installatiion
---------------------

FLAT runs on Python 3 (the document server requires Python 3, the rest can also work on Python 2). If you don't use the
container image, we recommend installation in a Python *virtualenv* with Python 3, create one as follows::

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
* pynlpl (https://github.com/proycon/pynlpl) (contains the FoLiA and FQL library)
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

If you use the container images as recommended, just pull in the latest image version from Docker Hub.

To upgrade your existing manual installation of flat to the latest version, run the
following from within your virtual environment::

    $ pip install -U FoLiA-Linguistic-Annotation-Tool

New versions of FLAT may introduce new configuration options for your
``settings.py`` (introduced in next section). Please inspect the differences
between your variant of ``settings.py`` and the one provided with FLAT, and
copy what is needed. New versions may also introduce database migrations. To
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

Download the ``settings.py`` from
https://raw.githubusercontent.com/proycon/flat/master/settings.py to some
custom location, edit it and add a configuration for your system. The file is
heavily commented to guide you along with the configuration. It is here where
you specify what your users will see and what function are enabled..

Further documentation on configuration FLAT, after completing the installation
and configuration described in the remainder of this section, can be found in
the `FLAT Administration Guide
<https://github.com/proycon/flat/blob/master/docs/administration_guide.rst>`_.

~~~~~~~~~~~~~~~~~~~~~~~~~
Database Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~

FLAT uses a database to store user accounts. In your ``settings.py`` you refer
to this database. Multiple backends are supported  (MySQL, PostgreSQL and
others). Make sure you create the desired database and user, with proper rights
to access and modify the database, in your database management system.

If you use the container image (as recommended), you can set environment variables to configure the database
(see https://github.com/proycon/flat/blob/master/Dockerfile).

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

Flat supports OpenID Connect as a means of authenticating with a single-sign on authentication provider.
Set ``OIDC = True`` and configure the various ``OIDC_*`` variables in ``settings.py`` as indicated, or pass the proper environment
variables when starting the container (see https://github.com/proycon/flat/blob/master/Dockerfile)

Users that are authenticated in this way are still added to the internal user database, which is needed when you want to
configure groups and rights. Matching OpenID Connect users with users in the database is always done on the basis of the
user's e-mail address. FLAT will consistently use e-mail addresses to represent users if you enabled Open ID Connect.

--------------------------------
Starting the Document Server
--------------------------------

FLAT constantly talks to a document server running in the background.

We need to start the FoLiA document server prior to starting FLAT, it is a
required component that needs not necessarily be on the same host. The container image we provide contains both FLAT and
the document server. Your copy of ``settings.py`` should point to the host and port where FLAT can reach the
document server, in manual installations you can start it as follows::

    $ foliadocserve -d /path/to/document/root -p 8080 --git

The document path will be a directory that will contain all FoLiA documents.
Create a root directory and ensure the user the foliadocserve is running under has
sufficient write permission there. The document server needs no further
configuration. Note that it does not provide any authentication features so it
should run somewhere where the outside world **can NOT reach** it, only FLAT needs
to be able to connect to it. Often, FLAT and the document server run on the
same host (like in our container setup), so a localhost connection is sufficient.

The ``--git`` option enables git versioning support, allowing users to undo annotations
and go back to previous revisions, it requires ``git`` to be installed on the
system and your git identity to be configured::

    $ git config --global user.email "you@example.com"
    $ git config --global user.name "Your Name"

-------------------------------------
Starting FLAT (development server)
-------------------------------------

If you followed the manual installation route, you can start a development server using your ``settings.py`` by setting
``PYTHONPATH`` to the directory that contains it, and ``DJANGO_SETTINGS_MODULE`` to the name of the file without the
extension::

    $ export PYTHONPATH=/your/settings/path/
    $ export DJANGO_SETTINGS_MODULE=settings
    $ django-admin runserver

FLAT will advertise the host and port it is running on (as configured in your
``settings.py``), and you can access it in your browser.

~~~~~~~~~~~~~~~~~~~~~~~
Tests
~~~~~~~~~~~~~~~~~~~~~~~

FLAT has integration and automatic interface tests for the annotation editor, point your
browser to ``http://127.0.0.1:8000/editor/testflat/testflat`` to execute all tests.

=============================
Deployment in Production
=============================

For production environments we strongly recommend usage of our container image, or more specifically, you should build a customised container image
with your ``settings.py`` configuration that is derived from our image. For your own ``settings.py``, you can create the following simple ``Dockerfile`` alongside it::


    FROM proycon:flat
    COPY settings.py /tmp/flat_settings.py
    RUN cp -f /tmp/flat_settings.py /usr/lib/python3.*/site-packages/

Build your image with ``docker build .``. This builds a docker image based on the image we provide, and merely overrides it with your configuration.

A significant part of the deployment-specific configuration (database settings, authentication etc) can be configured by
setting environment variables when starting the container. Please study the available environment variables defined in
https://github.com/proycon/flat/blob/master/Dockerfile . Ensure you at least set a custom
``FLAT_SECRET_KEY``, ``FLAT_PASSWORD`` and set ``FLAT_REVERSE_PROXY_HTTPS`` to ``1`` if you're behind a reverse proxy
that handled HTTPS (you always should be).

As said, SSL should be handled by your own reverse proxy, it's not handled by the container. Your reverse proxy should
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
to get things working. In such cases we recommend using ``uwsgi`` for serving FLAT. Apache2 users can it with
``mod_uwsgi_proxy``. Even if you don't use our container image, it provides a good reference for how you can set up
things.

