.. FLAT documentation master file, created by
   sphinx-quickstart on Fri Sep 23 19:16:44 2016.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.


FLAT - FoLiA Linguistic Annotation Tool - Documentation
==========================================================

FLAT is a web-based linguistic annotation environment based around the FoLiA
format (http://proycon.github.io/folia), a rich XML-based format for linguistic
annotation. FLAT allows users to view annotated FoLiA documents and enrich
these documents with new annotations, a wide variety of linguistic annotation
types is supported through the FoLiA paradigm. It is a document-centric tool
that fully preserves and visualises document structure.

The project is in its early stages but already quite functional and in
practical use in an academic setting.

FLAT is written in Python using the Django framework. The user interface is
written using javascript with jquery.  The FoLiA Document Server
(https://github.com/proycon/foliadocserve) , the back-end
of the system, is written in Python with CherryPy and is used as a RESTful
webservice. 

FLAT is open source software developed at the Centre of Language and Speech
Technology, Radboud University Nijmegen. It is licensed under the GNU Public
License v3. The system's source code can be obtained from
https://github.com/proycon/flat . The project is funded in the scope of the
larger `CLARIAH <http://clariah.nl>`_ project.

Contents:

.. toctree::
   :maxdepth: 2
   :glob: 

   *

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

