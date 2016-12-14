foliaspec = {
    "annotationtype": [
        "TEXT",
        "TOKEN",
        "DIVISION",
        "PARAGRAPH",
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
        "NOTE",
        "ALIGNMENT",
        "COMPLEXALIGNMENT",
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
        "STATEMENT"
    ],
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
        "SPEAKER"
    ],
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
                    "class": "ComplexAlignmentLayer",
                    "properties": {
                        "accepted_data": [
                            "ComplexAlignment"
                        ],
                        "annotationtype": "COMPLEXALIGNMENT",
                        "primaryelement": false,
                        "xmltag": "complexalignments"
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
                    "N"
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
                    "AbstractTokenAnnotation",
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
                                "xmltag": "dep"
                            }
                        },
                        {
                            "class": "Headspan",
                            "properties": {
                                "label": "Head",
                                "occurrences": 1,
                                "xmltag": "hd"
                            }
                        },
                        {
                            "class": "Relation",
                            "properties": {
                                "label": "Relation",
                                "occurrences": 1,
                                "xmltag": "relation"
                            }
                        },
                        {
                            "class": "Source",
                            "properties": {
                                "label": "Source",
                                "occurrences": 1,
                                "xmltag": "source"
                            }
                        },
                        {
                            "class": "Target",
                            "properties": {
                                "label": "Target",
                                "occurrences": 1,
                                "xmltag": "target"
                            }
                        }
                    ],
                    "properties": {
                        "accepted_data": [
                            "Feature",
                            "WordReference",
                            "AlignReference"
                        ],
                        "optional_attribs": [
                            "ID",
                            "ANNOTATOR",
                            "N",
                            "DATETIME"
                        ]
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
                            "Relation",
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
                    "Alignment",
                    "ForeignData",
                    "AlignReference"
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
                    "SPEAKER"
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
                            "AbstractExtendedTokenAnnotation",
                            "Gap",
                            "Linebreak",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace"
                        ],
                        "label": "Caption",
                        "occurrences": 1,
                        "xmltag": "caption"
                    }
                },
                {
                    "class": "Cell",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
                        ],
                        "label": "Cell",
                        "textdelimiter": " | ",
                        "xmltag": "cell"
                    }
                },
                {
                    "class": "Definition",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Term"
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
                            "AbstractExtendedTokenAnnotation",
                            "ActorFeature",
                            "BegindatetimeFeature",
                            "Division",
                            "EnddatetimeFeature",
                            "Event",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Sentence",
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
                            "AbstractExtendedTokenAnnotation",
                            "Event",
                            "Gap",
                            "Linebreak",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace",
                            "Word"
                        ],
                        "label": "Head",
                        "occurrences": 1,
                        "textdelimiter": "\n\n",
                        "xmltag": "head"
                    }
                },
                {
                    "class": "Label",
                    "properties": {
                        "accepted_data": [
                            "Word",
                            "Reference",
                            "TextContent",
                            "PhonContent",
                            "String",
                            "Alignment",
                            "Metric",
                            "Alternative",
                            "Alternative",
                            "AlternativeLayers",
                            "AbstractAnnotationLayer",
                            "AbstractExtendedTokenAnnotation",
                            "Correction",
                            "Part"
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
                        "xmltag": "br"
                    }
                },
                {
                    "class": "List",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
                            "Alignment",
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
                            "AbstractExtendedTokenAnnotation",
                            "Event",
                            "Gap",
                            "Label",
                            "Linebreak",
                            "List",
                            "Note",
                            "PhonContent",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Whitespace"
                        ],
                        "label": "List Item",
                        "textdelimiter": "\n",
                        "xmltag": "item"
                    }
                },
                {
                    "class": "Morpheme",
                    "properties": {
                        "accepted_data": [
                            "AbstractTokenAnnotation",
                            "FunctionFeature",
                            "Morpheme",
                            "PhonContent",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "MORPHOLOGICAL",
                        "label": "Morpheme",
                        "textdelimiter": "",
                        "xmltag": "morpheme"
                    }
                },
                {
                    "class": "Note",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation"
                        ],
                        "annotationtype": "PART",
                        "label": "Part",
                        "textdelimiter": null,
                        "xmltag": "part"
                    }
                },
                {
                    "class": "Phoneme",
                    "properties": {
                        "accepted_data": [
                            "AbstractTokenAnnotation",
                            "FunctionFeature",
                            "PhonContent",
                            "Phoneme",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "PHONOLOGICAL",
                        "label": "Phoneme",
                        "textdelimiter": "",
                        "xmltag": "phoneme"
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
                            "Word"
                        ],
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
                            "Word"
                        ],
                        "label": "Reference",
                        "textdelimiter": null,
                        "xmltag": "ref"
                    }
                },
                {
                    "class": "Row",
                    "properties": {
                        "accepted_data": [
                            "Cell",
                            "AbstractExtendedTokenAnnotation"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
                        ],
                        "label": "Speech Body",
                        "textdelimiter": "\n\n\n",
                        "xmltag": "speech"
                    }
                },
                {
                    "class": "Table",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
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
                            "AbstractExtendedTokenAnnotation",
                            "Row"
                        ],
                        "label": "Table Header",
                        "xmltag": "tablehead"
                    }
                },
                {
                    "class": "Term",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
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
                            "AbstractExtendedTokenAnnotation",
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
                            "Word"
                        ],
                        "label": "Text Body",
                        "textdelimiter": "\n\n\n",
                        "xmltag": "text"
                    }
                },
                {
                    "class": "Utterance",
                    "properties": {
                        "accepted_data": [
                            "AbstractExtendedTokenAnnotation",
                            "Gap",
                            "Note",
                            "PhonContent",
                            "Quote",
                            "Reference",
                            "Sentence",
                            "String",
                            "TextContent",
                            "Word"
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
                            "AbstractTokenAnnotation",
                            "PhonContent",
                            "Reference",
                            "String",
                            "TextContent"
                        ],
                        "annotationtype": "TOKEN",
                        "label": "Word/Token",
                        "textdelimiter": " ",
                        "xmltag": "w"
                    }
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractAnnotationLayer",
                    "Alignment",
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
                    "SPEAKER"
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
                }
            ],
            "properties": {
                "accepted_data": [
                    "AbstractTextMarkup"
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
                    "SPEAKER"
                ],
                "primaryelement": false,
                "printable": true,
                "textcontainer": true,
                "textdelimiter": "",
                "xlink": true
            }
        },
        {
            "class": "AbstractTokenAnnotation",
            "elements": [
                {
                    "class": "AbstractExtendedTokenAnnotation",
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
                        }
                    ]
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
                    "SPEAKER"
                ],
                "required_attribs": [
                    "CLASS"
                ]
            }
        },
        {
            "class": "AlignReference",
            "properties": {
                "xmltag": "aref"
            }
        },
        {
            "class": "Alignment",
            "properties": {
                "accepted_data": [
                    "AlignReference",
                    "Metric",
                    "Feature",
                    "ForeignData"
                ],
                "annotationtype": "ALIGNMENT",
                "label": "Alignment",
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
                    "SPEAKER"
                ],
                "printable": false,
                "required_attribs": null,
                "speakable": false,
                "xlink": true,
                "xmltag": "alignment"
            }
        },
        {
            "class": "Alternative",
            "properties": {
                "accepted_data": [
                    "AbstractTokenAnnotation",
                    "Correction",
                    "ForeignData",
                    "MorphologyLayer",
                    "PhonologyLayer"
                ],
                "auth": false,
                "label": "Alternative",
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
                    "SPEAKER"
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
                "auth": false,
                "label": "Alternative Layers",
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
                    "SPEAKER"
                ],
                "printable": false,
                "required_attribs": null,
                "speakable": false,
                "xmltag": "altlayers"
            }
        },
        {
            "class": "ComplexAlignment",
            "properties": {
                "accepted_data": [
                    "Alignment",
                    "Metric",
                    "Feature",
                    "ForeignData"
                ],
                "annotationtype": "COMPLEXALIGNMENT",
                "label": "Complex Alignment",
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
                    "SPEAKER"
                ],
                "printable": false,
                "required_attribs": null,
                "speakable": false,
                "xmltag": "complexalignment"
            }
        },
        {
            "class": "Content",
            "properties": {
                "label": "Gap Content",
                "occurrences": 1,
                "xmltag": "content"
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
                    "SPEAKER"
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
                "label": "Comment",
                "optional_attribs": [
                    "ID",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME",
                    "N"
                ],
                "xmltag": "comment"
            }
        },
        {
            "class": "Description",
            "properties": {
                "label": "Description",
                "occurrences": 1,
                "optional_attribs": [
                    "ID",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME",
                    "N"
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
                    "ENDTIME"
                ],
                "xmltag": "gap"
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
                    "SPEAKER"
                ],
                "xmltag": "metric"
            }
        },
        {
            "class": "PhonContent",
            "properties": {
                "accepted_data": null,
                "annotationtype": "PHON",
                "label": "Phonetic Content",
                "occurrences": 0,
                "optional_attribs": [
                    "CLASS",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME"
                ],
                "phoncontainer": true,
                "printable": false,
                "speakable": true,
                "xmltag": "ph"
            }
        },
        {
            "class": "String",
            "properties": {
                "accepted_data": [
                    "AbstractExtendedTokenAnnotation",
                    "Alignment",
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
                    "ENDTIME"
                ],
                "printable": true,
                "xmltag": "str"
            }
        },
        {
            "class": "TextContent",
            "properties": {
                "accepted_data": [
                    "AbstractTextMarkup",
                    "Linebreak"
                ],
                "annotationtype": "TEXT",
                "label": "Text",
                "occurrences": 0,
                "optional_attribs": [
                    "CLASS",
                    "ANNOTATOR",
                    "CONFIDENCE",
                    "DATETIME"
                ],
                "printable": true,
                "speakable": false,
                "textcontainer": true,
                "xlink": true,
                "xmltag": "t"
            }
        },
        {
            "class": "WordReference",
            "properties": {
                "xmltag": "wref"
            }
        },
        {
            "class": "ForeignData",
            "properties": {
                "xmltag": "foreign-data"
            }
        }
    ],
    "namespace": "http://ilk.uvt.nl/folia",
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
    "version": "1.4.0"
};
