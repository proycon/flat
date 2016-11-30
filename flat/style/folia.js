// jshint evil:true
/////////////////////////////////////////////////////////////////
// Functions for FoLiA Processing, relies on foliaspec.js
/////////////////////////////////////////////////////////////////
//Map from folia e;ement classes to elements (not nested unlike foliaspec)
var foliaelements = {};

//Maps FoLiA XML tag to element classes, FLAT works tag-based
var foliatag2class = {};

//Maps span elements (tags) to parent span elements in which they can be
//nested, hard coded for now.. TODO: derive from spec
var folianestablespan = {'su': ['su'], 'semrole': ['predicate'] };

//element classes are internal class names for the FoLiA elements and not to be confused with FoLiA's notion of a class.

function folia_parse(element, ancestors) {
   /* Parse the generic foliaspec specification (created by foliaspec2json tool and stored in foliaspec.js) into something more manageable */
   if (element.class) {
    foliaelements[element.class] = element;
    if ((element.properties) && (element.properties.xmltag)) {
        foliatag2class[element.properties.xmltag] = element.class;
    }
    if (ancestors) {
        element.ancestors = ancestors; //ancestors are class based, not tag based
    } else {
        element.ancestors = [];
    }
   }
   if (element.elements) {
      var nextancestors;
      if (ancestors) {
          nextancestors = ancestors.slice(); //copy
      } else {
          nextancestors = [];
      } 
      if (element.class) {
          nextancestors.push(element.class);
      }
      for (var i = 0; i < element.elements.length; i++) {
          folia_parse(element.elements[i],nextancestors);
      }
   } 
}

function folia_label(tag, set) {
    //Get the human-readable label for an annotation type (corresponding to a FoLiA XML tag), if defined
    var elementclass = folia_elementclass(tag);

    if ((set) && (setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].label)) {
        //Grab the label from the set definition
        return setdefinitions[set].label;
    }

    if ((foliaelements[elementclass]) && (foliaelements[elementclass].properties.label)) {
        return foliaelements[elementclass].properties.label;
    } else {
        return tag; //fallback
    }
}

function folia_subset_label(set, subset) {
    if ((set) && (setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].subsets) && (setdefinitions[set].subsets[subset])  && (setdefinitions[set].subsets[subset].label)) {
        return setdefinitions[set].subsets[subset].label;
    } else {
        return subset;
    }
}

function folia_feature_label(set, subset, cls) {
    if ((set) && (setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].subsets) && (setdefinitions[set].subsets[subset])  && (setdefinitions[set].subsets[subset].classes[cls]) && (setdefinitions[set].subsets[subset].classes[cls].label)) {
        return setdefinitions[set].subsets[subset].classes[cls].label;
    } else {
        return cls;
    }
}

function folia_elementclass(tag) {
    if (foliatag2class[tag] === undefined) {
        console.log(tag);
        throw "FoLiA Tag " + tag + " is not defined!";
    }
    var elementclass = foliatag2class[tag];
    if (foliaelements[elementclass] === undefined) {
        throw "FoLiA Elementclass  " + elementclass + " is not defined!";
    }
    return elementclass;

}


function folia_isspan(tag) {
    //Is the element a first order span element?
    var elementclass = folia_elementclass(tag);
    var found = false;
    for (var i = 0; i < foliaelements[elementclass].ancestors.length; i++) {
        if (foliaelements[elementclass].ancestors[i] == "AbstractSpanAnnotation") {
            found = true;
        }
        if (foliaelements[elementclass].ancestors[i] == "AbstractSpanRole") {
            found = false; //not first-order
        }
    }
    return found;
 }

function folia_isspanrole(tag) {
    //Is the element a span role?
    var elementclass = folia_elementclass(tag);
    for (var i = 0; i < foliaelements[elementclass].ancestors.length; i++) {
        if (foliaelements[elementclass].ancestors[i] == "AbstractSpanRole") {
            return true;
        }
    }
    return false;
}

function folia_nestablespan(tag) {
    //Is this span element nestable in another span element?
    //Returns a list of possible parents
    if (folianestablespan[tag] !== undefined) {
        return folianestablespan[tag];
    } else {
        return [];
    }
}

function folia_isstructure(tag) {
    //Is the element a first order span element?
    var elementclass = folia_elementclass(tag);
    for (var i = 0; i < foliaelements[elementclass].ancestors.length; i++) {
        if (foliaelements[elementclass].ancestors[i] == "AbstractStructureElement") {
            return true;
        }
    }
    return false;
}


function folia_annotationlist() {
    /* Return a list (tagnames) of all elements */
    return Object.keys(foliatag2class);
}

function folia_structurelist() {
    /* Return a list (tagnames) of all structural elements */
    var structurelist = [];
    for (var tag in foliatag2class) {
        if (folia_isstructure(tag)) {
            structurelist.push(tag);
        }
    }
    return structurelist;
}

function folia_accepts_class(parentclass, childclass) {
    /* Is the child element accepted under the parent element? (elements correspond to element classes, not to be confused with folia classes)  */
    if ((foliaelements[parentclass]) && (foliaelements[parentclass].properties) && (foliaelements[parentclass].properties.accepted_data) && (foliaelements[parentclass].properties.accepted_data.indexOf(childclass) != -1)) {
        return true;
    } else if (foliaspec.defaultproperties.accepted_data.indexOf(childclass) != -1) {
        return true;
    } else if (foliaelements[parentclass]) {
        //check ancestor (will recurse by itself)
        if ((foliaelements[parentclass].ancestors) && (foliaelements[parentclass].ancestors.length > 0)) {
            if (folia_accepts_class(foliaelements[parentclass].ancestors[0], childclass)) {
                return true;
            }
        }
        
        //check if the parent element accepts an abstract class that is an ancestor of the child
        if ( (foliaelements[childclass].ancestors) && (foliaelements[parentclass].properties) && (foliaelements[parentclass].properties.accepted_data)) {
            for (var i = 0; i < foliaelements[childclass].ancestors.length; i++) {
                if (foliaelements[parentclass].properties.accepted_data.indexOf(foliaelements[childclass].ancestors[i]) != -1) {
                    return true;
                }
            }
        }
    }
    return false;
}

function folia_accepts(parenttag, childtag) {
    /* Is the child element accepted under the parent element? (elements correspond to tags) */
    if ((parenttag == 'w') && (folia_isspan(childtag))) {
        return true;
    } else {
        var parentclass = foliatag2class[parenttag];
        var childclass = foliatag2class[childtag];
        return folia_accepts_class(parentclass, childclass);
    }
}



function folia_spanroles(tag) {
    /* Collect all span annotation roles (tags) for the given span annotation element */
    var elementclass = folia_elementclass(tag);
    var spanroles = [];
    if ((foliaelements[elementclass]) && (foliaelements[elementclass].properties) && (foliaelements[elementclass].properties.accepted_data)) {
        for (var i = 0; i < foliaelements[elementclass].properties.accepted_data.length; i++) { //doesn't consider accepted_data inheritance but i don't think we use that in this case
            var childclass = foliaelements[elementclass].properties.accepted_data[i];
            if (foliaelements[childclass].ancestors.indexOf('AbstractSpanRole') != -1) {
                spanroles.push(foliaelements[childclass].properties.xmltag);
            }
        }
    }
    return spanroles;
}

function folia_required_spanroles(tag) {
    /* Collect all mandatory span annotation roles (tags) for the given span annotation element */
    var elementclass = folia_elementclass(tag);
    var spanroles = [];
    if ((foliaelements[elementclass]) && (foliaelements[elementclass].properties) && (foliaelements[elementclass].properties.required_data)) {
        for (var i = 0; i < foliaelements[elementclass].properties.required_data.length; i++) { //doesn't consider accepted_data inheritance but i don't think we use that in this case
            var childclass = foliaelements[elementclass].properties.required_data[i];
            if (foliaelements[childclass].ancestors.indexOf('AbstractSpanRole') != -1) {
                spanroles.push(foliaelements[childclass].properties.xmltag);
            }
        }
    }
    return spanroles;
}


function folia_occurrences_class(elementclass) {
    /* Get the maximum amount of occurrences for this element class (0=unlimited) */
    if ((foliaelements[elementclass]) && (foliaelements[elementclass].properties) && (foliaelements[elementclass].properties.occurrences !== undefined)) {
        return foliaelements[elementclass].properties.occurrences;
    } else if (foliaelements[elementclass].ancestors.length >= 1) {
        return folia_occurrences_class(foliaelements[elementclass].ancestors[0]);
    } else {
        return 0;
    }
}

function folia_occurrences(tag) {
    /* Get the maximum amount of occurrences for this tag (0=unlimited) */
    var elementclass = folia_elementclass(tag);
    return folia_occurrences_class(elementclass);
}

function folia_occurrencesperset_class(elementclass) {
    /* Get the maximum amount of occurrences for this element class (0=unlimited) */
    if ((foliaelements[elementclass]) && (foliaelements[elementclass].properties) && (foliaelements[elementclass].properties.occurrences_per_set !== undefined)) {
        return foliaelements[elementclass].properties.occurrences_per_set;
    } else if (foliaelements[elementclass].ancestors.length >= 1) {
        return folia_occurrencesperset_class(foliaelements[elementclass].ancestors[0]);
    } else {
        return 0;
    }
}

function folia_occurrencesperset(tag) {
    /* Get the maximum amount of occurrences for this tag (0=unlimited) */
    var elementclass = folia_elementclass(tag);
    return folia_occurrencesperset_class(elementclass);
}
