*****************************************
FLAT User Guide
*****************************************

========
Login
========

When you open FLAT, you will be presented a login screen. This is where you
enter your username and password, as well as select what *configuration* you
want to use. FLAT supports multiple *configurations*, which allows
for using the same FLAT installation for multiple annotation projects, choose
the configuration that corresponds to your project.

.. image:: login_configuration.png
    :alt: Configuration selection in the FLAT login screen
    :align: center

The login form may or may not offer an option to register a user account, if
you do not have one yet.


===================
Document Index
===================

After logging in, you will see an index of all your documents, organised into
folders and possibly subfolders. By default, there will be one folder
corresponding to your username. This is your personal workspace.

You can select a file to load it into the tool, this will usually present you
the annotation editor.

You may also see directories of others if the administrators have given you
explicit rights to do so.

.. image:: mydocuments.png
    :alt: Document index in FLAT
    :align: center

---------------------
Upload document
---------------------

You can upload FoLiA documents by clicking the **Upload document** button
and selecting a local file to upload. Note that only `FoLiA
<https://proycon.github.io/folia/>`_ documents are
supported, a very specific file format for linguistic annotation.

Administrators may have disabled this functionality.

===================
Modes
===================

FLAT supports various modes that determines what tools you are presented. Often
the default mode is the annotation editor, but there is also a viewer (with no
edit functionality), a simple metadata editor and a structure editor (still under
development). You may switch modes in the menu:

.. image:: menu_modes.png
    :alt: Modes in FLAT
    :align: center

Administrators determine what modes are available in your configuration.

=======================
Annotation Viewer
=======================

The annotation viewer shows a FoLiA document and all of its linguistic
annotations. You will see the text of the document and find that you can hover
over all the words and elements to see more detailed information about them.

.. image:: hover.png
    :alt: Local annotations in FLAT
    :align: center

Viewing a document seems trivial, but it is a bit more involved,
as FLAT allows to fine-tune precisely what annotations you want to see.

The information you see when hovering over elements can be switched on and off
in the **Local annotations** menu, each annotation type is a toggle that turns
green when enabled. The administrators usually have configured sane defaults,
so you will not have to go here often.

To see linguistic information without needing to hover over elements, you can enable the
toggles in the **Global annotations** menu. In the following screenshot we
enabled lemmas and part of speech tags:

.. image:: globalannotations.png
    :alt: Global annotations in FLAT
    :align: center

And this shows a representation for dependency relations (purple) and syntactic/constituency parses (blue):

.. image:: globalannotations2.png
    :alt: Global annotations in FLAT
    :align: center

Last, but not least is the **Annotation Focus** menu. Here you can select a
single annotation type that is the focus of your attention. The various classes
of this annotation type in the text will then be coloured and a legend appears
on the left side of the document. An example for part-of-speech tags:

.. image:: highlight1.png
    :alt: FLAT screenshot
    :align: center

.. image:: highlight2.png
    :alt: FLAT screenshot
    :align: center

--------------
Perspectives
--------------

FLAT allows, depending on your configuration, for different *perspectives* on
your document. A perspective determines what structural elements you see, and
how much of them you see. The broadest perspective is the *document*
perspective, which simply shows the whole document, provided it is not too
large. Other perspectives can be the *paragraph* or *sentence* perspective,
showing only these elements. For documents with a large number of paragraphs or
sentences, you can page over multiple pages.

On the left-hand side of the screen, you can choose the perspectives that
administrators have predefined for you:

.. image:: perspectivemenu.png
    :alt: Perspectives in FLAT
    :align: center

The pager is shown below the perspective selector, once you have selected a
pagable perspective. In the following example, a sentence perspective is
selected. You will notice that the sentences are now visually separated and
lightly boxed:

.. image:: sentenceperspective.png
    :alt: Perspectives in FLAT
    :align: center

A special perspective, available only on documents properly segmented into
divisions, is offered in the same menu by means of a table of contents.

--------------------
Tools and Options
--------------------

The **Tools & Options** menu offers extra facilities for viewing. You can for
instance enable the toggle **Show annotator details** to show who annotated a
particular annotation when you hover over it, and when exactly this was done.

~~~~~~~~~
Search
~~~~~~~~~

You can access the search function through the **Tools & Options** menu. The
search dialogue allows you to enter complex queries using CQL, the Corpus Query
Language, or FQL, the FoLiA Query Language.

(TODO: needs further documentation)

=======================
Annotation Editor
=======================

The annotation editor builds upon the viewer discussed in the previous section
and adds advanced editing facilities. Make sure you are familiar with the
viewer already.

Annotation is always initiated by clicking on a word you want to annotate. If
you want to annotate a span of multiple words, start by just clicking on the
first one. This will open the **Annotation Editor dialog**.

(TODO: yet to be written)

--------------
Edit Forms
--------------

When annotating, there are four different edit forms:

* **Direct editing** -- This is the simplest edit form, it either adds a new annotation or edits an existing annotation.
* **New annotation** -- This edit form is used when you want to explicitly add a new annotation rather than edit an existing annotation of the same type. It is used when defining overlapping spans for the same annotation type.
* **Correction** -- This edit forms introduces a correction of the annotation, the original version will be preserved and marked as corrected. When this edit form is choosen a field will appear to choose the class for the correction, indicating what type of correction it is.
* **Alternative** -- This edit form marks an annotation as alternative, meaning it is not the primary authoritative annotation.

The edit forms are represented by options buttons with a capital letter, only one of
them can be activated:

.. image:: editforms.png
    :alt: Perspectives in FLAT
    :align: center


--------------------
Tools and Options
--------------------

(TODO: yet to be written)


=======================
Metadata Editor
=======================

(TODO: yet to be written)
























