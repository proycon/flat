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

* Multi-user environment
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
* Spelling corrections such, runons and splits, insertions and deletions are
  supported.
* Supports FoLiA Set Definitions
* Supports Token Annotation and Span Annotation


=============================================
Screenshots
=============================================

The login screen:

.. image:: https://raw.github.com/proycon/flat/docs/login.png
    :alt: FLAT screenshot
    :align: center

Document index, showing namespaces accessible to the user and the documents
within.

.. image:: https://raw.github.com/proycon/flat/docs/mydocuments.png
    :alt: FLAT screenshot
    :align: center

Hovering over words reveals annotations:

.. image:: https://raw.github.com/proycon/flat/docs/hover.png
    :alt: FLAT screenshot
    :align: center

A particular annotation focus can be set to highlight the most frequent
classes in that set:

.. image:: https://raw.github.com/proycon/flat/docs/highlight1.png
    :alt: FLAT screenshot
    :align: center

.. image:: https://raw.github.com/proycon/flat/docs/highlight2.png
    :alt: FLAT screenshot
    :align: center

Editing a named entity in a set for which a set definition is available:

.. image:: https://raw.github.com/proycon/flat/docs/edit2.png
    :alt: FLAT screenshot
    :align: center

Correcting a word in a spelling-annotation project:

.. image:: https://raw.github.com/proycon/flat/docs/edit1.png
    :alt: FLAT screenshot
    :align: center


Extensive history with limitless undo ability, git-based:

.. image:: https://raw.github.com/proycon/flat/docs/history.png
    :alt: FLAT screenshot
    :align: center

