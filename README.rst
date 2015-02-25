*****************************************
FLAT - FoLiA Linguistic Annotatation Tool
*****************************************

Flat is a web-based linguistic annotation environment based around the FoLiA
format (http://proycon.github.io/folia), a rich XML-based format for linguistic
annotation. Flat allows users to view annotated FoLiA documents and enrich
these documents with new annotations, a wide variety of linguistic annotation
types is supported through the FoLiA paradigm. 

The project is in its early stages but already quite functional and in
practical use in an academic setting.

The tool is written in Python, using the Django framework and the FoLiA library
in pynlpl.

=============================================
Features
=============================================

* Web-based, multi-user environment
* Server-side document storage, divided into 'namespaces', by default each user
  has his own namespace. Active documents are held in memory server-side.
  Read and write permissions to access namespaces are fully configurable.
* Concurrency (multiple users may edit the same document similtaneously)  [**not completed yet**]
* Full versioning control for documents (using git), allowing limitless undo operations.
* Full annotator information, with timestamps, is stored in the FoLiA XML and can be displayed by the interface. The git log also contains verbose information on annotations.
* Highly configurable interface; interface options may be disabled on a
  per-configuration basis. Multiple configurations can be deployed on a single
  installation
* Displays and retains document structure (divisions, paragraphs, sentence, lists, etc) 
* Support for corrections, of text or linguistic annotations, and alternative annotations. Corrections are never mere substitutes, originals are always preserved!
* Spelling corrections for runons, splits, insertions and deletions are
  supported.
* Supports FoLiA Set Definitions
* Supports Token Annotation and Span Annotation

============================================
Architecture
============================================

The FLAT architecture consists of three layers:

* The FoLiA Document Server
* The FLAT server
* The user-interface

At the far back-end is the FoLiA Document Server, which loads the requested FoLiA documents, and passes these as JSON and HTML to the middle layer, the FLAT server, this layer in turn passes edits formulated in FoLiA Query Language to the Document Server. The user-interface is a modern web-application interacting with the FLAT server and translates interface actions to FoLiA Query Language.

The FoLiA Document Server is written in Python with CherryPy and acts as a RESTful webservice. The FLAT server is written in Python using the Django framework. The user interface is written using javascript with jquery.

============================================
Installation
============================================

FLAT runs on Python 3 (the document server requires Python 3, the rest will
also work on Python 2) and uses these libraries. 

FLAT can be installed through the Python Package Index::

    $ pip install FoLiA-Linguistic-Annotation-Tool

Or from the cloned git repository::

    $ pip install -r requires.txt    #(to install the dependencies)
    $ python3 setup.py install

You may need ``sudo`` for a global installation.
 
The following dependencies will be pulled in automatically if you follow either
of the above steps::

 * foliadocserve (https://github.com/proycon/foliadocserve)
 * pynlpl (https://github.com/proycon/pynlpl)
 * django 

Copy and edit the ``settings.py`` that comes with FLAT, and add a configuration for your
system.

The development server can be started as follows (with the default settings,
adapt for your own settings module)::

    $ django-admin runserver --settings flat.settings


=============================================
Screenshots
=============================================

The login screen:

.. image:: https://raw.github.com/proycon/flat/master/docs/login.png
    :alt: FLAT screenshot
    :align: center

Document index, showing namespaces accessible to the user and the documents
within.

.. image:: https://raw.github.com/proycon/flat/master/docs/mydocuments.png
    :alt: FLAT screenshot
    :align: center

Hovering over words reveals annotations:

.. image:: https://raw.github.com/proycon/flat/master/docs/hover.png
    :alt: FLAT screenshot
    :align: center

A particular annotation focus can be set to highlight the most frequent
classes in that set:

.. image:: https://raw.github.com/proycon/flat/master/docs/highlight1.png
    :alt: FLAT screenshot
    :align: center

.. image:: https://raw.github.com/proycon/flat/master/docs/highlight2.png
    :alt: FLAT screenshot
    :align: center

Editing a named entity in a set for which a set definition is available:

.. image:: https://raw.github.com/proycon/flat/master/docs/edit2.png
    :alt: FLAT screenshot
    :align: center

Correcting a word in a spelling-annotation project:

.. image:: https://raw.github.com/proycon/flat/master/docs/edit1.png
    :alt: FLAT screenshot
    :align: center


Extensive history with limitless undo ability, git-based:

.. image:: https://raw.github.com/proycon/flat/master/docs/history.png
    :alt: FLAT screenshot
    :align: center

