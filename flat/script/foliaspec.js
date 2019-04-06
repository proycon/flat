foliaspec = {
    "annotationtype": [
        "TEXT",
        "TOKEN",
        "DIVISION",
        "PARAGRAPH",
        "HEAD",
        "LIST",
        "FIGURE",
        "WHITESPACE",
        "LINEBREAK",
        "SENTENCE",
        "POS",
        "LEMMA",
        "DOMAIN",
        "SENSE",
        "SYNTAX",
        "CHUNKING",
        "ENTITY",
        "CORRECTION",
        "ERRORDETECTION",
        "PHON",
        "SUBJECTIVITY",
        "MORPHOLOGICAL",
        "EVENT",
        "DEPENDENCY",
        "TIMESEGMENT",
        "GAP",
        "QUOTE",
        "NOTE",
        "REFERENCE",
        "RELATION",
        "SPANRELATION",
        "COREFERENCE",
        "SEMROLE",
        "METRIC",
        "LANG",
        "STRING",
        "TABLE",
        "STYLE",
        "PART",
        "UTTERANCE",
        "ENTRY",
        "TERM",
        "DEFINITION",
        "EXAMPLE",
        "PHONOLOGICAL",
        "PREDICATE",
        "OBSERVATION",
        "SENTIMENT",
        "STATEMENT",
        "ALTERNATIVE",
        "RAWCONTENT",
        "COMMENT",
        "DESCRIPTION",
        "HYPHENATION",
        "HIDDENTOKEN"
    ],
    "annotationtype_doc": {
        "alternative": {
            "description": "This form of higher-order annotation encapsulates alternative annotations, i.e. annotations that are posed as an alternative option rather than the authoratitive chosen annotation",
            "history": "Since the beginning, may carry set and classes since v2.0",
            "name": "Alternative Annotation"
        },
        "chunking": {
            "description": "Assigns shallow grammatical categories to spans of words. Unlike syntax annotation, chunks are not nestable. They are often produced by a process called Shallow Parsing, or alternatively, chunking.",
            "history": "Since the beginning",
            "name": "Chunking"
        },
        "comment": {
            "description": "This is a form of higher-order annotation that allows you to associate comments with almost all other annotation elements",
            "history": "Since v1.3",
            "name": "Comment Annotation"
        },
        "coreference": {
            "description": "Relations between words that refer to the same referent (anaphora) are expressed in FoLiA using Coreference Annotation. The co-reference relations are expressed by specifying the entire chain in which all links are coreferent.",
            "history": "since v0.9",
            "name": "Coreference Annotation"
        },
        "correction": {
            "description": "Corrections are one of the most complex annotation types in FoLiA. Corrections can be applied not just over text, but over any type of structure annotation, inline annotation or span annotation. Corrections explicitly preserve the original, and recursively so if corrections are done over other corrections.",
            "history": "Since v0.4",
            "name": "Correction Annotation"
        },
        "definition": {
            "description": "FoLiA has a set of structure elements that can be used to represent collections such as glossaries, dictionaries, thesauri, and wordnets. `Entry annotation` defines the entries in such collections, `Term annotation` defines the terms, and `Definition Annotation` provides the definitions.",
            "history": "since v0.12",
            "name": "Definition Annotation"
        },
        "dependency": {
            "description": "Dependency relations are syntactic relations between spans of tokens. A dependency relation takes a particular class and consists of a single head component and a single dependent component.",
            "history": "Slightly revised since v0.8 (no ``su`` attribute on ``hd``/``dep``)",
            "name": "Dependency Annotation"
        },
        "description": {
            "description": "This is a form of higher-order annotation that allows you to associate descriptions with almost all other annotation elements",
            "history": "Since the beginning",
            "name": "Description Annotation"
        },
        "division": {
            "description": "Structure annotation representing some kind of division, typically used for chapters, sections, subsections (up to the set definition). Divisions may be nested at will, and may include almost all kinds of other structure elements.",
            "history": "Since the beginning",
            "name": "Division Annotation"
        },
        "domain": {
            "description": "Domain/topic Annotation. A form of inline annotation used to assign a certain domain or topic to a structure element.",
            "history": "Since the beginning",
            "name": "Domain/topic Annotation"
        },
        "entity": {
            "description": "Entity annotation is a broad and common category in FoLiA. It is used for specifying all kinds of multi-word expressions, including but not limited to named entities. The set definition used determines the vocabulary and therefore the precise nature of the entity annotation.",
            "history": "Since the beginning",
            "name": "Entity Annotation"
        },
        "entry": {
            "description": "FoLiA has a set of structure elements that can be used to represent collections such as glossaries, dictionaries, thesauri, and wordnets. `Entry annotation` defines the entries in such collections, `Term annotation` defines the terms, and `Definition Annotation` provides the definitions.",
            "history": "since v0.12",
            "name": "Entry Annotation"
        },
        "errordetection": {
            "description": "This annotation type is deprecated in favour of `Observation Annotation` and only exists for backward compatibility.",
            "history": "Deprecated since v2.0.0",
            "name": "Error Detection"
        },
        "event": {
            "description": "Structural annotation type representing events, often used in new media contexts for things such as tweets, chat messages and forum posts (as defined by a user-defined set definition). Note that a more linguistic kind of event annotation can be accomplished with `Entity Annotation` or even `Time Segmentation` rather than this one.",
            "history": "since v0.7",
            "name": "Event Annotation"
        },
        "example": {
            "description": "FoLiA has a set of structure elements that can be used to represent collections such as glossaries, dictionaries, thesauri, and wordnets. `Examples annotation` defines examples in such collections.",
            "history": "since v0.12",
            "name": "Example Annotation"
        },
        "figure": {
            "description": "Structure annotation for including pictures, optionally captioned, in documents.",
            "history": "Since the beginning",
            "name": "Figure Annotation"
        },
        "gap": {
            "description": "Sometimes there are parts of a document you want to skip and not annotate at all, but include as is. This is where gap annotation comes in, the user-defined set may indicate the kind of gap. Common omissions in books are for example front-matter and back-matter, i.e. the cover.",
            "history": "Since the beginning",
            "name": "Gap Annotation"
        },
        "head": {
            "description": "The ``head`` element is used to provide a header or title for the structure element in which it is embedded, usually a division (``<div>``)",
            "history": "Since the beginning",
            "name": "Head Annotation"
        },
        "hiddentoken": {
            "description": "This annotation type allows for a hidden token layer in the document. Hidden tokens are ignored for most intents and purposes but may serve a purpose when annotations on implicit tokens is required, for example as targets for syntactic movement annotation.",
            "history": "Since v2.0",
            "name": "Hidden Token Annotation"
        },
        "hyphenation": {
            "description": "This is a text-markup annotation form that indicates where in the original text a linebreak was inserted and a word was hyphenised.",
            "history": "Since v2.0",
            "name": "Hyphenation Annotation"
        },
        "lang": {
            "description": "Language Annotation simply identifies the language a part of the text is in. Though this information is often part of the metadata, this form is considered an actual annotation.",
            "history": "since v0.8.1",
            "name": "Language Annotation"
        },
        "lemma": {
            "description": "Lemma Annotation, one of the most common types of linguistic annotation. Represents the canonical form of a word.",
            "history": "Since the beginning",
            "name": "Lemmatisation"
        },
        "linebreak": {
            "description": "Structure annotation representing a single linebreak and with special facilities to denote pagebreaks.",
            "history": "Since the beginning",
            "name": "Linebreak"
        },
        "list": {
            "description": "Structure annotation for enumeration/itemisation, e.g. bulleted lists.",
            "history": "Since the beginning",
            "name": "List Annotation"
        },
        "metric": {
            "description": "Metric Annotation is a form of higher-order annotation that allows annotation of some kind of measurement. The type of measurement is defined by the class, which in turn is defined by the set as always. The metric element has a ``value`` attribute that stores the actual measurement, the value is often numeric but this needs not be the case.",
            "history": "since v0.9",
            "name": "Metric Annotation"
        },
        "morphological": {
            "description": "Morphological Annotation allows splitting a word/token into morphemes, morphemes itself may be nested. It is embedded within a layer ``morphology`` which can be embedded within word/tokens.",
            "history": "Heavily revised since v0.9",
            "name": "Morphological Annotation"
        },
        "note": {
            "description": "Structural annotation used for notes, such as footnotes or warnings or notice blocks.",
            "history": "Since v0.11",
            "name": "Note Annotation"
        },
        "observation": {
            "description": "Observation annotation is used to make an observation pertaining to one or more word tokens.  Observations offer a an external qualification on part of a text. The qualification is expressed by the class, in turn defined by a set. The precise semantics of the observation depends on the user-defined set.",
            "history": "since v1.3",
            "name": "Observation Annotation"
        },
        "paragraph": {
            "description": "Represents a paragraph and holds further structure annotation such as sentences.",
            "history": "Since the beginning",
            "name": "Paragraph Annotation"
        },
        "part": {
            "description": "The structure element ``part`` is a fairly abstract structure element that should only be used when a more specific structure element is not available. Most notably, the part element should never be used for representation of morphemes or phonemes! Part can be used to divide a larger structure element, such as a division, or a paragraph into arbitrary subparts.",
            "history": "since v0.11.2",
            "name": "Part Annotation"
        },
        "phon": {
            "description": "This is the phonetic analogy to text content (``<t>``) and allows associating a phonetic transcription with any structural element, it is often used in a speech context. Note that for actual segmentation into phonemes, FoLiA has another related type: ``Phonological Annotation``",
            "history": "Since v0.12",
            "name": "Phonetic Annotation"
        },
        "phonological": {
            "description": "The smallest unit of annotatable speech in FoLiA is the phoneme level. The phoneme element is a form of structure annotation used for phonemes.  Alike to morphology, it is embedded within a layer ``phonology`` which can be embedded within word/tokens.",
            "history": "since v0.12",
            "name": "Phonological Annotation"
        },
        "pos": {
            "description": "Part-of-Speech Annotation, one of the most common types of linguistic annotation. Assigns a lexical class to words.",
            "history": "Since the beginning",
            "name": "Part-of-Speech Annotation"
        },
        "predicate": {
            "description": "Allows annotation of predicates, this annotation type is usually used together with Semantic Role Annotation. The types of predicates are defined by a user-defined set definition.",
            "history": "since v1.3",
            "name": "Predicate Annotation"
        },
        "quote": {
            "description": "Structural annotation used to explicitly mark quoted speech, i.e. that what is reported to be said and appears in the text in some form of quotation marks.",
            "history": "Since v0.11",
            "name": "Quote Annotation"
        },
        "rawcontent": {
            "description": "This associates raw text content which can not carry any further annotation. It is used in the context of :ref:`gap_annotation`",
            "history": "Since the beginning, but revised and made a proper annotation type in v2.0",
            "name": "Raw Content"
        },
        "reference": {
            "description": "Structural annotation for referring to other annotation types. Used e.g. for referring to bibliography entries (citations) and footnotes.",
            "history": "Since v0.11, external references since v1.2",
            "name": "Reference Annotation"
        },
        "relation": {
            "description": "FoLiA provides a facility to relate arbitrary parts of your document with other parts of your document, or even with parts of other FoLiA documents or external resources, even in other formats. It thus allows linking resources together. Within this context, the ``xref`` element is used to refer to the linked FoLiA elements.",
            "history": "Revised since v0.8, renamed from alignment in v2.0",
            "name": "Relation Annotation"
        },
        "semrole": {
            "description": "This span annotation type allows for the expression of semantic roles, or thematic roles. It is often used together with `Predicate Annotation`",
            "history": "since v0.9, revised since v1.3 (added predicates)",
            "name": "Semantic Role Annotation"
        },
        "sense": {
            "description": "Sense Annotation allows to assign a lexical semantic sense to a word.",
            "history": "Since the beginning",
            "name": "Sense Annotation"
        },
        "sentence": {
            "description": "Structure annotation representing a sentence. Sentence detection is a common stage in NLP alongside tokenisation.",
            "history": "Since the beginning",
            "name": "Sentence Annotation"
        },
        "sentiment": {
            "description": "Sentiment analysis marks subjective information such as sentiments or attitudes expressed in text. The sentiments/attitudes are defined by a user-defined set definition.",
            "history": "since v1.3",
            "name": "Sentiment Annotation"
        },
        "spanrelation": {
            "description": "Span relations are a stand-off extension of relation annotation that allows for more complex relations, such as word alignments that include many-to-one, one-to-many or many-to-many alignments. One of its uses is in the alignment of multiple translations of (parts) of a text.",
            "history": "since v0.8, renamed from complexalignment in v2.0",
            "name": "Span Relation Annotation"
        },
        "statement": {
            "description": "Statement annotation, sometimes also refered to as attribution, allows to decompose statements into the source of the statement, the content of the statement, and the way these relate, provided these are made explicit in the text.",
            "history": "since v1.3",
            "name": "Statement Annotation"
        },
        "string": {
            "description": "This is a form of higher-order annotation for selecting an arbitrary substring of a text, even untokenised, and allows further forms of higher-order annotation on the substring. It is also tied to a form of text markup annotation.",
            "history": "since v0.9.1",
            "name": "String Annotation"
        },
        "style": {
            "description": "This is a text markup annotation type for applying styling to text. The actual styling is defined by the user-defined set definition and can for example included classes such as italics, bold, underline",
            "history": "since v0.10",
            "name": "Style Annotation"
        },
        "subjectivity": {
            "description": "This annotation type is deprecated in favour of `Sentiment Annotation` and only exists for backward compatibility.",
            "history": "Deprecated since v1.5",
            "name": "Subjectivity Annotation"
        },
        "syntax": {
            "description": "Assign grammatical categories to spans of words. Syntactic units are nestable and allow representation of complete syntax trees that are usually the result of consistuency parsing.",
            "history": "Since the beginning",
            "name": "Syntactic Annotation"
        },
        "table": {
            "description": "Structural annotation type for creating a simple tabular environment, i.e. a table with rows, columns and cells and an optional header.",
            "history": "since v0.9.2",
            "name": "Table Annotation"
        },
        "term": {
            "description": "FoLiA has a set of structure elements that can be used to represent collections such as glossaries, dictionaries, thesauri, and wordnets. `Entry annotation` defines the entries in such collections, `Term annotation` defines the terms, and `Definition Annotation` provides the definitions.",
            "history": "since v0.12",
            "name": "Term Annotation"
        },
        "text": {
            "description": "Text annotation associates actual textual content with structural elements, without it a document would be textless. FoLiA treats it as an annotation like any other.",
            "history": "Since the beginning, revised since v0.6",
            "name": "Text Annotation"
        },
        "timesegment": {
            "description": "FoLiA supports time segmentation to allow for more fine-grained control of timing information by associating spans of words/tokens with exact timestamps. It can provide a more linguistic alternative to `Event Annotation`.",
            "history": "Since v0.8 but renamed since v0.9",
            "name": "Time Segmentation"
        },
        "token": {
            "description": "This annotation type introduces a tokenisation layer for the document. The terms **token** and **word** are used interchangeably in FoLiA as FoLiA itself does not commit to a specific tokenisation paradigm. Tokenisation is a prerequisite for the majority of linguistic annotation types offered by FoLiA and it is one of the most fundamental types of Structure Annotation. The words/tokens are typically embedded in other types of structure elements, such as sentences or paragraphs.",
            "history": "Since the beginning",
            "name": "Token Annotation"
        },
        "utterance": {
            "description": "An utterance is a structure element that may consist of words or sentences, which in turn may contain words. The opposite is also true, a sentence may consist of multiple utterances. Utterances are often used in the absence of sentences in a speech context, where neat grammatical sentences can not always be distinguished.",
            "history": "since v0.12",
            "name": "Utterance Annotation"
        },
        "whitespace": {
            "description": "Structure annotation introducing vertical whitespace",
            "history": "Since the beginning",
            "name": "Whitespace"
        }
    },
    "attributes": [
        "ID",
        "CLASS",
        "ANNOTATOR",
        "CONFIDENCE",
        "N",
        "DATETIME",
        "BEGINTIME",
        "ENDTIME",
        "SRC",
        "SPEAKER",
        "TEXTCLASS",
        "METADATA",
        "IDREF",
        "SPACE"
    ],
    "attributes_doc": {
        "annotator": {
            "description": "This is an older alternative to the ``processor`` attribute, without support for full provenance. The annotator attribute simply refers to the name o ID of the system or human annotator that made the annotation.",
            "group": "authorship",
            "name": "annotator"
        },
        "annotatortype": {
            "description": "This is an older alternative to the ``processor`` attribute, without support for full provenance. It is used together with ``annotator`` and specific the type of the annotator, either ``manual`` for human annotators or ``auto`` for automated systems.",
            "group": "authorship",
            "name": "annotatortype"
        },
        "begintime": {
            "description": "A timestamp in ``HH:MM:SS.MMM`` format, indicating the begin time of the speech. If a sound clip is specified (``src``); the timestamp refers to a location in the soundclip.",
            "group": "speech",
            "name": "begintime"
        },
        "class": {
            "description": "The class of the annotation, i.e. the annotation tag in the vocabulary defined by ``set``.",
            "group": "core",
            "name": "class"
        },
        "confidence": {
            "description": "A floating point value between zero and one; expresses the confidence the annotator places in his annotation.",
            "group": "annotation",
            "name": "confidence"
        },
        "datetime": {
            "description": "The date and time when this annotation was recorded, the format is ``YYYY-MM-DDThh:mm:ss`` (note the literal T in the middle to separate date from time), as per the XSD Datetime data type.",
            "group": "annotation",
            "name": "datetime"
        },
        "endtime": {
            "description": "A timestamp in ``HH:MM:SS.MMM`` format, indicating the end time of the speech. If a sound clip is specified (``src``); the timestamp refers to a location in the soundclip.",
            "group": "speech",
            "name": "endtime"
        },
        "id": {
            "description": "The ID of the element; this has to be a unique in the entire document or collection of documents (corpus). All identifiers in FoLiA are of the `XML NCName <https://www.w3.org/TR/1999/WD-xmlschema-2-19990924/#NCName>`_ datatype, which roughly means it is a unique string that has to start with a letter (not a number or symbol), may contain numers, but may never contain colons or spaces. FoLiA does not define any naming convention for IDs.",
            "group": "core",
            "name": "xml:id"
        },
        "idref": {
            "description": "A reference to the ID of another element. This is a reference and not an assignment, unlike xml:id, so do not confuse the two! It is only supported on certain elements that are referential in nature.",
            "group": "core",
            "name": "id"
        },
        "n": {
            "description": "A number in a sequence, corresponding to a number in the original document, for example chapter numbers, section numbers, list item numbers. This this not have to be an actual number but other sequence identifiers are also possible (think alphanumeric characters or roman numerals).",
            "group": "annotation",
            "name": "n"
        },
        "processor": {
            "description": "This refers to the ID of a processor in the :ref:`provenance_data`. The processor in turn defines exactly who or what was the annotator of the annotation.",
            "group": "provenance",
            "name": "processor"
        },
        "set": {
            "description": "The set of the element, ideally a URI linking to a set definition (see :ref:`set_definitions`) or otherwise a uniquely identifying string. The ``set`` must be referred to also in the :ref:`annotation_declarations` for this annotation type.",
            "group": "core",
            "name": "set"
        },
        "space": {
            "description": "This attribute indicates whether spacing should be inserted after this element (it's default value is always ``yes``, so it does not need to be specified in that case), but if tokens or other structural elements are glued together then the value should be set to ``no``. This allows for reconstruction of the detokenised original text. ",
            "group": "annotation",
            "name": "space"
        },
        "speaker": {
            "description": "A string identifying the speaker. This attribute is inheritable. Multiple speakers are not allowed, simply do not specify a speaker on a certain level if you are unable to link the speech to a specific (single) speaker.",
            "group": "speech",
            "name": "speaker"
        },
        "src": {
            "description": "Points to a file or full URL of a sound or video file. This attribute is inheritable.",
            "group": "speech",
            "name": "src"
        },
        "textclass": {
            "description": "Refers to the text class this annotation is based on. This is an advanced attribute, if not specified, it defaults to ``current``. See :ref:`textclass_attribute`.",
            "group": "annotation",
            "name": "textclass"
        }
    },
    "categories": {
        "content": {
            "class": "AbstractContentAnnotation",
            "description": "This category groups text content and phonetic content, the former being one of the most frequent elements in FoLiA and used to associate text (or a phonetic transcription) with a structural element.",
            "name": "Content Annotation"
        },
        "higherorder": {
            "class": "AbstractHigherOrderAnnotation",
            "description": "Higher-order Annotation groups a very diverse set of annotation types that are considered *annotations on annotations*",
            "name": "Higher-order Annotation"
        },
        "inline": {
            "class": "AbstractInlineAnnotation",
            "description": "This category encompasses (linguistic) annotation types describing a single structural element. Examples are Part-of-Speech Annotation or Lemmatisation, which often describe a single token.",
            "name": "Inline Annotation"
        },
        "span": {
            "class": "AbstractSpanAnnotation",
            "description": "This category encompasses (linguistic) annotation types that span one or more structural elements. Examples are (Named) Entities or Multi-word Expressions, Dependency Relations, and many others. FoLiA implements these as a stand-off layer that refers back to the structural elements (often words/tokens). The layer itself is embedded in a structural level of a wider scope (such as a sentence).",
            "name": "Span Annotation"
        },
        "structure": {
            "class": "AbstractStructureElement",
            "description": "This category encompasses annotation types that define the structure of a document, e.g. paragraphs, sentences, words, sections like chapters, lists, tables, etc... These types are not strictly considered linguistic annotation and equivalents are also commonly found in other document formats such as HTML, TEI, MarkDown, LaTeX, and others. For FoLiA it provides the necessary structural basis that linguistic annotation can build on.",
            "name": "Structure Annotation"
        },
        "subtoken": {
            "class": "AbstractSubtokenAnnotation",
            "description": "This category contains morphological annotation and phonological annotation, i.e. the segmentation of a word into morphemes and phonemes, and recursively so if desired. It is a special category that mixes characteristics from structure annotation (the ``morpheme`` and ``phoneme`` elements are very structure-like) and also from span annotation, as morphemes and phonemes are embedded in an annotation layer and refer back to the text/phonetic content they apply to. Like words/tokens, these elements may also be referenced from ``wref`` elements.",
            "name": "Subtoken Annotation"
        },
        "textmarkup": {
            "class": "AbstractTextMarkup",
            "description": "The text content element (``<t>``) allows within its scope elements of a this category; these are **Text Markup** elements, they always contain textual content and apply a certain markup to certain spans of the text. One of it's common uses is for styling (emphasis, underlines, etc.). Text markup elements may be nested.",
            "name": "Text Markup Annotation"
        }
    },
    "default_ignore": [
        "Original",
        "Suggestion",
        "Alternative",
        "AlternativeLayers",
        "ForeignData"
    ],
    "default_ignore_annotations": [
        "Original",
        "Suggestion",
        "Alternative",
        "AlternativeLayers",
        "MorphologyLayer",
        "PhonologyLayer"
    ],
    "default_ignore_structure": [
        "Original",
        "Suggestion",
        "Alternative",
        "AlternativeLayers",
        "AbstractAnnotationLayer"
    ],
    "defaultproperties": {
        "accepted_data": [
            "Description",
            "Comment"
        ],
        "annotationtype": null,
        "auth": true,
        "auto_generate_id": false,
        "occurrences": 0,
        "occurrences_per_set": 0,
        "optional_attribs": null,
        "phoncontainer": false,
        "primaryelement": true,
        "printable": false,
        "required_attribs": null,
        "required_data": null,
        "setonly": false,
        "speakable": false,
        "subset": null,
        "textcontainer": false,
        "textdelimiter": null,
        "wrefable": false,
        "xlink": false,
        "xmltag": null
    },
    "elements": [
        {
            "class": "AbstractAnnotationLayer",
            "elements": [
                {
                    "class": "ChunkingLayer",
                    "properties": {
                        "accepted_data": [
                            "Chunk"
                        ],
                        "annotationtype": "CHUNKING",
                        "primaryelement": false,
                        "xmltag": "chunking"
                    }
                },
                {
                    "class": "SpanRelationLayer",
                    "properties": {
                        "accepted_data": [
                            "SpanRelation"
                        ],
                        "annotationtype": "SPANRELATION",
                        "primaryelement": false,
                        "xmltag": "spanrelations"
                    }
                },
                {
                    "class": "CoreferenceLayer",
                    "properties": {
                        "accepted_data": [
                            "CoreferenceChain"
                        ],
                        "annotationtype": "COREFERENCE",
                        "primaryelement": false,
                        "xmltag": "coreferences"
                    }
                },
                {
                    "class": "DependenciesLayer",
                    "properties": {
                        "accepted_data": [
                            "Dependency"
                        ],
                        "annotationtype": "DEPENDENCY",
                        "primaryelement": false,
                        "xmltag": "dependencies"
                    }
                },
                {
                    "class": "EntitiesLayer",
                    "properties": {
                        "accepted_data": [
                            "Entity"
                        ],
                        "annotationtype": "ENTITY",
                        "primaryelement": false,
                        "xmltag": "entities"
                    }
                },
                {
                    "class": "MorphologyLayer",
                    "properties": {
                        "accepted_data": [
                            "Morpheme"
                        ],
                        "annotationtype": "MORPHOLOGICAL",
                        "primaryelement": false,
                        "xmltag": "morphology"
                    }
                },
                {
                    "class": "ObservationLayer",
                    "properties": {
                        "accepted_data": [
                            "Observation"
                        ],
                        "annotationtype": "OBSERVATION",
                        "primaryelement": false,
                        "xmltag": "observations"
                    }
                },
                {
                    "class": "PhonologyLayer",
                    "properties": {
                        "accepted_data": [
                            "Phoneme"
                        ],
                        "annotationtype": "PHONOLOGICAL",
                        "primaryelement": false,
                        "xmltag": "phonology"
                    }
                },
                {
                    "class": "SemanticRolesLayer",
                    "properties": {
                        "accepted_data": [
                            "SemanticRole",
                            "Predicate"
                        ],
                        "annotationtype": "SEMROLE",
                        "primaryelement": false,
                        "xmltag": "semroles"
                    }
                },
                {
                    "class": "SentimentLayer",
                    "properties": {
                        "accepted_data": [
                            "Sentiment"
                        ],
                        "annotationtype": "SENTIMENT",
                        "primaryelement": false,
                        "xmltag": "sentiments"
                    }
                },
                {
                    "class": "StatementLayer",
                    "properties": {
                        "accepted_data": [
                            "Statement"
                        ],
                        "annotationtype": "STATEMENT",
                        "primaryelement": false,
                        "xmltag": "statements"
                    }
                },
                {
                    "class": "SyntaxLayer",
                    "properties": {
                        "accepted_data": [
                            "SyntacticUnit"
                        ],
                        "annotationtype": "SYNTAX",
                        "primaryelement": false,
                        "xmltag": "syntax"
                    }
                },
                {
                    "class": "TimingLayer",
                    "properties": {
                        "accepted_data": [
                            "TimeSegment"
                        ],
                        "annotationtype": "TIMESEGMENT",
                        "primaryelement": false,
                        "xmltag": "timing"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "Correction",
                    "ForeignData"
                ],
                "optional_attribs": [
                    "ID",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME",
                    "N",
                    "TEXTCLASS",
                    "METADATA"
                ],
                "printable": false,
                "setonly": true,
                "speakable": false
            }
        },
        {
            "class": "AbstractCorrectionChild",
            "elements": [
                {
                    "class": "Current",
                    "properties": {
                        "occurrences": 1,
                        "optional_attribs": null,
                        "xmltag": "current"
                    }
                },
                {
                    "class": "New",
                    "properties": {
                        "occurrences": 1,
                        "optional_attribs": null,
                        "xmltag": "new"
                    }
                },
                {
                    "class": "Original",
                    "properties": {
                        "auth": false,
                        "occurrences": 1,
                        "optional_attribs": null,
                        "xmltag": "original"
                    }
                },
                {
                    "class": "Suggestion",
                    "properties": {
                        "auth": false,
                        "occurrences": 0,
                        "xmltag": "suggestion"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractInlineAnnotation",
                    "AbstractSpanAnnotation",
                    "AbstractStructureElement",
                    "Correction",
                    "Metric",
                    "PhonContent",
                    "String",
                    "TextContent",
                    "ForeignData"
                ],
                "optional_attribs": [
                    "ID",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME",
                    "N"
                ],
                "printable": true,
                "speakable": true,
                "textdelimiter": null
            }
        },
        {
            "class": "AbstractSpanAnnotation",
            "elements": [
                {
                    "class": "AbstractSpanRole",
                    "elements": [
                        {
                            "class": "CoreferenceLink",
                            "properties": {
                                "accepted_data": [
                                    "Headspan",
                                    "LevelFeature",
                                    "ModalityFeature",
                                    "TimeFeature"
                                ],
                                "annotationtype": "COREFERENCE",
                                "label": "Coreference Link",
                                "primaryelement": false,
                                "xmltag": "coreferencelink"
                            }
                        },
                        {
                            "class": "DependencyDependent",
                            "properties": {
                                "label": "Dependent",
                                "occurrences": 1,
                                "primaryelement": false,
                                "xmltag": "dep"
                            }
                        },
                        {
                            "class": "Headspan",
                            "properties": {
                                "label": "Head",
                                "occurrences": 1,
                                "primaryelement": false,
                                "xmltag": "hd"
                            }
                        },
                        {
                            "class": "StatementRelation",
                            "properties": {
                                "label": "Relation",
                                "occurrences": 1,
                                "primaryelement": false,
                                "xmltag": "rel"
                            }
                        },
                        {
                            "class": "Source",
                            "properties": {
                                "label": "Source",
                                "occurrences": 1,
                                "primaryelement": false,
                                "xmltag": "source"
                            }
                        },
                        {
                            "class": "Target",
                            "properties": {
                                "label": "Target",
                                "occurrences": 1,
                                "primaryelement": false,
                                "xmltag": "target"
                            }
                        }
                    ],
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "WordReference",
                            "LinkReference"
                        ],
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "DATETIME"
                        ],
                        "primaryelement": false
                    }
                },
                {
                    "class": "Chunk",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "WordReference"
                        ],
                        "annotationtype": "CHUNKING",
                        "label": "Chunk",
                        "xmltag": "chunk"
                    }
                },
                {
                    "class": "CoreferenceChain",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "CoreferenceLink"
                        ],
                        "annotationtype": "COREFERENCE",
                        "label": "Coreference Chain",
                        "required_data": [
                            "CoreferenceLink"
                        ],
                        "xmltag": "coreferencechain"
                    }
                },
                {
                    "class": "Dependency",
                    "properties": {
                        "accepted_data": [
                            "DependencyDependent",
                            "Feature",
                            "Headspan"
                        ],
                        "annotationtype": "DEPENDENCY",
                        "label": "Dependency",
                        "required_data": [
                            "DependencyDependent",
                            "Headspan"
                        ],
                        "xmltag": "dependency"
                    }
                },
                {
                    "class": "Entity",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "WordReference"
                        ],
                        "annotationtype": "ENTITY",
                        "label": "Entity",
                        "xmltag": "entity"
                    }
                },
                {
                    "class": "Observation",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "WordReference"
                        ],
                        "annotationtype": "OBSERVATION",
                        "label": "Observation",
                        "xmltag": "observation"
                    }
                },
                {
                    "class": "Predicate",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "SemanticRole",
                            "WordReference"
                        ],
                        "annotationtype": "PREDICATE",
                        "label": "Predicate",
                        "xmltag": "predicate"
                    }
                },
                {
                    "class": "SemanticRole",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "Headspan",
                            "WordReference"
                        ],
                        "annotationtype": "SEMROLE",
                        "label": "Semantic Role",
                        "required_attribs": [
                            "CLASS"
                        ],
                        "xmltag": "semrole"
                    }
                },
                {
                    "class": "Sentiment",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "Headspan",
                            "PolarityFeature",
                            "StrengthFeature",
                            "Source",
                            "Target",
                            "WordReference"
                        ],
                        "annotationtype": "SENTIMENT",
                        "label": "Sentiment",
                        "xmltag": "sentiment"
                    }
                },
                {
                    "class": "Statement",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "Headspan",
                            "StatementRelation",
                            "Source",
                            "WordReference"
                        ],
                        "annotationtype": "STATEMENT",
                        "label": "Statement",
                        "xmltag": "statement"
                    }
                },
                {
                    "class": "SyntacticUnit",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "SyntacticUnit",
                            "WordReference"
                        ],
                        "annotationtype": "SYNTAX",
                        "label": "Syntactic Unit",
                        "xmltag": "su"
                    }
                },
                {
                    "class": "TimeSegment",
                    "properties": {
                        "accepted_data": [
                            "ActorFeature",
                            "BegindatetimeFeature",
                            "EnddatetimeFeature",
                            "Feature",
                            "WordReference"
                        ],
                        "annotationtype": "TIMESEGMENT",
                        "label": "Time Segment",
                        "xmltag": "timesegment"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "Metric",
                    "Relation",
                    "ForeignData",
                    "LinkReference",
                    "AbstractInlineAnnotation"
                ],
                "optional_attribs": [
                    "ID",
                    "CLASS",
                    "ANNOTATOR",
                    "N",
                    "CONFIDENCE",
                    "DATETIME",
                    "SRC",
                    "BEGINTIME",
                    "ENDTIME",
                    "SPEAKER",
                    "TEXTCLASS",
                    "METADATA"
                ],
                "printable": true,
                "speakable": true
            }
        },
        {
            "class": "AbstractStructureElement",
            "elements": [
                {
                    "class": "Caption",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Gap",
                            "Linebreak",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace"
                        ],
                        "label": "Caption",
                        "occurrences": 1,
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA",
                            "SPACE"
                        ],
                        "xmltag": "caption"
                    }
                },
                {
                    "class": "Cell",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Entry",
                            "Event",
                            "Example",
                            "Gap",
                            "Head",
                            "Linebreak",
                            "Note",
                            "Paragraph",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "label": "Cell",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA",
                            "SPACE"
                        ],
                        "textdelimiter": " | ",
                        "xmltag": "cell"
                    }
                },
                {
                    "class": "Definition",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Figure",
                            "List",
                            "Metric",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword",
                            "Linebreak",
                            "Whitespace"
                        ],
                        "annotationtype": "DEFINITION",
                        "label": "Definition",
                        "xmltag": "def"
                    }
                },
                {
                    "class": "Division",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Division",
                            "Entry",
                            "Event",
                            "Example",
                            "Figure",
                            "Gap",
                            "Head",
                            "Linebreak",
                            "List",
                            "Note",
                            "Paragraph",
                            "Part",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Whitespace"
                        ],
                        "annotationtype": "DIVISION",
                        "label": "Division",
                        "textdelimiter": "\n\n\n",
                        "xmltag": "div"
                    }
                },
                {
                    "class": "Entry",
                    "properties": {
                        "accepted_data": [
                            "Definition",
                            "Example",
                            "Term",
                            "TextContent",
                            "String"
                        ],
                        "annotationtype": "ENTRY",
                        "label": "Entry",
                        "xmltag": "entry"
                    }
                },
                {
                    "class": "Event",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "ActorFeature",
                            "BegindatetimeFeature",
                            "Division",
                            "EnddatetimeFeature",
                            "Entry",
                            "Event",
                            "Example",
                            "Figure",
                            "Gap",
                            "Head",
                            "Linebreak",
                            "List",
                            "Note",
                            "Paragraph",
                            "Part",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "EVENT",
                        "label": "Event",
                        "xmltag": "event"
                    }
                },
                {
                    "class": "Example",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Figure",
                            "Linebreak",
                            "List",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword",
                            "Whitespace"
                        ],
                        "annotationtype": "EXAMPLE",
                        "label": "Example",
                        "xmltag": "ex"
                    }
                },
                {
                    "class": "Figure",
                    "properties": {
                        "accepted_data": [
                            "Caption",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "FIGURE",
                        "label": "Figure",
                        "speakable": false,
                        "textdelimiter": "\n\n",
                        "xmltag": "figure"
                    }
                },
                {
                    "class": "Head",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Event",
                            "Gap",
                            "Linebreak",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "HEAD",
                        "label": "Head",
                        "occurrences": 1,
                        "textdelimiter": "\n\n",
                        "xmltag": "head"
                    }
                },
                {
                    "class": "Hiddenword",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "PhonContent",
                            "Reference",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "HIDDENTOKEN",
                        "label": "Hidden Word/Token",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "TEXTCLASS",
                            "METADATA",
                            "SPACE"
                        ],
                        "printable": false,
                        "speakable": false,
                        "textdelimiter": " ",
                        "wrefable": true,
                        "xmltag": "hiddenw"
                    }
                },
                {
                    "class": "Label",
                    "properties": {
                        "accepted_data": [
                            "Word",
                            "Hiddenword",
                            "Reference",
                            "TextContent",
                            "PhonContent",
                            "String",
                            "Relation",
                            "Metric",
                            "Alternative",
                            "Alternative",
                            "AlternativeLayers",
                            "AbstractAnnotationLayer",
                            "AbstractInlineAnnotation",
                            "Correction",
                            "Part",
                            "Linebreak",
                            "Whitespace"
                        ],
                        "label": "Label",
                        "xmltag": "label"
                    }
                },
                {
                    "class": "Linebreak",
                    "properties": {
                        "annotationtype": "LINEBREAK",
                        "label": "Linebreak",
                        "textdelimiter": "",
                        "xlink": true,
                        "xmltag": "br"
                    }
                },
                {
                    "class": "List",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Relation",
                            "Caption",
                            "Event",
                            "ListItem",
                            "Metric",
                            "Note",
                            "PhonContent",
                            "Reference",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "LIST",
                        "label": "List",
                        "textdelimiter": "\n\n",
                        "xmltag": "list"
                    }
                },
                {
                    "class": "ListItem",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Event",
                            "Gap",
                            "Label",
                            "Linebreak",
                            "List",
                            "Note",
                            "Paragraph",
                            "Part",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "label": "List Item",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "textdelimiter": "\n",
                        "xmltag": "item"
                    }
                },
                {
                    "class": "Note",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Example",
                            "Figure",
                            "Head",
                            "Linebreak",
                            "List",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "NOTE",
                        "label": "Note",
                        "xmltag": "note"
                    }
                },
                {
                    "class": "Paragraph",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Entry",
                            "Event",
                            "Example",
                            "Figure",
                            "Gap",
                            "Head",
                            "Linebreak",
                            "List",
                            "Note",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "PARAGRAPH",
                        "label": "Paragraph",
                        "textdelimiter": "\n\n",
                        "xmltag": "p"
                    }
                },
                {
                    "class": "Part",
                    "properties": {
                        "accepted_data": [
                            "AbstractStructureElement",
                            "AbstractInlineAnnotation",
                            "TextContent",
                            "PhonContent"
                        ],
                        "annotationtype": "PART",
                        "label": "Part",
                        "textdelimiter": null,
                        "xmltag": "part"
                    }
                },
                {
                    "class": "Quote",
                    "properties": {
                        "accepted_data": [
                            "Division",
                            "Gap",
                            "Paragraph",
                            "Quote",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword",
                            "Reference"
                        ],
                        "annotationtype": "QUOTE",
                        "label": "Quote",
                        "xmltag": "quote"
                    }
                },
                {
                    "class": "Reference",
                    "properties": {
                        "accepted_data": [
                            "PhonContent",
                            "Paragraph",
                            "Quote",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword",
                            "Linebreak",
                            "Whitespace"
                        ],
                        "annotationtype": "REFERENCE",
                        "label": "Reference",
                        "textdelimiter": null,
                        "xlink": true,
                        "xmltag": "ref"
                    }
                },
                {
                    "class": "Row",
                    "properties": {
                        "accepted_data": [
                            "Cell",
                            "AbstractInlineAnnotation"
                        ],
                        "label": "Table Row",
                        "textdelimiter": "\n",
                        "xmltag": "row"
                    }
                },
                {
                    "class": "Sentence",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Entry",
                            "Event",
                            "Example",
                            "Gap",
                            "Linebreak",
                            "Note",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "SENTENCE",
                        "label": "Sentence",
                        "textdelimiter": " ",
                        "xmltag": "s"
                    }
                },
                {
                    "class": "Speech",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Division",
                            "Entry",
                            "Event",
                            "Example",
                            "External",
                            "Gap",
                            "List",
                            "Note",
                            "Paragraph",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword"
                        ],
                        "label": "Speech Body",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA",
                            "SPACE"
                        ],
                        "textdelimiter": "\n\n\n",
                        "xmltag": "speech"
                    }
                },
                {
                    "class": "Table",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Row",
                            "TableHead"
                        ],
                        "annotationtype": "TABLE",
                        "label": "Table",
                        "xmltag": "table"
                    }
                },
                {
                    "class": "TableHead",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Row"
                        ],
                        "label": "Table Header",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "xmltag": "tablehead"
                    }
                },
                {
                    "class": "Term",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Event",
                            "Figure",
                            "Gap",
                            "List",
                            "Paragraph",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Utterance",
                            "Word",
                            "Hiddenword",
                            "Linebreak",
                            "Whitespace"
                        ],
                        "annotationtype": "TERM",
                        "label": "Term",
                        "xmltag": "term"
                    }
                },
                {
                    "class": "Text",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Division",
                            "Entry",
                            "Event",
                            "Example",
                            "External",
                            "Figure",
                            "Gap",
                            "List",
                            "Note",
                            "Paragraph",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "Table",
                            "TextContent",
                            "Word",
                            "Hiddenword",
                            "Linebreak",
                            "Whitespace"
                        ],
                        "label": "Text Body",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA",
                            "SPACE"
                        ],
                        "textdelimiter": "\n\n\n",
                        "xmltag": "text"
                    }
                },
                {
                    "class": "Utterance",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Gap",
                            "Note",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Word",
                            "Hiddenword"
                        ],
                        "annotationtype": "UTTERANCE",
                        "label": "Utterance",
                        "textdelimiter": " ",
                        "xmltag": "utt"
                    }
                },
                {
                    "class": "Whitespace",
                    "properties": {
                        "annotationtype": "WHITESPACE",
                        "label": "Whitespace",
                        "textdelimiter": "",
                        "xmltag": "whitespace"
                    }
                },
                {
                    "class": "Word",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "PhonContent",
                            "Reference",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "TOKEN",
                        "label": "Word/Token",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "TEXTCLASS",
                            "METADATA",
                            "SPACE"
                        ],
                        "textdelimiter": " ",
                        "wrefable": true,
                        "xmltag": "w"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractAnnotationLayer",
                    "Relation",
                    "Alternative",
                    "AlternativeLayers",
                    "Correction",
                    "Feature",
                    "Metric",
                    "Part",
                    "ForeignData"
                ],
                "auto_generate_id": true,
                "optional_attribs": [
                    "ID",
                    "CLASS",
                    "ANNOTATOR",
                    "N",
                    "CONFIDENCE",
                    "DATETIME",
                    "SRC",
                    "BEGINTIME",
                    "ENDTIME",
                    "SPEAKER",
                    "METADATA",
                    "SPACE"
                ],
                "printable": true,
                "required_attribs": null,
                "speakable": true,
                "textdelimiter": "\n\n"
            }
        },
        {
            "class": "AbstractSubtokenAnnotation",
            "elements": [
                {
                    "class": "Morpheme",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "FunctionFeature",
                            "Morpheme",
                            "PhonContent",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "MORPHOLOGICAL",
                        "label": "Morpheme",
                        "textdelimiter": "",
                        "wrefable": true,
                        "xmltag": "morpheme"
                    }
                },
                {
                    "class": "Phoneme",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "FunctionFeature",
                            "PhonContent",
                            "Phoneme",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "PHONOLOGICAL",
                        "label": "Phoneme",
                        "textdelimiter": "",
                        "wrefable": true,
                        "xmltag": "phoneme"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractAnnotationLayer",
                    "Relation",
                    "Alternative",
                    "AlternativeLayers",
                    "Correction",
                    "Feature",
                    "Metric",
                    "Part",
                    "ForeignData"
                ],
                "auto_generate_id": true,
                "optional_attribs": [
                    "ID",
                    "CLASS",
                    "ANNOTATOR",
                    "N",
                    "CONFIDENCE",
                    "DATETIME",
                    "SRC",
                    "BEGINTIME",
                    "ENDTIME",
                    "SPEAKER",
                    "METADATA"
                ],
                "printable": true,
                "required_attribs": null,
                "speakable": true,
                "textdelimiter": "\n\n"
            }
        },
        {
            "class": "AbstractTextMarkup",
            "elements": [
                {
                    "class": "TextMarkupCorrection",
                    "properties": {
                        "annotationtype": "CORRECTION",
                        "primaryelement": false,
                        "xmltag": "t-correction"
                    }
                },
                {
                    "class": "TextMarkupError",
                    "properties": {
                        "annotationtype": "ERRORDETECTION",
                        "primaryelement": false,
                        "xmltag": "t-error"
                    }
                },
                {
                    "class": "TextMarkupGap",
                    "properties": {
                        "annotationtype": "GAP",
                        "primaryelement": false,
                        "xmltag": "t-gap"
                    }
                },
                {
                    "class": "TextMarkupString",
                    "properties": {
                        "annotationtype": "STRING",
                        "primaryelement": false,
                        "xmltag": "t-str"
                    }
                },
                {
                    "class": "TextMarkupStyle",
                    "properties": {
                        "annotationtype": "STYLE",
                        "primaryelement": true,
                        "xmltag": "t-style"
                    }
                },
                {
                    "class": "Hyphbreak",
                    "properties": {
                        "annotationtype": "HYPHENATION",
                        "label": "Hyphbreak",
                        "textdelimiter": "",
                        "xmltag": "t-hbr"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractTextMarkup",
                    "Linebreak"
                ],
                "optional_attribs": [
                    "ID",
                    "CLASS",
                    "ANNOTATOR",
                    "N",
                    "CONFIDENCE",
                    "DATETIME",
                    "SRC",
                    "BEGINTIME",
                    "ENDTIME",
                    "SPEAKER",
                    "METADATA"
                ],
                "primaryelement": false,
                "printable": true,
                "textcontainer": true,
                "textdelimiter": "",
                "xlink": true
            }
        },
        {
            "class": "AbstractInlineAnnotation",
            "elements": [
                {
                    "class": "DomainAnnotation",
                    "properties": {
                        "annotationtype": "DOMAIN",
                        "label": "Domain",
                        "occurrences_per_set": 0,
                        "xmltag": "domain"
                    }
                },
                {
                    "class": "ErrorDetection",
                    "properties": {
                        "annotationtype": "ERRORDETECTION",
                        "label": "Error Detection",
                        "occurrences_per_set": 0,
                        "xmltag": "errordetection"
                    }
                },
                {
                    "class": "LangAnnotation",
                    "properties": {
                        "annotationtype": "LANG",
                        "label": "Language",
                        "xmltag": "lang"
                    }
                },
                {
                    "class": "LemmaAnnotation",
                    "properties": {
                        "annotationtype": "LEMMA",
                        "label": "Lemma",
                        "xmltag": "lemma"
                    }
                },
                {
                    "class": "PosAnnotation",
                    "properties": {
                        "accepted_data": [
                            "HeadFeature"
                        ],
                        "annotationtype": "POS",
                        "label": "Part-of-Speech",
                        "xmltag": "pos"
                    }
                },
                {
                    "class": "SenseAnnotation",
                    "properties": {
                        "accepted_data": [
                            "SynsetFeature"
                        ],
                        "annotationtype": "SENSE",
                        "label": "Semantic Sense",
                        "occurrences_per_set": 0,
                        "xmltag": "sense"
                    }
                },
                {
                    "class": "SubjectivityAnnotation",
                    "properties": {
                        "annotationtype": "SUBJECTIVITY",
                        "label": "Subjectivity/Sentiment",
                        "xmltag": "subjectivity"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "Feature",
                    "Metric",
                    "ForeignData"
                ],
                "occurrences_per_set": 1,
                "optional_attribs": [
                    "ID",
                    "CLASS",
                    "ANNOTATOR",
                    "N",
                    "CONFIDENCE",
                    "DATETIME",
                    "SRC",
                    "BEGINTIME",
                    "ENDTIME",
                    "SPEAKER",
                    "TEXTCLASS",
                    "METADATA"
                ],
                "required_attribs": [
                    "CLASS"
                ]
            }
        },
        {
            "class": "AbstractHigherOrderAnnotation",
            "elements": [
                {
                    "class": "Relation",
                    "properties": {
                        "accepted_data": [
                            "LinkReference",
                            "Metric",
                            "Feature",
                            "ForeignData"
                        ],
                        "annotationtype": "RELATION",
                        "label": "Relation",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "printable": false,
                        "required_attribs": null,
                        "speakable": false,
                        "xlink": true,
                        "xmltag": "relation"
                    }
                },
                {
                    "class": "Alternative",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Correction",
                            "ForeignData",
                            "MorphologyLayer",
                            "PhonologyLayer"
                        ],
                        "annotationtype": "ALTERNATIVE",
                        "auth": false,
                        "label": "Alternative",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "printable": false,
                        "required_attribs": null,
                        "speakable": false,
                        "xmltag": "alt"
                    }
                },
                {
                    "class": "AlternativeLayers",
                    "properties": {
                        "accepted_data": [
                            "AbstractAnnotationLayer",
                            "ForeignData"
                        ],
                        "annotationtype": "ALTERNATIVE",
                        "auth": false,
                        "label": "Alternative Layers",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "primaryelement": false,
                        "printable": false,
                        "required_attribs": null,
                        "speakable": false,
                        "xmltag": "altlayers"
                    }
                },
                {
                    "class": "SpanRelation",
                    "properties": {
                        "accepted_data": [
                            "Relation",
                            "Metric",
                            "Feature",
                            "ForeignData"
                        ],
                        "annotationtype": "SPANRELATION",
                        "label": "Span Relation",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "printable": false,
                        "required_attribs": null,
                        "speakable": false,
                        "xmltag": "spanrelation"
                    }
                },
                {
                    "class": "Correction",
                    "properties": {
                        "accepted_data": [
                            "New",
                            "Original",
                            "Current",
                            "Suggestion",
                            "ErrorDetection",
                            "Metric",
                            "Feature",
                            "ForeignData"
                        ],
                        "annotationtype": "CORRECTION",
                        "label": "Correction",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "printable": true,
                        "speakable": true,
                        "textdelimiter": null,
                        "xmltag": "correction"
                    }
                },
                {
                    "class": "Comment",
                    "properties": {
                        "annotationtype": "COMMENT",
                        "label": "Comment",
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "CONFIDENCE",
                            "DATETIME",
                            "N",
                            "METADATA"
                        ],
                        "printable": false,
                        "xmltag": "comment"
                    }
                },
                {
                    "class": "Description",
                    "properties": {
                        "annotationtype": "DESCRIPTION",
                        "label": "Description",
                        "occurrences": 1,
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "CONFIDENCE",
                            "DATETIME",
                            "N",
                            "METADATA"
                        ],
                        "xmltag": "desc"
                    }
                },
                {
                    "class": "External",
                    "properties": {
                        "accepted_data": null,
                        "auth": true,
                        "label": "External",
                        "optional_attribs": null,
                        "printable": true,
                        "required_attribs": [
                            "SRC"
                        ],
                        "speakable": false,
                        "xmltag": "external"
                    }
                },
                {
                    "class": "Feature",
                    "elements": [
                        {
                            "class": "ActorFeature",
                            "properties": {
                                "subset": "actor",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "BegindatetimeFeature",
                            "properties": {
                                "subset": "begindatetime",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "EnddatetimeFeature",
                            "properties": {
                                "subset": "enddatetime",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "FunctionFeature",
                            "properties": {
                                "subset": "function",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "HeadFeature",
                            "properties": {
                                "subset": "head",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "LevelFeature",
                            "properties": {
                                "subset": "level",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "ModalityFeature",
                            "properties": {
                                "subset": "modality",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "PolarityFeature",
                            "properties": {
                                "subset": "polarity",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "StrengthFeature",
                            "properties": {
                                "subset": "strength",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "StyleFeature",
                            "properties": {
                                "subset": "style",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "SynsetFeature",
                            "properties": {
                                "subset": "synset",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "TimeFeature",
                            "properties": {
                                "subset": "time",
                                "xmltag": null
                            }
                        },
                        {
                            "class": "ValueFeature",
                            "properties": {
                                "subset": "value",
                                "xmltag": null
                            }
                        }
                    ],
                    "properties": {
                        "label": "Feature",
                        "xmltag": "feat"
                    }
                },
                {
                    "class": "Metric",
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "ValueFeature",
                            "ForeignData"
                        ],
                        "annotationtype": "METRIC",
                        "label": "Metric",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "CONFIDENCE",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "SPEAKER",
                            "METADATA"
                        ],
                        "xmltag": "metric"
                    }
                },
                {
                    "class": "String",
                    "properties": {
                        "accepted_data": [
                            "AbstractInlineAnnotation",
                            "Relation",
                            "Correction",
                            "Feature",
                            "ForeignData",
                            "Metric",
                            "PhonContent",
                            "TextContent"
                        ],
                        "annotationtype": "STRING",
                        "label": "String",
                        "occurrences": 0,
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "CONFIDENCE",
                            "DATETIME",
                            "N",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "METADATA"
                        ],
                        "printable": true,
                        "xmltag": "str"
                    }
                },
                {
                    "class": "ForeignData",
                    "properties": {
                        "xmltag": "foreign-data"
                    }
                },
                {
                    "class": "Gap",
                    "properties": {
                        "accepted_data": [
                            "Content",
                            "Feature",
                            "Metric",
                            "Part",
                            "ForeignData"
                        ],
                        "annotationtype": "GAP",
                        "label": "Gap",
                        "optional_attribs": [
                            "ID",
                            "CLASS",
                            "ANNOTATOR",
                            "N",
                            "DATETIME",
                            "SRC",
                            "BEGINTIME",
                            "ENDTIME",
                            "METADATA"
                        ],
                        "xmltag": "gap"
                    }
                }
            ],
            "properties": {
                "optional_attribs": null,
                "required_attribs": null
            }
        },
        {
            "class": "AbstractContentAnnotation",
            "elements": [
                {
                    "class": "TextContent",
                    "properties": {
                        "accepted_data": [
                            "AbstractTextMarkup",
                            "Linebreak"
                        ],
                        "annotationtype": "TEXT",
                        "label": "Text",
                        "printable": true,
                        "speakable": false,
                        "textcontainer": true,
                        "xlink": true,
                        "xmltag": "t"
                    }
                },
                {
                    "class": "PhonContent",
                    "properties": {
                        "accepted_data": null,
                        "annotationtype": "PHON",
                        "label": "Phonetic Content",
                        "phoncontainer": true,
                        "printable": false,
                        "speakable": true,
                        "xmltag": "ph"
                    }
                },
                {
                    "class": "Content",
                    "properties": {
                        "annotationtype": "RAWCONTENT",
                        "label": "Raw Content",
                        "occurrences": 1,
                        "printable": true,
                        "xmltag": "content"
                    }
                }
            ],
            "properties": {
                "occurrences": 0,
                "optional_attribs": [
                    "CLASS",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME",
                    "METADATA"
                ],
                "required_attribs": null
            }
        },
        {
            "class": "WordReference",
            "properties": {
                "optional_attribs": [
                    "IDREF"
                ],
                "xmltag": "wref"
            }
        },
        {
            "class": "LinkReference",
            "properties": {
                "optional_attribs": [
                    "IDREF"
                ],
                "xmltag": "xref"
            }
        }
    ],
    "namespace": "http://ilk.uvt.nl/folia",
    "oldtags": {
        "alignment": "relation",
        "aref": "xref",
        "complexalignment": "spanrelation",
        "complexalignments": "spanrelations",
        "listitem": "item"
    },
    "setdefinitionnamespace": "http://folia.science.ru.nl/setdefinition",
    "structurescope": [
        "Sentence",
        "Paragraph",
        "Division",
        "ListItem",
        "Text",
        "Event",
        "Caption",
        "Head"
    ],
    "version": "2.0.2",
    "wrefables": [
        "Word",
        "Hiddenword",
        "Morpheme",
        "Phoneme"
    ]
};
