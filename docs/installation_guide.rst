*************************************
FLAT Installation Guide
*************************************


=================
Installation
=================

Setting up a web application is often a fairly complex endeavour. We provide
instructions in this sections.

FLAT runs on Python 3 (the document server requires Python 3, the rest can
also work on Python 2). We recommend installation in a Python *virtualenv* with
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

To upgrade your existing instalation of flat to the latest version, run the
following from within your virtual environment::

    $ pip install -U FoLiA-Linguistic-Annotation-Tool

In production environments, you may also need to update your webserver configuration to point
to the right version, if explicit version numbers are used.

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

Before you start FLAT for the first time, this database needs to be
populated. Set ``PYTHONPATH`` to the directory that contains your
``settings.py``, and ``DJANGO_SETTINGS_MODULE`` to the name of the file without the extension::

    $ export PYTHONPATH=/your/settings/path/
    $ export DJANGO_SETTINGS_MODULE=settings
    $ django-admin migrate --run-syncdb
    $ django-admin createsuperuser

--------------------------------
Starting the Document Server
--------------------------------

FLAT constantly talks to a document server running in the background.
We need to start the FoLiA document server prior to starting FLAT, it is a
required component that needs not necessarily be on the same host. Your copy of
``settings.py`` should point to the host and port where FLAT can reach the
document server, start it as follows::

    $ foliadocserve -d /path/to/document/root -p 8080 --git

The document path will be a directory that will contain all FoLiA documents.
Create a root directory and ensure the user the foliadocserve is running under has
sufficient write permission there. The document server needs no further
configuration. Note that it does not provide any authentication features so it
should run somewhere where the outside world **can NOT reach** it, only FLAT needs
to be able to connect to it. Often, FLAT and the document server run on the
same host, so a localhost connection is sufficient.

The ``--git`` option enables git versioning support, allowing users to undo annotations
and go back to previous revisions, it requires ``git`` to be installed on the
system and your git identity to be configured::

    $ git config --global user.email "you@example.com"
    $ git config --global user.name "Your Name"

-------------------------------------
Starting FLAT (development server)
-------------------------------------

After all this is done, the *development server* can be started now using your ``settings.py`` by setting
``PYTHONPATH`` to the directory that contains it, and
``DJANGO_SETTINGS_MODULE`` to the name of the file without the extension::

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

The development server is not intended for production use. In production
environments, you will want to hook up FLAT to a webserver such as Apache2 or
nginx. First ensure that you completed all previous steps and
you manage to run the development server properly, as this mode is by
definition more suited for debugging any problems that may occur. After all that works, you can consider
deployment in a production setting.

For Apache2, you can use either ``mod_wsgi`` or ``mod_uwsgi_proxy``. For both,
you need a ``wsgi`` script, so the first step is to copy the provided
``template.wsgi`` (or grab it from
https://github.com/proycon/flat/blob/master/template.wsgi) and edit it for your
situation, this script will be referenced from your web server's configuration.
It is commented to guide you in the setup.

----------------------------
Apache 2.4 with mod_wsgi
----------------------------


1) Install and enable the ``mod_wsgi`` module for Apache (corresponding also to the Python version
you intend to use). On Debian/Ubuntu systems, install the package
``libapache2-mod-wsgi`` (python 2) or ``libapache2-mod-wsgi-py3`` (python 3).
2) Configure Apache2 for FLAT. We assume you use a dedicated subdomain for FLAT, so a configuration with a dedicated ``VirtualHost``
directive. Create a file ``flat`` in ``/etc/apache2/sites-available/`` (or similar) to this end. The configuration within should look as follows, but make sure all paths and Python and FLAT version numbers correspond exactly to your setup:

.. code::

    <VirtualHost *:80>
        ServerName flat.yourdomain.org

        WSGIScriptAlias / /path/to/your_copy_of_template.wsgi
        Alias /static/ /path/to/virtualenv/lib/python3.4/site-packages/django/contrib/admin/static/
        Alias /style/ /path/to/virtualenv/lib/python3.4/site-packages/FoLiA_Linguistic_Annotation_Tool-0.4.2-py3.4.egg/flat/style/
        <Directory /path/to/virtualenv/lib/python3.4/site-packages/FoLiA_Linguistic_Annotation_Tool-0.4.2-py3.4.egg/flat/style/>
          Options All
          AllowOverride All
          Require all granted
        </Directory>
        <Directory /path/to/virtualenv/lib/python3.4/site-packages/django/contrib/admin/static/>
          Options All
          AllowOverride All
          Require all granted
        </Directory>
    </VirtualHost>

If you did not use a virtualenv but installed everything globally then ``/path/to/virtualenv/`` is usually ``/usr/`` or ``/usr/local/``.
The FLAT directory may also reside in ``dist-packages/flat/`` on some installations.

Enable the configuration using ``sudo a2ensite flat`` and restart Apache after this.


