*****************************************
FLAT Administration Guide
*****************************************

After FLAT has been properly installed, administration entails the following
parts:

1. Setting up configuration(s) for your annotation task(s) in ``settings.py``
2. Managing user accounts and permissions using the administrative webinterface (``http://your.flat.url/admin/``)
3. Preparing your data in FoLiA

Note that this documentation does not cover installation and the initial setup!

=============================================
Configuration
=============================================

Configuration of FLAT is done in the typical unix fashion by editing a
configuration file, there is no web interface for this. For FLAT
``settings.py`` (or however you renamed) fulfills this role. Making it a
centralized place for all settings. The file is heavily commented to guide you
along. The template can be obtained from
https://raw.githubusercontent.com/proycon/flat/master/settings.py .

Although ``settings.py`` is a Python script, no Python knowledge is necessary.
It may help some to know that, the pythonic configuration syntax is also very
similar to JSON.

-----------
Modes
-----------

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

-----------------
Configurations
-----------------

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
* ``perspectives`` - The viewer and editor allow for different perspectives on the data. This option determines what perspectives may be selected. This is list (of strings) of the following items:
   * ``document``: a view of the entire document
   * ``toc``: a view of a named subsection of the document (a table of contents will be automatically constructed)
   * or any other FoLiA XML tag corresponding to a structural element , such as ``'s'`` for sentence, ``'p'`` for paragraphs, ``'event'`` for events.
* ``slices`` - This is strongly tied to perspectives and determines how big of a slice to show per page for each
  perspective. Setting this (and choosing the desired perspective) enables pagination through documents. The value is a
  comma-delimited string of ``tag:number`` pairs, for instance: ``p:25,s:100`` to set a page size of 25 paragraphs in
  the paragraph perspective, and 100 sentences in the sentence perspective. Note that if you make the size of a page too
  large, you will be confronted with the error: *"Loading aborted: there was too much data to display at once"*.
* ``allowupload`` - Boolean value indicating whether users may upload their own FoLiA documents or not
* ``annotationfocustype`` - Sets the annotation type for the default annotation focus, effectively highlighting annotations of this type immediately upon opening the document. The type needs to be a valid FoLiA tag name (see the FoLiA documentation at https://proycon.github.io/folia), such as ``'pos'``, ``'lemma'``, ``'entity'``, etc...  If you set this, also set the next option.
* ``annotationfocusset`` - Sets the set for the default annotation focus. The set is a URL pointing to a FoLiA Set Definition file. Set to ``None`` if not used, use with the above otherwise.
* ``autoselectspan`` - Boolean, automatically click the select span button for the annotation focus when opening the editor dialog. Defaults to ``False``.
* ``allowannotationfocus`` - List of FoLiA annotation types (corresponding to the xml tags) that are allowed as annotation focus, i.e. that can be selected by the user through the menu. Set to ``True`` to enable all.
* ``initialviewannotation`` - List of FoLiA annotation types (corresponding to the xml tags) that are initially enabled in the local annotation viewer, i.e. the pop-up when the user hovers over elements. Set to ``True`` to enable all.
* ``initialglobviewannotations`` - List of FoLiA annotation types (corresponding to the xml tags) that are initially enabled in the global annotation viewers (the annotation boxes above the words).
* ``allowedviewannotation`` - List of FoLiA annotation types (xml tags) that are allowed to be viewed,  a superset of initialviewannotations/initialglobviewannotations. Users can enable/disable each as they see fit. Set to ``True`` to enable all.
* ``initialeditannotations`` - List of FoLiA annotation types (xml tags) that are initially enabled in the editor dialog (when users click an element for editing), set to ``True`` to enable all.
* ``allowededitannotations`` - List of FoLiA annotation types (xml tags) that are allowed in the editor dialog (the user can enable/disable each as he/she sees fit), set to ``True`` to enable all.
* ``allowaddfields`` - Boolean value, allow the user to add annotation types not yet present on a certain element?
* ``allowdeclare`` -- Boolean value, allow the user to add annotation types not yet present in the document?
* ``editformdirect`` -- Boolean, enable the direct editing form (this is the default and most basic form of editing, consult the user guide). It should be ``True`` unless you want to force other editing forms.
* ``editformcorrection`` -- Boolean, enable editing as correction.
* ``editformalternative`` -- Boolean, enable editing as alternative.
* ``editformnew`` -- Boolean, enable editing as new annotation, this allows for adding multiple or overlapping annotations of the same type/set.
* ``alloweditformdirect`` -- Boolean, allow the user the enable/disable direct editing himself/herself.
* ``alloweditformcorrection`` -- Boolean, allow the user the enable/disable correction editing himself/herself.
* ``alloweditformalternative`` -- Boolean, allow the user the enable/disable alternative editing himself/herself.
* ``alloweditformnew`` -- Boolean, allow the user the enable/disable new editing himself/herself.
* ``allowconfidence`` -- Boolean, allow confidence values to be set/added?
* ``initialcorrectionset`` - String to the set definition used for corrections.
* ``autodeclare`` -- Automatically declare the following annotation types when a document is loaded. This is a list of 2-tuples ``(tag,set)`` that specify what annotation types and with what sets to declare automatically for each document that is opened.  (recall that FoLiA demands all annotations to be declared and that sets can be customi-made by anyone)
* ``requiredeclaration`` -- Require that documents already have the specified declarations, and if not, refuse to load them. This is a more or less the oppossite of ``autodeclare`` and is also a list of 2-tuples ``(tag,set)``.
* ``creategroupnamespaces`` -- Boolean, automatically create namespace directories for all groups the user belongs to (upon login). The directory name corresponds to the group name.
* ``metadataindex`` -- List of metadata keys that will be shown in the document index (there is only space for a limited few).
* ``metadataconstraints``  -- Dictionary of metadata keys to lists of possible values, constrains the values in the metadata editor rather than offering a free-fill field. Example: ``'metadataconstraints': {'language': ['fr','en,'es']}``
* ``autometadata``  -- Dictionary of metadata keys and values to use when initially populating the metadata editor, these can be considered assumed defaults. Still requires the user to actually submit the form to take effect (preprocess the FoLiA documents otherwise). Example: ``'autometadata': {'language': 'fr'}``
* ``converters`` -- List of converters that can convert from arbitrary formats to FoLiA XML on document upload. See the section on converters further below for syntax.
* ``searches`` -- List of pre-defined search queries, each will get their own
  entry in the tools & options menu. Example: ``'searches': [{'query': 'SELECT entity WHERE annotatortype = "manual" FOR w RETURN target', 'label': "Highlight manually annotated entities", 'changeperspective': 'false' }]``. The ``changeperspective`` option can be enabled if you want the search to not just highlight the results, but switch perspective to display only the results. If you want a search to get automatically run on page load, add ``'auto': 'true'``.
* ``excludeclasses`` -- Map of set defniition to lists of classes to exclude in the editor. Example: ``'excludeclasses': {'https://raw.githubusercontent.com/proycon/folia/master/setdefinitions/spellingcorrection.foliaset.xml': ['missingpunctuation']}``

=====================
User permissions
=====================


FLAT comes with a simple administrative webinterface that allows to configure
user permissions. The administrative interface is accessible only by
administrators, after login, it is accessible from the right-most menu
(featuring your username).

The initial administrator should have been during installation, additional
administrators can be added by ticking the **staff** or **superuser** boxes in
the **Users** section. Superusers may always read and write in all namespaces. Users
can be added manually by administrators or they may register themselves from
the login screen. When a user logs in, a personal namespace directory will
automatically be created.

Additionaly, you can create groups and assign users to groups. By default,
users may read and write to the group namespaces they are a member of.
Additionally, if the permission *User may read documents of others in his/her
group* or *User may write documents of others in his/her group* is assigned
from the user section of the administration page, users may read/write in the
user namespaces of other members of the group.

Permissions for user/group namespaces apply to all subdirectories under it as
well.

If you set the ``creategroupnamespaces`` configuration option in
``settings.py``, group namespaces will be created automatically when a user
logs in.

-----------------
File Management
-----------------

The document index provides simple file management operations such as copying,
moving and deleting documents. By default these options are disabled except for
administators, to enable them for specific users, assign the *User may copy
documents wherever he/she has write permission* and *User may delete documents
wherever he/she has write permission*.

-------------------
Global permissions
-------------------

There are some global permission directives in your ``settings.py`` that apply to the whole FLAT installation:

* ``ALLOWPUBLICUPLOAD`` (boolean) -- Determines whether documents can be uploaded to FLAT anonymously **without logging
  in**. This turns the FLAT installation into a publicly usable FoLiA viewer and editor. Certain external tools may rely
  on this functionality.
* ``ALLOWREGISTRATION`` (boolean) -- Determines whether users are allowed to register their own account on your FLAT
  installation, if set to ``False``, accounts will have to be explicitly created by the administrator.

===============================
Preparing your data in FoLiA
===============================

----------------
Introduction
----------------

We urge people wanting to set up FLAT to familiarise themselves with `FoLiA
<https://proycon.github.io/folia>`_, as
the tool is specifically designed around this format. A main characteristic of FoLiA is
the **class/set paradigm** and the distinction of a large number of specific
**annotation types**, such as for example part-of-speech, lemma, dependencies,
syntax, co-references, semantic roles, and many more...

The values of annotations, of whatever type, are known as **classes**, which in
turn are the elements of **sets**. A set thus defines what classes exist. A set
is for example a part-of-speech tagset, and the invidual part-of-speech tags
would be the classes. **FoLiA itself never prescribes sets**, only annotation
types, it is up to the user to decide what set to use and anybody can freely
create sets! This offers a great deal of flexibility, as you can use FLAT and
FoLiA with whatever tagset you desire (provided you make a set definition for
it).

Sets are defined in Set Definition files, these tie the classes to nice human
presentable labels (they may also impose taxonomies, put constraints on class
combinations,  and link to data category registries). FLAT relies on
these set definitions a great deal, as it uses them to present the labels for
the classes. Examples of set definitions can be found here:
https://github.com/proycon/folia/tree/master/setdefinitions

For more information about FoLiA, see https://proycon.github.io/folia , the
format itself is extensively documented.

-----------------------
Right-to-left support
-----------------------

FLAT has proper right-to-left support for languages such as Arabic, Farsi and Hebrew.
This relies on the FoLiA document having either a metadata attribute
*direction* set to ``rtl``, or a properly set *language* field in the
metadata with a iso-639-1 or iso-639-3 language code of a known right-to-left
language.


--------------------------
Converters
--------------------------

Being a tool centered around the FoLiA format, FLAT requires uploaded
documentes to be in the FoLiA format. However, it also provides a framework for
plugging in your own converters to automatically convert from another format to
FoLiA XML upon upload.

These converters are configured in ``settings.py`` as follows:

.. code:: python

    'converters': [
        { 'id': 'parseme_tsv',  #a unique identifier for internal use
          'module': 'tsv2folia.tsv2folia', #the python module where the converter is implemented
          'function': 'flat_convert', #the python function (in the above module) that implements the conversion hook
          'name': "PARSEME TSV", #a human readable named, to appear in the input format drop down list
          'parameter_help': 'Set <em>"rtl": true</em> for right-to left languages', #human readable help for parameters
          'parameter_default': '"rtl": false', #default parameter, JSON syntax without the envelopping {}
          'inputextensions': ['tsv'], #input extensions that must be adhered to, and will be stripped for determining the output filename
        }
    ],

Each configured converted is a Python dictionary with pre-defined keys that
must be defined. Writing the actual converter is a more advanced topic that
requires Python knowledge. Based on the above configuration, FLAT imports the
converter as follows:

.. code:: python

    from tsv2folia.tsv2folia import flat_convert

The function ``flat_convert``, or however you name it, is required to have
the following signature:

.. code:: python

    def flat_convert(filename, targetfilename, *args, **kwargs):
        ...
        if success:
            return True
        else:
            return False, "Some error message"

Parameters (see converter configuration option ``parameter_default``) are
passed as keyword arguments. FLAT's entire configuration (i.e. all the options
from ``settings.py`` explained in the first section) is passed as a
dictionary in keyword argument ``flatconfiguration``, allowing your converter to be aware of the
context in which it is run. The positional arguments (``args``) are not used at
this time. Your converter function should a boolean to indicate success or in
case of failure it can return a 2-tuple containing ``False``, and an error message string.

------------------------------------------------
How to get my document into the FoLiA format?
------------------------------------------------

Again, we first urge people o familiarise themselves with `FoLiA <https://proycon.github.io/folia>`_. To get your
document into FoLiA; you may use certain existing options, depending on the source format you are departing from.  One
of the most basic options if you start with plain text documents is to use the `ucto tokeniser
<https://languagemachines.github.io/ucto/>`_. This tool tokenises your document and can produce FoLiA XML output. It
supports multiple languages. Tokenisation is a necessary prerequisite for most forms of linguistic annotation so is a
good starting point.

There are also many dedicated NLP tools that produce FoLiA output and as-such can be imported directly into FLAT.
Examples are `Frog <https://languagemachines.github.io/frog/>`_ (for various kinds of linguistic enrichment on Dutch
texts), `Gecco <https://github.com/proycon/gecco/>`_ (a spelling correction system), and `PICCL
<https://github.com/LanguageMachines/PICCL>`_ (a corpus creation pipeline including OCR and post-OCR normalisation).

Various other converters are available as part of the FoLiA Tools (https://pypi.python.org/pypi/FoLiA-tools). A notable
example is ``rst2folia`` a convertor from ReStructuredText to FoLiA that can accurately convert document structure
(things like bulleted lists, etc). The output of this could again be fed to ``ucto`` for tokenisation.

If you have another format, it should not be hard to write a Python script to convert it to FoLiA using the FoLiA
library for Python (part of `PyNLPl <https://pypi.python.org/pypi/PyNLPl>`_ and extensively `documented here <
http://pynlpl.readthedocs.io/en/latest/folia.html>`_. An example of such a conversion script, from a tab delimited
columned format for a particular annotation task, can be found `here <https://github.com/proycon/parseme-support>`_,
this tool also has been turned into a converter that can be plugged into FLAT, as described in the previous section.

-------------------------------------------------------
Public/anonymous upload for third-party applications
-------------------------------------------------------

If the ``ALLOWPUBLICUPLOAD`` parameter is set to ``True`` in your configuration, then FLAT enables a web-API endpoint
where third-party applications can upload FoLiA documents and load them in any of available FLAT configurations. The
uploaded documents are not publicly browsable but are identified by their URL, so sharing the URL enables everybody to
view and edit that particular document. Note that these URLs are completely separate (recognisable by ``/pub/`` in the
URL) from the documents in the authenticated user workspaces, for which this principle does not apply.

To upload a document, issue a HTTP POST with request on ``/pub/upload`` with Content-Type ``multipart/form-data``
(i.e. a regular HTTP file upload), and with the following fields:

* ``file``, the contents of the file you want to upload (mandatory)
* ``inputformat``, optional parameter indicating the input type, this is only relevant when your FLAT installation has an automatic converter installed to convert it to FoLiA.
* ``configuration``, the configuration you would like to open FLAT in (i.e. usually corresponding with a particular annotation task). You can query ``/config`` to get a JSON representation of all possible configurations and their settings. If not set, the default of the FLAT installation will be chosen automatically.
* ``mode``, the mode you would like to open FLAT in (viewer, editor, etc). If not set, the default of the FLAT installation will be chosen automatically.

The following example shows how to use this funcionality through ``curl``, in this example FLAT is hosted on ``http://127.0.01:8080/flat``::

   curl -v -F "mode=editor" -F "file=@/path/to/file"`` http://127.0.0.1:8080/flat/pub/upload

This API end-point will respond with a HTTP 302 Redirect response to ``/pub/<CONFIGURATION>/<DOCUMENT_ID>`` after a successful upload, redirecting you to the document.
The document ID is obtained from the uploaded FoLiA document (as specified in the document), so doesn't necessarily correspond to the filename used during upload.

If you at any point want to retrieve the document from FLAT again (e.g. after editing), issue a HTTP GET request on ``/download/pub/<DOCUMENT_ID>.folia.xml``.




