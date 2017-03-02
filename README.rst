.. image:: http://readthedocs.org/projects/flat/badge/?version=latest
	:target: http://flat.readthedocs.io/en/latest/?badge=latest
	:alt: Documentation Status

.. image:: http://applejack.science.ru.nl/lamabadge.php/flat
   :target: http://applejack.science.ru.nl/languagemachines/

*****************************************
FLAT - FoLiA Linguistic Annotation Tool
*****************************************

FLAT is a web-based linguistic annotation environment based around the FoLiA
format (http://proycon.github.io/folia), a rich XML-based format for linguistic
annotation. FLAT allows users to view annotated FoLiA documents and enrich
these documents with new annotations, a wide variety of linguistic annotation
types is supported through the FoLiA paradigm. It is a document-centric tool
that fully preserves and visualises document structure.

FLAT is written in Python using the Django framework. The user interface is
written using javascript with jquery.  The FoLiA Document Server
(https://github.com/proycon/foliadocserve) , the back-end
of the system, is written in Python with CherryPy and is used as a RESTful
webservice.

FLAT is open source software developed at the Centre of Language and Speech
Technology, Radboud University Nijmegen. It is licensed under the GNU Public
License v3. The project is funded in the scope of the larger `CLARIAH
<http://clariah.nl>`_ project.


=============================================
Features
=============================================

* Web-based, multi-user environment
* Server-side document storage, divided into 'namespaces', by default each user
  has his own namespace. Active documents are held in memory server-side.
  Read and write permissions to access namespaces are fully configurable.
* Concurrency (multiple users may edit the same document similtaneously)
* Full versioning control for documents (using git), allowing limitless undo operations. (in foliadocserve)
* Full annotator information, with timestamps, is stored in the FoLiA XML and can be displayed by the interface. The git log also contains verbose information on annotations.
* Annotators can indicate their confidence for each annotation
* Highly configurable interface; interface options may be disabled on a
  per-configuration basis. Multiple configurations can be deployed on a single
  installation
* Displays and retains document structure (divisions, paragraphs, sentence, lists, etc)
* Support for corrections, of text or linguistic annotations, and alternative annotations. Corrections are never mere substitutes, originals are always preserved!
* Spelling corrections for runons, splits, insertions and deletions are supported.
* Supports FoLiA Set Definitions to display label sets. Sets are not predefined
  in FoLiA and anybody can create their own.
* Supports Token Annotation and Span Annotation
* Supports complex span annotations such as dependency relations, syntactic units (constituents), predicates and semantic roles, sentiments, stratements/attribution, observations
* Simple metadata editor for editing/adding arbitrary metadata to a document.
  Selected metadata fields can be shown in the document index as well.
* User permission model featuring groups, group namespaces, and assignable permissions
* File/document management functions (copying, moving, deleting)
* Allows converter extensions to convert from other formats to FoLiA on upload
* In-document search (CQL or FQL), advanced searches can be predefined by administrators
* Morphosyntactic tree visualisation (constituency parses and morphemes)
* Higher-order annotation: associate features, comments, descriptions with any
  linguistic annotation

============================================
Architecture
============================================

The FLAT architecture consists of three layers:

* The **FoLiA Document Server** (https://github.com/proycon/foliadocserve)
* The **FLAT server**
* The **user-interface**

At the far back-end is the FoLiA Document Server, which loads the requested
FoLiA documents, and passes these as JSON and HTML to the middle layer, the
FLAT server, this layer in turn passes edits formulated in FoLiA Query Language
(FQL) to the Document Server. The user-interface is a modern web-application
interacting with the FLAT server and translates interface actions to FQL.

FLAT distinguishes several **modes**, between which the user can switch to get
another take of a document with different editing abilities. There are
currently three modes available, and a fourth one under construction:

* **Viewer** - Views a document and its annotations, no editing abilities
* **Editor** - Main editing environment for linguistic annotation
* **Metadata editor** - A simple editor for document-wide metadata
* **Structure Editor** - Editing environment for document structure *(rudimentary version, not done)*

In the viewer and editor mode, users may set an **annotation focus**, i.e. an
annotation type that they want to visualise or edit. All instances of that
annotation type will be coloured in the interface and offer a *global* overview.
Moreover, the editor dialog will automatically present fields for editing that
type whenever a structure element (usually a word/token) is clicked.

Whereas the annotation focus is primary, users may select what other annotation
types they want to view *locally*,  i.e. in the annotation viewer that
pops up whenever the user hovers over a structural element. Similarly, users
may select what annotation types they want to see in editor, allowing the
editing of multiple annotation types at once rather than just the annotation
focus.

FoLiA distinguishes itself from some other annotation formats by explicitly
providing support for **corrections** (on any annotation type, including text)
and **alternative annotations**. In FLAT these are categorized as **edit
forms**, as they are different forms of editing; the user can select which form
he wants to use when performing an annotation.

The site administrator can configure in great detail what options the user has
available and what defaults are selected (for annotation focus for instance),
as a full unconstrained environment (which is the default) may quickly be
daunting and confusing to the end-user. Different tasks ask for different
configurations, so multiple configurations per site are
possible; the user chooses the desired configuration, often tied to a
particular annotation project, upon login.

===========================================
Documentation
===========================================

FLAT Documentation can be found in the form of the following three guides:

* `Installation Guide <http://flat.readthedocs.io/en/latest/installation_guide.html>`_. - Explains how to install FLAT.
* `Administration Guide <http://flat.readthedocs.io/en/latest/administration_guide.html>`_. - Explains how to configure FLAT for your annotation task.
* `User Guide <http://flat.readthedocs.io/en/latest/user_guide.html>`_. - Explains how to use FLAT.

Moreover, a screencast video has been created to show FLAT in action and
offer an impression of its features:

* `FLAT Demonstration Video <https://www.youtube.com/watch?v=tYF6grtldVQ>`_.

=============================================
Screenshots
=============================================

For some impressions of FLAT, take a look at the following screenshots:

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

Proper right-to-left support for languages such as Arabic, Farsi and Hebrew.

.. image:: https://raw.github.com/proycon/flat/master/docs/righttoleft.png
    :alt: FLAT screenshot (right to left)
    :align: center

Extensive history with limitless undo ability, git-based:

.. image:: https://raw.github.com/proycon/flat/master/docs/history.png
    :alt: FLAT screenshot
    :align: center

Advanced search queries in CQL (Corpus Query Language) or FQL (FoLiA Query Language):

.. image:: https://raw.github.com/proycon/flat/master/docs/searchcql.png
    :alt: FLAT screenshot
    :align: center

.. image:: https://raw.github.com/proycon/flat/master/docs/search.png
    :alt: FLAT screenshot
    :align: center

Tree visualisation of syntax and morphology:

.. image:: https://raw.github.com/proycon/flat/master/docs/syntree.png
    :alt: FLAT screenshot
    :align: center

.. image:: https://raw.github.com/proycon/flat/master/docs/morphtree.png
    :alt: FLAT screenshot
    :align: center

