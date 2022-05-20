#! /usr/bin/env python3
# -*- coding: utf8 -*-

from __future__ import print_function

import os
import sys
from setuptools import setup


try:
    os.chdir(os.path.dirname(sys.argv[0]))
except:
    pass


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name = "FoLiA-Linguistic-Annotation-Tool",
    version = "0.11", #Also change in flat/__init__.py !!
    author = "Maarten van Gompel",
    author_email = "proycon@anaproy.nl",
    description = ("FLAT is a web-based linguistic annotation environment based around the FoLiA format (https://proycon.github.io/folia), a rich XML-based format for linguistic annotation. Flat allows users to view annotated FoLiA documents and enrich these documents with new annotations, a wide variety of linguistic annotation types is supported through the FoLiA paradigm."),
    license = "GPL",
    keywords = ["linguistics","annotation", "nlp","computational linguistics","folia"],
    url = "https://github.com/proycon/flat",
    packages=['flat','flat.modes','flat.modes.structureeditor','flat.modes.viewer','flat.modes.editor','flat.modes.metadata','flat.users','flat.users.migrations'],
    long_description=read('README.rst'),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Topic :: Text Processing :: Linguistic",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Operating System :: POSIX",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
    ],
    python_requires='>=3.6',
    zip_safe=False,
    package_data = {'flat':['templates/*.html','style/*','script/*'], 'flat.modes.structureeditor':['templates/*.html'],  'flat.modes.viewer':['templates/*.html'], 'flat.modes.editor':['templates/*.html'], 'flat.modes.metadata':['templates/*.html']  },
    install_requires=['folia >= 2.5.7','Django >= 3.0','requests', 'foliadocserve >= 0.7.7', 'mozilla-django-oidc']
)
