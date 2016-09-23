*****************************************
FLAT Administration Guide
*****************************************

After FLAT has been properly installed, administration entails the following
two parts:

1. Setting up configuration(s) for your annotation task(s) in ``settings.py``
2. Managing user accounts and permissions

Note that this documentation does not cover installation and the initial setup!
Those are already documented in the `README
<https://github.com/proycon/flat/blob/master/README.rst>`_.

=============================================
Configuration
=============================================

Configuration of FLAT is done in the typical unix fashion by editing a
configuration file, there is no web interface for this. For FLAT
``settings.py`` (or however you renamed) fulfills this role. Making it a
centralized place for all settings. The file is heavily commented to guide you
along.

Although ``settings.py`` is a Python script, no Python knowledge is necessary.
It may help some to know that, the pythonic configuration syntax is also very
similar to JSON.

~~~~~~~~~~~
Modes
~~~~~~~~~~~

FLAT is composed of various modules, exposed as modes to the user. The user always chooses
a mode to work in from the menu.

The following are available:

* ``viewer`` - A document and annotation viewer (no editing)
* ``editor`` - The annotation editor
* ``structureeditor`` - A structural editor (not finished yet)
* ``metadata`` - A simple metadata editor

These are defined in the ``MODES`` variable. Individual configurations (see
below) can in turn pick a subset of the modes, if not all of them:

.. code:: python

    MODES = [
        ('viewer','Viewer'),
        ('editor','Annotation Editor'),
        ('structureeditor','Structure Editor'),
        ('metadata','Metadata Editor'),
    ]

The pairs correspond to the internal name for the mode, and a human readable
label.

~~~~~~~~~~~~~~~~~~~~~
Configurations
~~~~~~~~~~~~~~~~~~~~~

FLAT supports multiple so-called *configurations*. The user selects what
configuration to use upon login.

This allows using the same FLAT installation
for multiple annotation projects. The document store is shared amongst all
configurations, allowing for different ways to view/edit the same document,
unless explicitly constrained.

Each configuration defines precisely what elements of user interface are shown and
which are not, what functionality is enabled, and what defaults are set. FLAT contains a lot of
features, which will easily overwhelm the user if all are enabled. You will
want to constrain this for your annotation task.

The ``DEFAULTCONFIGURATION`` variable refers to the configuration that is pre-selected
upon login, and will therefore be the default unless the user selects another. 

All configurations are defined in ``CONFIGURATIONS`` (a simple Python
dictionary for those familiar with Python, the keys correspond to the
configuration name and the value is another dictionary with configuration
options). By default, a ``full`` configuration will be defined that is as
permissive as possible. You will want to add your own configurations that are
more restrictive.

We will discuss the individual configuration options here:

* ``name`` - The name of the configuration, this is what users will see in the login screen, make sure the name is indicative of your annotation project, if any.
* ``modes`` - This defines the modes that are enabled for this configuration.  The syntax equals that of ``MODES`` above.
* ``perspectives`` - The viewer and editor allow for different perspectives on the data. This option determines what perspectives may be selected. This is a list of the following items:
   * ``document``: a view of the entire document
   * ``toc``: a view of a named subsection of the document (a table of contents will be automatically constructed)
   * or any other FoLiA XML tag corresponding to a structural element. 

(yet to be written)


=====================
User permissions
=====================

(yet to be written)






