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
    version = "0.4.2", #Also change in flat/__init__.py !!
    author = "Maarten van Gompel",
    author_email = "proycon@anaproy.nl",
    description = ("FLAT is a web-based linguistic annotation environment based around the FoLiA format (http://proycon.github.io/folia), a rich XML-based format for linguistic annotation. Flat allows users to view annotated FoLiA documents and enrich these documents with new annotations, a wide variety of linguistic annotation types is supported through the FoLiA paradigm."),
    license = "GPL",
    keywords = "flat linguistic annotation nlp computational_linguistics folia annotator web",
    url = "https://github.com/proycon/flat",
    packages=['flat','flat.modes','flat.modes.structureeditor','flat.modes.viewer','flat.modes.editor','flat.users'],
    long_description=read('README.rst'),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Topic :: Text Processing :: Linguistic",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3.2",
        "Programming Language :: Python :: 3.3",
        "Programming Language :: Python :: 3.4",
        "Operating System :: POSIX",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
    ],
    package_data = {'flat':['templates/*.html','style/*'], 'flat.modes.structureeditor':['templates/*.html'],  'flat.modes.viewer':['templates/*.html'], 'flat.modes.editor':['templates/*.html'] },
    install_requires=['pynlpl >= 0.8.2','foliadocserve >= 0.3.5','Django >= 1.5','requests']
)
