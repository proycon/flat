// jshint evil:true
/////////////////////////////////////////////////////////////////
// Functions for FoLiA Processing, relies on foliaspec.js
/////////////////////////////////////////////////////////////////
//Map from folia classes to elements (not nested unlike foliaspec)
var foliaelements = {};

//Maps FoLiA XML tag to classes, FLAT works tag-based
var foliatag2class = {};

function folia_parse(element, ancestors) {
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
    var foliaclass = foliatag2class[tag];

    if ((set) && (setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].label)) {
        //Grab the label from the set definition
        return setdefinitions[set].label;
    }

    if ((foliaelements[foliaclass]) && (foliaelements[foliaclass].properties.label)) {
        return foliaelements[foliaclass].properties.label;
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
        return subset;
    }
}

function folia_isspan(tag) {
    //Is the element a first order span element?
    var foliaclass = foliatag2class[tag];
    var found = false;
    for (var i = 0; i < foliaelements[foliaclass].ancestors.length; i++) {
        if (foliaelements[foliaclass].ancestors[i] == "AbstractSpanAnnotation") {
            found = true;
        }
        if (foliaelements[foliaclass].ancestors[i] == "AbstractSpanRole") {
            found = false; //not first-order
        }
    }
    return found;
 }

function folia_isstructure(tag) {
    //Is the element a first order span element?
    var foliaclass = foliatag2class[tag];
    for (var i = 0; i < foliaelements[foliaclass].ancestors.length; i++) {
        if (foliaelements[foliaclass].ancestors[i] == "AbstractStructureElement") {
            return true;
        }
    }
    return false;
}


function folia_annotationlist() {
    return Object.keys(foliatag2class);
}

function folia_structurelist() {
    var structurelist = [];
    for (var tag in foliatag2class) {
        if (folia_isstructure(tag)) {
            structurelist.push(tag);
        }
    }
    return structurelist;
}

function folia_accepts_class(parentclass, childclass) {
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
    if ((parenttag == 'w') && (folia_isspan(childtag))) {
        return true;
    } else {
        var parentclass = foliatag2class[parenttag];
        var childclass = foliatag2class[childtag];
        return folia_accepts_class(parentclass, childclass);
    }
}
