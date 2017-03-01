var editannotations = {};
var editoropen = false;
var coselector = -1; //disabled, otherwise the index of the field to which the coselector is currently bound
var coselector_sub = -1; //disabled, otherwise index of the higher order field (i.e. a span role) to which the coselector is currently bound
var editforms = {'direct': true, 'correction': false,'alternative': false, 'new': true} ;
var editedelementid = null;
var editedelementtype = null;
var editfields = 0;
var editsuggestinsertion = null; //will hold a correction ID if a suggestion for insertion is accepted
var editconfidence = true; //allow setting/editing confidence, will be overwritten to configuration value on init
var repeatmode = false;
var sentdata = []; //list of the last submitted edits (js objects, pre-fql)


function notice(msg) {
    /* Small pop-up notice message are shown on the right side of the screen,
       chiefly after submission or queueing of an annotations */
    $('#notice').html(msg);
    $('#notice').show();
    $('#notice').delay(3000).hide(300);
}


function toggleeditform(editform) {
    /* Called by clicking edit form toggle buttons: determines which edit forms are selectable in the edit dialog */
    if (editforms[editform]) {
        editforms[editform] = false;
        $('#editform' + editform).removeClass('on');
    } else {
        editforms[editform] = true;
        $('#editform' + editform).addClass('on');
    }
    if (editforms.correction) {
        $('#editformcorrectionsetselector').show();
    } else {
        $('#editformcorrectionsetselector').hide();
    }
}


function toggleannotationedit(annotationtype, set) {
    /* called by clicking the toggle buttons in the "Editor Annotations" menu, determines which annotation types show up and are editable in the editor  */
    editannotations[annotationtype+"/"+set] = !editannotations[annotationtype+"/"+set];
    if (editannotations[annotationtype+"/" + set]) {
        $('#annotationtypeedit_' + annotationtype + "_" + hash(set)).addClass('on');
    } else {
        $('#annotationtypeedit_' + annotationtype + "_" + hash(set)).removeClass('on');
    }
}

function toggleeditconfidence() {
    /* called by clicking the menu toggle button to enable/disable confidence editing */
    editconfidence = !editconfidence;
    if (editconfidence) {
        $('#toggleeditconfidence').addClass("on");
    } else {
        $('#toggleeditconfidence').removeClass("on");
    }
}

function select(element) {
    /* toggles selection of an element (coselector) */
    var found = false;
    var index = 0;
    var i;

    if (coselector_sub == -1) {
        //no sub-coselector
        for (i = 0; i < editdata[coselector].targets.length; i++) {
            if (editdata[coselector].targets[i] == element.id) {
                index = i;
                found = true;
                break;
            }
        }
        if (found) {
            //deselect a word
            editdata[coselector].targets.splice(index, 1);
            $(element).removeClass("selected");
        } else {
            //select a word
            editdata[coselector].targets.push( element.id);
            $(element).addClass("selected");
        }
        $('#spantext' + coselector).html(getspantext(editdata[coselector], true));
    } else {
        //we have a sub-coselector, meaning we are co-selecting for span roles
        for (i = 0; i < editdata[coselector].children[coselector_sub].targets.length; i++) {
            if (editdata[coselector].children[coselector_sub].targets[i] == element.id) {
                index = i;
                found = true;
                break;
            }
        }
        if (found) {
            //deselect a word
            editdata[coselector].children[coselector_sub].targets.splice(index, 1);
            $(element).removeClass("selected");
        } else {
            //select a word
            editdata[coselector].children[coselector_sub].targets.push( element.id);
            $(element).addClass("selected");
        }
        $('#spantext' + coselector + '_' + coselector_sub).html(getspantext(editdata[coselector].children[coselector_sub], true));
    }

}

function setaddablefields() {
    /* Adds a selector in the editor for adding extra annotation types to an element (must be previously declared, $('#newdeclarationsubmit').click())
       To actually add the field to the form, addeditorfield(i) is called, each addable field has a sequencenumber as ID  */
    //
    var editoraddablefields_options = "";
    editoraddablefields = []; //this is deliberately global
    Object.keys(declarations).forEach(function(annotationtype){
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if ((annotationtype != "correction") && (viewannotations[annotationtype + "/" + set]) && (!folia_isstructure(annotationtype)) && (folia_accepts(editedelementtype,annotationtype))) {
                label = folia_label(annotationtype, set);
                setname = shorten(set);
                //check if it already exists
                var occurrences = 0;
                editdata.forEach(function(editdataitem){
                    if ((editdataitem.type == annotationtype) && (editdataitem.set == set)) {
                        //already exists, but do we allow multiple of this type? consider it not found otherwise
                        occurrences++;
                    }
                });
                var maxoccurrences = folia_occurrencesperset(annotationtype);
                if ((maxoccurrences === 0) || (occurrences < maxoccurrences)) {
                    editoraddablefields_options = editoraddablefields_options + "<option value=\"" + editoraddablefields.length + "\">" + label + " -- <span class=\"setname\">" + setname + "</span></option>";
                    editoraddablefields.push({'type': annotationtype, 'set': set});
                }
            }
        });
    });
    if (configuration.allowaddfields) {
        //only show if we're allowed to add fields manually
        if (editoraddablefields_options) {
            $("#editoraddablefields").html(editoraddablefields_options);
            $("#editoraddfields").show();
        } else {
            $("#editoraddfields").hide();
        }
    } else {
            $("#editoraddfields").hide();
    }
}

function seteditform(index, value) {
    /* Called when the user selects an edit form for a particular annotation, colours the toggle buttons accordingly */
    editdata[index].editform = value;
    if ($('#editform' + index + 'direct')) {
        if (value == 'direct') {
            $('#editform' + index + 'direct').addClass('selected');
        } else {
            $('#editform' + index + 'direct').removeClass('selected');
        }
    }
    if ($('#editform' + index + 'correction')) {
        if (value == 'correction') {
            $('#editform' + index + 'correction').addClass('selected');
            if ($('#editform' + index + 'correctionclass')) {
                $('#editform' + index + 'correctionclass').show();
            }
        } else {
            $('#editform' + index + 'correction').removeClass('selected');
            if ($('#editform' + index + 'correctionclass')) {
                $('#editform' + index + 'correctionclass').hide();
            }
        }
    }
    if ($('#editform' + index + 'alternative')) {
        if (value == 'alternative') {
            $('#editform' + index + 'alternative').addClass('selected');
        } else {
            $('#editform' + index + 'alternative').removeClass('selected');
        }
    }
    if ($('#editform' + index + 'new')) {
        if (value == 'new') {
            $('#editform' + index + 'new').addClass('selected');
        } else {
            $('#editform' + index + 'new').removeClass('selected');
        }
    }
}

function addeditforms(preselectcorrectionclass) {
    /* Add edit form buttons (direct edit (D), correction (C), new (N), alternative (A)) */

    //preselectcorrectionclass - (str)  used to preset a correction class in the correction edit form


    //do we have a single selection?
    var selected = false;
    Object.keys(editforms).forEach(function(editform){
        if (editforms[editform]) {
            if (selected === false) {
                selected = editform;
            } else {
                selected = null;
            }
        }
    });
    var editformcount = 0;
    var s = "<span id=\"editforms" + editfields + "\" class=\"editforms\">";
    if (editforms.direct) {
        if ((selected == "direct") || (!selected)) {
            s += "<button id=\"editform" + editfields + "direct\" class=\"selected\" title=\"Edit Directly\" onclick=\"javascript:seteditform(" + editfields + ",'direct')\">D</button>";
        } else {
            s += "<button id=\"editform" + editfields + "direct\" title=\"Edit Directly\" onclick=\"javascript:seteditform(" + editfields + ",'direct')\">D</button>";
        }
        editformcount++;
    }
    if (editforms.new) {
        if (selected == "new") {
            s += "<button id=\"editform" + editfields + "new\" class=\"selected\" title=\"Add as new annotation, if allowed, leaving the existing one as is\" onclick=\"javascript:seteditform(" + editfields + ",'new')\">N</button>";
        } else {
            s += "<button id=\"editform" + editfields + "new\"  title=\"Add as new annotation, if allowed, leaving the existing one as is\" onclick=\"javascript:seteditform(" + editfields + ",'new')\">N</button>";
        }
        editformcount++;
    }
    if (editforms.correction) {
        if (selected == "correction") {
            s += "<button id=\"editform" + editfields + "correction\" class=\"selected\" title=\"Edit as new Correction\" onclick=\"javascript:seteditform(" + editfields + ",'correction')\">C</button>";
        } else {
            s += "<button id=\"editform" + editfields + "correction\"  title=\"Edit as new Correction\" onclick=\"javascript:seteditform(" + editfields + ",'correction')\">C</button>";
        }
        correctionset = $('#editformcorrectionset').val();
        if ((setdefinitions[correctionset]) && (setdefinitions[correctionset].type == "closed")) {
            s = s + "<select id=\"editform" + editfields + "correctionclass\">";
            s = s + "<option value=\"\"></option>";
            setdefinitions[correctionset].classorder.forEach(function(cid){
                c = setdefinitions[correctionset].classes[cid];
                s = s + getclassesasoptions(c, preselectcorrectionclass); // will add to s
            });
            s = s + "</select>";
        } else {
            s = s +  "<input type=\"text\" id=\"editform" + editfields + "correctionclass\" class=\"editformcorrectionclass classedit\" placeholder=\"(enter correction class)\" />";
        }
        editformcount++;
    }
    if (editforms.alternative) {
        if (selected == "alternative") {
            s += "<button id=\"editform" + editfields + "alternative\" class=\"selected\" title=\"Edit as new alternative annotation, the main annotation takes precedence\" onclick=\"javascript:seteditform(" + editfields + ",'alternative')\">A</button>";
        } else {
            s += "<button id=\"editform" + editfields + "alternative\"  title=\"Edit as new alternative annotation, the main annotation takes precedence\" onclick=\"javascript:seteditform(" + editfields + ",'alternative')\">A</button>";
        }
        editformcount++;
    }
    s = s + "</span>";
    return [s,editformcount];
}

function renderhigherorderfields(index, annotation) {
    /* Render higher order edit fields, as well as the menu to add fields for the specified annotation */

    var s = "";
    var items = [];
    //Add menu for adding higher-order annotation
    s += "<div id=\"editoraddhigherorder" + index + "\" class=\"addhigherordermenu\">+↓";
    s += "<ul>";
    //TODO: automatically infer possible higher order annotations
    if (folia_accepts(annotation.type, 'comment')) {
        s += "<li id=\"editoraddhigherorder" + index + "_comment\" onclick=\"addhigherorderfield('" + annotation.set + "'," + index + ",'comment')\">Add Comment</li>";
    }
    if (folia_accepts(annotation.type, 'desc')) {
        s += "<li id=\"editoraddhigherorder" + index + "_desc\" onclick=\"addhigherorderfield('" + annotation.set + "'," + index + ",'desc')\">Add Description</li>";
    }
    if (folia_accepts(annotation.type, 'feat')) {
        s += "<li id=\"editoraddhigherorder" + index + "_feat\" onclick=\"addhigherorderfield('" + annotation.set + "'," + index + ",'feat')\">Add Feature</li>";
    }
    if (folia_isspan(annotation.type)) {
        var spanroles = folia_spanroles(annotation.type);
        for (var j in spanroles) {
            s += "<li id=\"editoraddhigherorder" + index + "_feat\" onclick=\"addhigherorderfield('" + annotation.set + "'," + index + ",'" + spanroles[j] + "')\">Add " + folia_label(spanroles[j]) + "</li>";
        }
    }
    s += "</ul>";
    s += "</div>";

    //placeholder for higher order fields
    s += "<div id=\"higherorderfields" + index + "\" class=\"higherorderfields\"><table>";
    if (annotation.children) {
        //Render existing higher order annotation fields for editing
        for (var i = 0; i < annotation.children.length; i++) {
            if (annotation.children[i].type) {
                var s_item = renderhigherorderfield(index,items.length, annotation.children[i], annotation.set);
                if (s_item) {
                    s += s_item;
                    var child = JSON.parse(JSON.stringify(annotation.children[i])); //deep copy, hence the json/parse stringify
                    if (child.targets) {
                        child.targets_begin = JSON.parse(JSON.stringify(child.targets)); //there are two versions so we can compare if there was a change in span (deep copy again)
                    }
                    items.push(child);
                }
            }
        }
    }
    s += "<tr id=\"higherorderfields" + index + "placeholder\"></tr>";
    s += "</table></div>";
    return {'output':s,'items': items};
}

function renderhigherorderfield(index, ho_index, childannotation, set) {
    //render a single higher order field
    var s = "";
    if ((childannotation.type == 'comment') || (childannotation.type == 'desc')) {
        s = "<th>" + folia_label(childannotation.type) + ":</th><td><textarea id=\"higherorderfield" + index + "_" + ho_index + "\"  onkeyup=\"auto_grow(this)\">";
        if (childannotation.value) s += childannotation.value;
        s += "</textarea></td>";
    } else if (childannotation.type == 'feat') {
        s = "<th>" + folia_label(childannotation.type) + ":</th><td>";
        s += renderfeaturefields(set, childannotation.subset, childannotation.class, index, ho_index);
        s += "</td>";
    } else if (folia_isspanrole(childannotation.type)) {
        s = "<th>" + folia_label(childannotation.type) + ":</th><td><span id=\"spantext" + index + "_" + ho_index+ "\" class=\"text\">" + getspantext(childannotation, true) + "</span>";
        s += "<button id=\"spanselector" + index + "_" + ho_index + "\" class=\"spanselector\" title=\"Toggle span selection for this annotation type: click additional words in the text to select or deselect as part of this annotation\">Select span&gt;</button>";
        s += "</td>";
    }
    if (s) {
        s = "<tr class=\"higherorderrow\">" + s + "</tr>";
    }
    return s;
}

function renderfeaturefields(set, subset, cls, index, ho_index) {
    /* Renders two fields to edit a specific feature: a subset field and a class field, called by renderhigherorderfields() and addhigherorderfield() */
    var s = "";

    //subset field
    if ((setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].subsets) && (!$.isEmptyObject(setdefinitions[set].subsets))) {
        //subsets are defined in set definition; present drop-down selection box
        s += "<select class=\"subsetedit\" id=\"higherorderfield_subset_" + index + "_" + ho_index + "\" value=\"" +subset + "\" title=\"Feature subset\" onchange=\"$('#higherorderfield_" + index + "_" + ho_index + "')[0].outerHTML = renderfeatureclassfield('" + set + "',$(this).val(),''," + index + "," + ho_index + ");\">";
        s += "<option value=\"\"></option>";
        Object.keys(setdefinitions[set].subsets).forEach(function(subsetid){
            var label = subsetid;
            if (setdefinitions[set].subsets[subsetid].label) {
                label = setdefinitions[set].subsets[subsetid].label;
            }
            if (subsetid == subset) {
                s += "<option value=\"" + subsetid + "\" selected=\"selected\">" + label + "</option>";
            } else {
                s += "<option value=\"" + subsetid + "\">" + label + "</option>";
            }
        });
        s += "</select>";
    } else {
        //subsets are open; present a free field
        s += "<input class=\"subsetedit\" id=\"higherorderfield_subset_" + index + "_" + ho_index + "\" value=\"" +subset + "\" placeholder=\"(feature subset)\" title=\"Feature subset\" />";
    }

    //class field
    s += renderfeatureclassfield(set,subset,cls,index,ho_index);
    return s;

}


function renderfeatureclassfield(set, subset, cls, index, ho_index) {
    var s = "";
    if ((setdefinitions) && (setdefinitions[set]) && (setdefinitions[set].subsets) && (setdefinitions[set].subsets[subset])) {
        //classes for the subset are defined in set definition; present drop-down selection box
        s += "<select class=\"classedit\" id=\"higherorderfield_" + index + "_" + ho_index + "\" value=\"" +subset + "\" title=\"Feature subset\">";
        s += "<option value=\"\"></option>";
        setdefinitions[set].subsets[subset].classorder.forEach(function(cid){
            c = setdefinitions[set].subsets[subset].classes[cid];
            s = s + getclassesasoptions(c, cls);
        });
        s += "</select>";
    } else {
        //subsets are open; present a free field
        s += "<input class=\"classedit\" id=\"higherorderfield_" + index + "_" + ho_index + "\" value=\"" +cls + "\" placeholder=\"(feature class)\" title=\"Feature class\" />";
    }
    return s;
}

function addhigherorderfield(set, index, type) {
    /* Add a new higher order annotation field (called when the user selects a field to add from the higher-order menu) */

    var ho_index = editdata[index].children.length;
    var newchildannotation = null;
    if ((type == "comment") || (type == "desc")) {
        newchildannotation = {'type':type, 'value':""};
    } else if (type == "feat") {
        newchildannotation = {'type':type, 'subset': "", 'class':""};
    } else if (folia_isspanrole(type)) {
        newchildannotation = {'type':type,'targets': [], 'targets_begin': []};
    }
    if (folia_occurrences(type) == 1) {
        //ensure we don't add a duplicate
        var exists = false;
        for (var i = 0; i < editdata[index].children.length; i++) {
            if (editdata[index].children[i].type == type) {
                alert("An annotation of this type already exists, there can be only one");
                return false;
            }
        }
    }
    if (newchildannotation !== null) {
        $('#higherorderfields' + index +  "placeholder")[0].outerHTML =
            "<tr class=\"higherorderrow\">" +
            renderhigherorderfield(index, ho_index, newchildannotation, set) +
            "</tr><tr id=\"higherorderfields" + index + "placeholder\"></tr>";
        editdata[index].children.push(newchildannotation);
        $('#spanselector' + index + '_' + (editdata[index].children.length-1) ).off().click(spanselector_click);
    }
}

function getclassesasoptions(c, selected) {
    /* get classes pertaining to a set, from a set definition, as option elements (used in select) supports recursive classes */
    var s;
    if (c.id == selected) {
        s = s + "<option selected=\"selected\" value=\"" + c.id + "\">" + c.label + "</option>";
    } else {
        s = s + "<option value=\"" + c.id + "\">" + c.label + "</option>";
    }
    if (c.subclasses) {
        Object.keys(c.subclasses).forEach(function(cid){
            s = s + getclassesasoptions(c.subclasses[cid], selected);
        });
    }
    return s;
}

function spanselector_click(){
    /* Called when the span select button (a toggle) is clicked: sets up or stops span selection */


    var i;
    var sub;
    underscore = this.id.indexOf('_'); //underscore is used for span selectors on higher order annotation elements (i.e. span roles)
    //get index ID (we can't reuse i from the larger scope here!!)
    if (underscore == -1) {
        i = parseInt(this.id.substr(12));
        sub = -1;
    } else {
        i = parseInt(this.id.substr(12, underscore-12));
        sub = parseInt(this.id.substr(underscore+1));
    }

    //toggle coselector (select multiple), takes care of
    //switching off any other coselector
    var toggleon = true;
    var j;

    //de-highlight all coselected elements
    $('.F .selected').removeClass('selected');

    if (coselector > -1) {
        if (coselector == i) toggleon = false; //this is a toggle off action only

        //de-highlight the button itself
        if (coselector_sub == -1) {
            $('#spanselector' + coselector).removeClass("selectoron");
        } else {
            $('#spanselector' + coselector + '_' + coselector_sub).removeClass("selectoron");
        }

        coselector = -1;
        coselector_sub = -1;
    }
    if (toggleon) {
        coselector = i;
        coselector_sub = sub;

        //highlight all coselected elements
        if (coselector_sub == -1) {
            for (j = 0; j < editdata[coselector].targets.length; j++) {
                $('#' + valid(editdata[coselector].targets[j])).addClass('selected');
            }
        } else {
            for (j = 0; j < editdata[coselector].children[coselector_sub].targets.length; j++) {
                $('#' + valid(editdata[coselector].children[coselector_sub].targets[j])).addClass('selected');
            }
        }

        //highlight the button itself
        $(this).addClass("selectoron");
    }
}

function applysuggestion(e,i) {
    /* Apply a suggestion for correction, pre-fills the necessary edit fields with the suggestions, called by selecting a suggestion from the pull-down list */
    if ($(e).val()) {
        fields = $(e).val().split("|");
        var val = fields[0];
        var cls = fields[1];
        if ($("#editfield" + i + "text").length > 0) {
            $("#editfield" + i + "text").val(val);
        } else{
            $("#editfield" + i).val(val);
        }
        if ($("#editform" + i + "correctionclass").length > 0) {
            if ($("#editform" + i + "correctionclass")[0].type == 'select-one') {
                $('#editform' + i + 'correctionclass>option[value="' + cls+ '"]').prop('selected',true);
            } else {
                $("#editform" + i + "correctionclass").val(cls);
            }
        }
    }
}

function renderparentspanfield(index, annotation, nestableparents) {
    //This is a nestable span element
    var s = "<div class=\"parentspaneditor\">Parent span: " +
            "<select id=\"parentspan" + index + "\">" +
            "<option value=\"\">(none/root)</option>";
    forspanannotations(annotation.layerparent, function(spanannotation){
        for (var i = 0; i < nestableparents.length; i++) {
            if ((spanannotation.type == nestableparents[i]) && (spanannotation.id != annotation.id)) {
                var label = folia_label(spanannotation.type, spanannotation.set);
                s += "<option value=\""+spanannotation.id+"\"";
                if ((annotation.parentspan) && (annotation.parentspan === spanannotation.id)) {
                    s += " selected=\"selected\"";
                }
                s += ">" + label + " " + spanannotation.class + ": " + getspantext(spanannotation)+  "</option>";
            }
        }
    });
    s = s + "</div>";
    return s;
}


function showeditor(element) {
    /* show and populate the editor for a particular element */
    editsuggestinsertion = null;

    var i;
    if ((element) && (element.id) && (((selector !== "") && ($(element).hasClass(selector))) || ((selector === "") && ($(element).hasClass('deepest')))) ) { //sanity check: is there an element selected?
        if (structure[element.id]) { //are there annotations for this element?
            editoropen = true;
            sethover(element);
            editedelementid = element.id;
            editedelementtype = structure[element.id].type;
            editfields = 0;
            editdata = [];

            //clear current selection
            $('.selected').removeClass('selected');
            $(element).addClass('selected');
            //select(element);

            var annotationfocusfound = -1;
            var editformcount = 0;
            var renderedfields = [];

            //Iterate over all annotations for the selected target element
            forannotations(element.id,function(annotation){
                var s = "";
                var isannotationfocus = false;
                if (annotationfocus) {
                    if ((annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)) {
                        //this annotation is corresponds to the annotation focus
                        isannotationfocus = true; //set per-item
                        annotationfocusfound = editfields; //set only once for all
                    }
                }

                //Is this an annotation we want to show? Is it either in editannotations or is it the annotationfocus? (corrections are never shown directly)
                if ((annotation.type != "correction") && ((editannotations[annotation.type+"/" + annotation.set]) ||  (isannotationfocus))) {

                    //Get the human-presentable label for the annotation type
                    label = folia_label(annotation.type, annotation.set);

                    if (annotation.set) {
                        setname = annotation.set;
                    } else {
                        setname = "";
                    }
                    var repeatreference;
                    if (repeatmode) {
                        for (var i = 0; i < sentdata.length;i++) {
                            if ((sentdata[i].type === annotation.type) && (sentdata[i].set === annotation.set)) {
                                repeatreference = sentdata[i];
                                sentdata[i].used = true; //mark as used (unused elements will be added later)
                            }
                        }
                    }
                    if (isannotationfocus) {
                        s = s + "<tr class=\"focus\">"; //annotation focus is highlighted in the editor
                    } else {
                        s = s + "<tr>";
                    }
                    s = s + "<th>" + label + "<br /><span class=\"setname\">" + setname + "</span>";
                    if (annotation.type == "su") {
                        s = s + "<div class=\"opentreeview\" title=\"Show in Tree Viewer\" onclick=\"treeview('" + annotation.id + "')\"></div>";
                    }
                    s = s + "</th><td>";
                    var repeat_preset = false; //is this annotation preset because of repeatmode?
                    var class_value;
                    if ((annotation.type == 't') || (annotation.type == 'ph')) {
                        //Annotation concerns text content
                        class_value = annotation.class;
                        if (repeatmode) {
                            class_value = repeatreference.class;
                            if (class_value != annotation.class) { repeat_preset = true; }
                        }
                        var text_value;
                        if (annotation.type == 't') {
                            text_value = annotation.text;
                            if (repeatmode) {
                                text_value = repeatreference.text;
                                if (text_value != annotation.text) { repeat_preset = true; }
                            }
                        } else if (annotation.type == 'ph') {
                            text_value = annotation.phon;
                            if (repeatmode) {
                                text_value = repeatreference.phon;
                                if (text_value != annotation.phon) { repeat_preset = true; }
                            }
                        }
                        if (annotation.class != "current") {
                            s = s + "Class: <input id=\"editfield" + editfields + "\" class=\"classedit\" value=\"" + class_value + "\"/><br/>Text:";
                        } else {
                            s = s + "<input style=\"display: none\" id=\"editfield" + editfields + "\" class=\"classedit\" value=\"" + class_value + "\"/>";
                        }
                        s = s + "<input id=\"editfield" + editfields + "text\" class=\"textedit\" value=\"" + text_value + "\"/>";
                    } else {
                        //Annotation concerns a class
                        if (folia_accepts_class(foliatag2class[annotation.type],'WordReference')) {
                            //Annotation is a span annotation, gather the text of the entire span for presentation:
                            //omit span annotations that only have span roles
                            if (annotation.type == 'su') {
                                spantext = getspantext(annotation, false);
                            } else {
                                spantext = getspantext(annotation, true);
                            }
                            s  = s + "<span id=\"spantext" + editfields + "\" class=\"text\">" + spantext + "</span>";
                            s  = s + "<br/>";
                        }
                        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type == "closed")) {
                            //Annotation type uses a closed set of options, present a drop-down list
                            s = s + "<select id=\"editfield" + editfields + "\" class=\"classedit\">";
                            s = s + "<option value=\"\"></option>";
                            setdefinitions[annotation.set].classorder.forEach(function(cid){
                                c = setdefinitions[annotation.set].classes[cid];
                                if (repeatmode) {
                                    s = s + getclassesasoptions(c, repeatreference.class); // will add to s
                                    if (annotation.class != repeatreference.class) { repeat_preset = true; }
                                } else {
                                    s = s + getclassesasoptions(c, annotation.class); // will add to s
                                }
                            });
                            s = s + "</select>";
                        } else {
                            //Annotation type uses a free-fill value, present a textbox:
                            class_value = annotation.class;
                            if (repeatmode) {
                                class_value = repeatreference.class;
                                if (annotation.class != class_value) { repeat_preset = true; }
                            }
                            s = s + "<input id=\"editfield" + editfields + "\" class=\"classedit\" value=\"" + class_value + "\" title=\"Enter a value (class) for this annotation, an empty class will delete it\" />";
                        }
                    }
                    if (repeat_preset) s = s + " <span class=\"repeatnotice\">(preset)</span>";
                    if ((annotation.type == "t") || ((folia_isspan(annotation.type) && (folia_accepts_class(foliatag2class[annotation.type],'WordReference'))))) { //are we manipulating a span annotation element and does this element take word references? (as opposed to one that only takes span roles)... also accept a span selector for text (needed for word merges/splits)
                        s  = s + "<button id=\"spanselector" + editfields + "\" class=\"spanselector\" title=\"Toggle span selection for this annotation type: click additional words in the text to select or deselect as part of this annotation\">Select span&gt;</button><br />";
                    }
                    var preselectcorrectionclass = "";
                    if (annotation.hassuggestions) {
                        //The annotation has suggestions (for correction)
                        //
                        s += "<div class=\"suggestions\"><label>Suggestions:</label> ";
                        var onchange;
                        //if (annotation.type == 't') {
                        //    s += "<select id=\"editsuggestions\" onchange=\"applysuggestion_text(this," + editfields + ")\">";
                        //} else {
                        s += "<select id=\"editsuggestions\" onchange=\"applysuggestion(this," + editfields + ")\">";
                        //}
                        s += "<option value=\"\"></option>";
                        var suggestions = [];
                        annotation.hassuggestions.forEach(function(correctionid){
                            if (annotations[correctionid]) {
                                var correction = annotations[correctionid];
                                correction.suggestions.forEach(function(suggestion){
                                    if (suggestion.annotations) { //we're in an annotation context so won't have to worry about structural corrections here
                                        suggestion.annotations.forEach(function(child_id){
                                            var child = annotations[child_id];
                                            if ((child.type == annotation.type) && (child.set == annotation.set)) {
                                                var value;
                                                if (child.type == "t") {
                                                    value = child.text;
                                                } else if (child.type == "ph") {
                                                    value = child.phon;
                                                } else{
                                                    value = child.cls;
                                                }
                                                if (suggestions.indexOf(value) == -1) {
                                                    suggestions.push(value);
                                                    s += "<option value=\"" + value + "|" + correction.class + "\">" + value + "</option>";
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        s += "</select>";
                        s += "</div>";
                    }

                    //Add edit form buttons (direct edit (D), correction (C), new (N), alternative (A))
                    editformdata = addeditforms();
                    editformcount = editformdata[1];
                    s = s + editformdata[0];

                    //Add confidence slider
                    if (editconfidence && annotation.type != 't' && annotation.type != 'ph') {
                        s = s + "<div class=\"confidenceeditor\"><input type=\"checkbox\" id=\"confidencecheck" + editfields + "\" title=\"Select how confident you are in this annotation using the slider, slide to the right for more confidence\" onchange=\"setconfidenceslider(" + editfields + ");\" /> confidence: <div id=\"confidenceslider" + editfields + "\">(not set)</div></div>";
                    }

                    ho_result = renderhigherorderfields(editfields, annotation);
                    s  = s + ho_result.output;


                    var nestablespan = folia_nestablespan(annotation.type);
                    if (nestablespan.length > 0) {
                        s = s + renderparentspanfield(editfields, annotation, nestablespan);

                    }

                    s = s + "</td></tr>";

                    //Set up the data structure for this annotation input, changes in the forms will be reflected back into this (all items are pushed to the editdata list)
                    editfields = editfields + 1; //number of items in editdata, i.e. number of editable annotations in the editor
                    editdataitem = {'type':annotation.type,'set':annotation.set, 'class':annotation.class, 'new': false, 'changed': false, 'children': ho_result.items };
                    if (annotation.type == 't') {
                        editdataitem.text = annotation.text;
                    } else if (annotation.type == 'ph') {
                        editdataitem.text = annotation.phon;
                    }
                    if (annotation.id) editdataitem.id = annotation.id;
                    if (annotation.hasOwnProperty('confidence')) {
                        editdataitem.confidence = annotation.confidence;
                    } else {
                        editdataitem.confidence = "NONE"; //not set, FQL keyword
                    }

                    //set default edit form (seteditform will be called later to affect the interface)
                    if (editforms.correction) {
                        editdataitem.editform = 'correction';
                    } else if (editforms.direct) {
                        editdataitem.editform = 'direct';
                    } else if (editforms.alternative) {
                        editdataitem.editform = 'alternative';
                    } else {
                        //default fallback
                        editdataitem.editform = 'direct';
                    }
                    if (annotation.parentspan) {
                        editdataitem.parentspan = annotation.parentspan;
                    } else if (nestablespan.length > 0) {
                        editdataitem.parentspan = "";
                    }

                    //Set the target elements for this annotation (it may concern more than the selected element after all)
                    editdataitem.targets_begin = JSON.parse(JSON.stringify(annotation.targets)); //there are two versions so we can compare if there was a change in span (deep copy, hence the json parse/stringify)
                    editdataitem.targets = JSON.parse(JSON.stringify(annotation.targets)); //only this version will be altered by the interface and passed to the backend (deep copy, hence the json parse/stringify)
                    editdata.push(editdataitem); //add this item
                    renderedfields.push([annotation.type,s]);


                    if (isannotationfocus) {
                        //highlight other targets if this annotation type is the annotation focus (just mimicks user click)
                        for (var j = 0; j < annotation.targets.length; j++) {
                            $('#' + valid(annotation.targets[j])).addClass('selected');
                        }
                    }

                }

            });

            //display rendered fields in proper order
            var s = "";
            renderedfields.sort(sortdisplayorder);
            renderedfields.forEach(function(e){s=s+e[1];});
            s = s + "<tr id=\"editrowplaceholder\"></tr>";
            idheader = "<div id=\"id\">" + element.id + "</div>";


            //extra fields list, adds a selector in the editor for adding extra annotation types to an element (must be previously declared)
            setaddablefields();

            //render editor
            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);
            $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-200} ); //editor positioning



            if ((annotationfocus) && (annotationfocusfound == -1)) {
                //the annotation focus has not been found, so no field appears, add one automatically:
                for (i = 0; i < editoraddablefields.length; i++) {
                    if ((editoraddablefields[i].type == annotationfocus.type) && (editoraddablefields[i].set == annotationfocus.set) && (folia_accepts(editedelementtype,annotationfocus.type)) ) {
                        annotationfocusfound = addeditorfield(i);
                        break;
                    }
                }
            }
            if (repeatmode) {
                //process unused elements from sentdata (!sentdata[x].used)
                for (i = 0; i < sentdata.length; i++) {
                    if (!sentdata[i].used) {
                        for (var j = 0; j < editoraddablefields.length; j++) {
                            if ((editoraddablefields[j].type == sentdata[i].type) && (editoraddablefields[j].set == sentdata[i].set) && (folia_accepts(editedelementtype,sentdata[i].type))) {
                                addeditorfield(j);
                                break;
                            }
                        }
                    }
                }
            }

            //render confidence sliders
            if (editconfidence) {
                for (i = 0; i < editfields;i++){
                    if (editdata[i].type != 't' && editdata[i].type != "ph" && editdata[i].confidence !== "NONE") {
                        $('#confidencecheck' + i).attr('checked',true);
                        setconfidenceslider(i, Math.round(editdata[i].confidence * 100));
                    }
                }
            }

            //show the edit form buttons when there is more than one option, hide otherwise
            if ((editformcount > 1) || (editforms.correction)) {
                $('.editforms').show();
            } else {
                $('.editforms').hide();
            }

            //configure interface actions and events for edit fields
            var spanselectorclicked = false;
            for (i = 0; i < editfields;i++){
                //propagate editform to interface, for each field
                seteditform(i, editdata[i].editform);

                //sort options in down-lists alphabetically
                $('select#editfield'+i).sortOptions();

                //Enable the span selector button
                $('#spanselector' + i).off(); //prevent duplicates
                $('#spanselector' + i).click(spanselector_click);
                if ((annotationfocusfound == i) && (configuration.autoselectspan) && (!spanselectorclicked) && (folia_isspan(editdata[i].type))) {
                    $('#spanselector' + i).click();
                    spanselectorclicked = true;
                }
                if (editdata[i].children) {
                    //Enable span selector buttons for span roles
                    for (j = 0; j < editdata[i].children.length; j++) {
                        $('#spanselector' + i + '_' + j).off(); //prevent duplicates
                        $('#spanselector' + i + '_' + j).click(spanselector_click);
                    }
                }

                //sort correctionclass
                if ($('select#editform' + i + 'correctionclass')) {
                    var options = $('#editform' + i + 'correctionclass option');
                    var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value , s: $(o).attr('selected')}; }).get();
                    arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
                    options.each(function(i, o) {
                        o.value = arr[i].v;
                        $(o).text(arr[i].t);
                        $(o).attr('selected', arr[i].s);
                    });
                }

                /*$('#editfield'+i).change(function(){
                    index = 0;
                    for (var i = 0; i < editfields;i++) { if (this.id == "editfield" + i) { index = i; break; } }
                    if ($(this).val() != editdata[index].class) {
                        editdata[index].class = $(this).val();
                        if (!$(this).hasClass("changed")) $(this).addClass("changed");
                    }
                });*/
                /*$('#editordelete'+i).click(function(){
                    index = 0;
                    for (var i = 0; i < editfields;i++) { if (this.id == "editordelete" + i) { index = i; break; } }
                    editdata[index].delete = true;
                    $("#editfield" + index).val("");
                    if (!$(this).hasClass("changed")) $(this).addClass("changed");
                });*/
            }

            //finally, show the editor
            $('#editor').show();
            $('#editor').draggable();
        } else if (suggestinsertion[element.id]) {
            //suggestion for insertion:
            //we select the PREVIOUS element and add this text
            previousid = suggestinsertion[element.id].previous;
            $('#' + valid(previousid)).click(); //this will call showeditor() again but now for the previous element

            //now we manipulate the editor by adding the suggested text
            for (i = 0; i < editfields; i++) {
                if (editdata[i].type == "t") {
                    var newtext = editdata[i].text  + ' ' + $(element).find('.lbl').html().replace('&nbsp;','');
                    $('#editfield' + i + 'text').val(newtext);
                    $('#editform' + i + 'correction').click(); //edit as correction
                    //select the right class:
                    try{
                        if ($('#editform' + i + 'correctionclass')[0].type == 'select-one') {
                            //select
                            $('#editform' + i + 'correctionclass>option[value="' + suggestinsertion[element.id].class + '"]').prop('selected',true);
                        } else{
                            //simple free field
                            $('#editform' + i + 'correctionclass').val(suggestinsertion[element.id].class);
                        }
                    }catch(err){}
                }
            }

            //and we set editsuggestinsertion to the correction id, so the
            //editor will reuse the correction upon submission (provided it
            //is edited as correction rather than direct)
            editsuggestinsertion = suggestinsertion[element.id].id;
        }
    }
}

function closeeditor() {
    /* called when the editor should be closed (i.e. the X button is clicked or
     * another process wants to close it) */
    //note that repeat mode is not disabled here, but only when the dialog is explicitly closed using the button
    $('#editor').hide();
    $('#wait').hide();
    editoropen = false;
    coselector = -1;
    $('#document .selected').removeClass("selected");
    $('#editor .selectoron').removeClass("selectoron");
}



function addeditorfield(index) {
    /* add a new field to the editor, populated by setaddablefields() */
    var label = folia_label(editoraddablefields[index].type, editoraddablefields[index].set);
    var setname;
    if (editoraddablefields[index].set) {
        setname = editoraddablefields[index].set;
    } else {
        setname = "";
    }

    var repeatreference = null;
    if (repeatmode) {
        for (var i = 0; i < sentdata.length;i++) {
            if ((sentdata[i].type === editoraddablefields[index].type) && (sentdata[i].set === editoraddablefields[index].set)) {
                repeatreference = sentdata[i];
                sentdata[i].used = true; //mark as used (unused elements will be added later)
            }
        }
    }

    var s = "";
    if ((annotationfocus) && (annotationfocus.type == editoraddablefields[index].type) && (annotationfocus.set == editoraddablefields[index].set)) {
        s = s + "<tr class=\"focus\">";
    } else {
        s = s + "<tr>";
    }
    s =  s + "<th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
    if ((setdefinitions[editoraddablefields[index].set]) && (setdefinitions[editoraddablefields[index].set].type == "closed")) {
        //drop-down field
        s = s + "<select id=\"editfield" + editfields + "\" class=\"classedit\">";
        var selected_option;
        if ((!repeatmode) || (repeatreference === null) || (repeatreference.class === "")) {
            s = s + "<option selected=\"selected\" value=\"\"></option>";
            selected_option = "";
        } else {
            s = s + "<option value=\"\"></option>";
            selected_option = repeatreference.class;
        }
        if (setdefinitions[editoraddablefields[index].set].classorder) {
            setdefinitions[editoraddablefields[index].set].classorder.forEach(function(cid){
                c = setdefinitions[editoraddablefields[index].set].classes[cid];
                s = s + getclassesasoptions(c, selected_option); // will add to s
            });
        }
        s = s + "</select>";
    } else {
        //text-field
        s = s + "<input id=\"editfield" + editfields + "\" class=\"classedit\" value=\"\"/>";
    }
    if (repeatmode) s = s + " <span class=\"repeatnotice\">(preset)</span>";

    var isspan = folia_isspan(editoraddablefields[index].type);
    var accepts_wrefs = folia_accepts_class(foliatag2class[editoraddablefields[index].type],'WordReference');
    if (isspan && accepts_wrefs) { //are we manipulating a span annotation element and does this element take word references? (as opposed to one that only takes span roles)
        s = s + "<button id=\"spanselector" + editfields + "\" class=\"spanselector\" title=\"Toggle span selection for this annotation type: click additional words in the text to select or unselect as part of this annotation\">Select span&gt;</button><br />";
    }

    if (editconfidence &&  editoraddablefields[index].type != 't') {
        s = s + "<div class=\"confidenceeditor\"><input type=\"checkbox\" id=\"confidencecheck" + editfields + "\" title=\"Select how confident you are using the slider, slide to the right for more confidence\" onchange=\"setconfidenceslider(" + editfields + ");\" /> confidence: <div id=\"confidenceslider" + editfields + "\">(not set)</div></div>";
    }

    var ho_result = renderhigherorderfields(editfields, editoraddablefields[index]); //will always be empty but sets a proper placeholder we can use
    s  = s + ho_result.output;

    var nestablespan = folia_nestablespan(editoraddablefields[index].type);
    if (nestablespan.length > 0) {
        editoraddablefields[index].layerparent = structure[editedelementid].parent;
        while ((structure[editoraddablefields[index].layerparent].type == 'correction') || (structure[editoraddablefields[index].layerparent].type == 'part'))  {
            editoraddablefields[index].layerparent = structure[editoraddablefields[index].layerparent].parent;
        }
        s = s + renderparentspanfield(editfields, editoraddablefields[index], nestablespan);
    }

    s = s + "</td></tr><tr id=\"editrowplaceholder\"></tr>";
    $('#editrowplaceholder')[0].outerHTML = s;

    $('#spanselector' + editfields).off(); //prevent duplicates
    $('#spanselector' + editfields).click(spanselector_click);

    editfields = editfields + 1; //increment after adding
    var targets = [];
    //add the selected element to the targets except if we are adding a span annotation that takes no direct wrefs (i.e. only its span roles take children)
    if ((!isspan) || (accepts_wrefs)) {
        targets = [editedelementid];
    }
    var editdataitem = {'type':editoraddablefields[index].type,'set':editoraddablefields[index].set, 'targets': targets, 'targets_begin': targets,'confidence': 'NONE', 'class':'', 'new': true, 'changed': true, 'children': ho_result.items };
    if (nestablespan.length > 0) {
        editdataitem.parentspan = "";
    }
    editdata.push(editdataitem);


    //automatically add required higher-order fields
    var foliaelement = foliaelements[foliatag2class[editoraddablefields[index].type]];
    if ((foliaelement.properties) && (foliaelement.properties.required_data)) {
        for (var j = 0; j < foliaelement.properties.required_data.length; j++) {
            var subtag = foliaelements[foliaelement.properties.required_data[j]].properties.xmltag;
            addhigherorderfield(editoraddablefields[index].set, editdata.length - 1 ,subtag);
        }
    }

    setaddablefields();
    return editfields - 1;
}

function showhistory() {
    /* Show a dialog window with the history of all edits (git history) and th
     * option to roll back to a specific revision */
    $('#wait').show();
    $.ajax({
        type: 'GET',
        url: "/editor/" + namespace + "/"+ docid + "/history/",
        contentType: "application/json",
        headers: {'X-sessionid': sid },
        processData: true,
        success: function(data) {
            $('#wait').hide();
            s = "";
            data.history.forEach(function(h){
                if (s === "") {
                    s = s + "<li><tt><strong>" + h.date + '</strong></tt> - <em>' + h.msg + '</em> - (current version)</li>';
                } else {
                    s = s + "<li><tt><strong>" + h.date + '</strong></tt> - <em>' + h.msg + "</em> - [<a href=\"javascript:revert('"+h.commit+"')\">Revert to this version</a>]</li>";
                }
            });
            $('#historybody').html("<ol>" + s + "</ol>");
            $('#history').show();
            $('#history').draggable();
        },
        error: function(req,err,exception) {
            $('#wait').hide();
            editor_error("Unable to obtain history");
        },
        dataType: "json"
    });
}


function revert(commithash) {
    /* Revert to a specific revision, identified by git commithash, called from
     * the history & undo dialog window */
    $('#wait').show();
    $.ajax({
        type: 'GET',
        url: "/editor/" + namespace + "/"+ docid + "/revert/" + commithash,
        contentType: "application/json",
        headers: {'X-sessionid': sid },
        //processData: false,
        success: function(data) {
            location.reload();
        },
        error: function(req,err,exception) {
            $('#wait').hide();
            editor_error("Unable to revert: " + req.responseText);
        },
        dataType: "json"
    });

}

function setconfidenceslider(index, value) {
    /* Set the confidence slider to a particular confidence value */
    value = typeof value !== 'undefined' ? value : 50; //default value
    var checked = $('#confidencecheck' + index).is(':checked');
    if (checked) {
        $('#confidenceslider' + index).html('<span id="confidencevalue' + index + '">' + value + '%</span>');
        $('#confidenceslider' + index).slider({
            'change': function(event, ui) { //update label when slider moves
                var index = $(this).data('index');
                $('#confidencevalue'+index).html(ui.value + '%');
            },
        });
        $('#confidenceslider' + index).data("index",index);
        $('#confidenceslider' + index).slider('value',value);
        return true;
    } else {
        $('#confidenceslider' + index).html('(not set)');
        return true;
    }
}

function editor_onclick(element) {
    /* An element is clicked: open the editor */
    if (coselector >= 0) {
        select(element); //toggle
    } else if (!editoropen) {
        $('#info').hide();
        showeditor(element);
    }
}




function editor_ondblclick(element) {
    /* An element is doubleclicked: close/cancel any existing editor dialog, and open the editor anew */
    $('#info').hide();
    if (editoropen) {
        closeeditor();
    }
    showeditor(element);
}

function editor_onmouseenter(element) {
    /* Mouse cursor hovers over an element */
    if (!editoropen) {
        sethover(element);
        showinfo(element);
    }
}


function editor_onloadannotations(annotationlist) {
    viewer_onloadannotations(annotationlist);
}

function editor_ontimer() {
    viewer_ontimer();
}

function editor_onupdate() {
    /* called when new data is received from the backend and the document needs
     * to be updated. Non-mode specific updating is already done at this stage */
    viewer_onupdate(); //do viewer-mode specific updating
    $('#saveversion').hide();
}

function editor_contentloaded(data) {
    viewer_contentloaded(data); //relay to viewer mode
}

function editor_onrendertextclass() {
    viewer_onrendertextclass(); //relay to viewer mode
}

function editor_onpagechange() {
    viewer_onpagechange(); //relay to viewer mode
}

function declare() {
    /* Presents the dialog window to declare a new annotation type */
    $('#newdeclaration').show();
    $('#newdeclaration').draggable();
}

function editor_loadmenus() {
    /* Populate the editor menus */
    var menu = [];
    Object.keys(declarations).forEach(function(annotationtype){
      Object.keys(declarations[annotationtype]).forEach(function(set){
        if ((configuration.allowededitannotations === true) || (configuration.allowededitannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.allowededitannotations.indexOf(annotationtype) != -1)) {
            if ((configuration.initialeditannotations === true) || (configuration.initialeditannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.initialeditannotations.indexOf(annotationtype) != -1)) {
                editannotations[annotationtype + "/" + set] = true;
            }
            label = folia_label(annotationtype, set);
            menu.push([annotationtype, "<li id=\"annotationtypeedit_" +annotationtype+"_" + hash(set) + "\" class=\"on\"><a href=\"javascript:toggleannotationedit('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>"]);
        }
      });
    });
    var s_menu = "";
    menu.sort(sortdisplayorder);
    menu.forEach(function(e){s_menu+=e[1];});
    $('#annotationseditviewmenu').html(s_menu);
}

function openconsole() {
    /* Opens the FQL query console that also serves to hold queued annotations */
    $('#console').show();
    $('#console').draggable();
}


function editor_error(errormsg) {
    if ((namespace == "testflat") && (docid != "manual")) {
        globalassert.ok(false,"Editor error: " + errormsg);
        QUnit.start(); //continue with next test
    } else {
        alert(errormsg); //make nicer someday, alerts are evil
    }
}

function update_queue_info() {
    /* updates the queue information in the interface, hides or shows the
     * "Submit queue" button */
    var queuedqueries = $('#queryinput').val();
    var queuesize = queuedqueries.split("\n").length;
    if (queuedqueries === "") {
        $('#submitqueue').hide();
    } else {
        $('#submitqueue').text("Submit queue (" + queuesize + ")");
        $('#submitqueue').show();
    }
}


function gather_changes() {
    /* See if there are any changes in the values: did the user do something and do we have to prepare a query for the backend?
     * This functions prepares validates the input and prepares the editdata structures so queries can be more
     * easily formed in the next stage. Called by editor_submit()  */


    var changes = false; //assume no changes, falsify:
    for (var i = 0; i < editfields;i++) {
        if ($('#editfield' + i) && (($('#editfield' + i).val() != editdata[i].class) || (editdata[i].editform == 'new') ) && ($('#editfield' + i).val() != 'undefined') ) {
            //A class was changed
            //alert("Class change for " + i + ", was " + editdata[i].class + ", changed to " + $('#editfield'+i).val());
            editdata[i].oldclass = editdata[i].class;
            editdata[i].class = $('#editfield' + i).val().trim();
            editdata[i].changed = true;
        }
        if (((editdata[i].type == "t") || (editdata[i].type == "ph")) && ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() != editdata[i].text))) {
            //Text content was changed
            //alert("Text change for " + i + ", was " + editdata[i].text + ", changed to " + $('#editfield'+i+'text').val());
            editdata[i].oldtext = editdata[i].text;
            editdata[i].text = $('#editfield' + i + 'text').val().trim();
            editdata[i].changed = true;
        }
        if ((editdata[i].editform == 'correction') && (!editdata[i].changed) && ($('#editform' + i + 'correctionclass').val().trim())) {
            //edit of correction class only, affects existing correction
            editdata[i].correctionclasschanged = true;
            editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val().trim();
            editdata[i].correctionset = $('#editformcorrectionset').val().trim();
            if (!editdata[i].correctionclass) {
                throw "Error (" + i + "): Annotation " + editdata[i].type + " was changed and submitted as correction, but no correction class was entered";
            }
            if ($('#editfield' + i) && ($('#editfield' + i).val() == editdata[i].class) && ($('#editfield' + i).val() != 'undefined') ) {
                editdata[i].oldclass = editdata[i].class; //will remain equal
                editdata[i].class = $('#editfield' + i).val().trim();
            }
            if (((editdata[i].type == "t") || (editdata[i].type == "ph"))  && ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() == editdata[i].text))) {
                editdata[i].oldtext = editdata[i].text; //will remain equal
                editdata[i].text = $('#editfield' + i + 'text').val().trim();
            }
        }
        if ((editdata[i].parentspan !== undefined) && (editdata[i].parentspan != $('#parentspan' + i).val())) {
            editdata[i].parentspan = $('#parentspan' + i).val();
            editdata[i].oldparentspan = editdata[i].parentspan;
            editdata[i].changed = true;
        }

        if ($('#confidencecheck' + i).is(':checked')) {
            var confidence = $('#confidenceslider' + i).slider('value') / 100;
            if ((confidence != editdata[i].confidence) && ((editdata[i].confidence == "NONE") || (Math.abs(editdata[i].confidence - confidence) >= 0.01)))  { //compensate for lack of slider precision: very small changes do not count
                editdata[i].changed = true;
            }
            editdata[i].confidence = confidence;
        } else if (editdata[i].confidence != "NONE") {
            editdata[i].confidence = "NONE";
            editdata[i].changed = true;
        }


        if ((JSON.stringify(editdata[i].targets) != JSON.stringify(editdata[i].targets_begin)) && (editdata[i].editform != 'new')) {
            //detect changes in span, and set the changed flag
            editdata[i].changed = true;
            editdata[i].respan = true;
        }

        editdata[i].higherorderchanged = false; //independent of editdata[i].changed
        if (editdata[i].children.length > 0) {
            for (var j = 0; j < editdata[i].children.length; j++) {
                editdata[i].children[j].changed = false;
                if ((editdata[i].children[j].type == 'comment') ||(editdata[i].children[j].type == 'desc')) {
                    //Comments and descriptions
                    var value = $('#higherorderfield' + i +'_' + j).val();
                    if (((editdata[i].children[j].value) && (editdata[i].children[j].value != value)) || (!editdata[i].children[j].value)) {
                        if (editdata[i].children[j].value) {
                            editdata[i].children[j].oldvalue =  editdata[i].children[j].value;
                        } else {
                            editdata[i].children[j].oldvalue = null;
                        }
                        editdata[i].children[j].value = value;
                        editdata[i].children[j].changed = true;
                        editdata[i].higherorderchanged = true;
                    }
                } else if (editdata[i].children[j].type == 'feat') {
                    //Features
                    var subset = $('#higherorderfield_subset_' + i +'_' + j).val();
                    var cls = $('#higherorderfield_' + i +'_' + j).val();


                    //has the subset been changed OR has the class been changed?
                    if ((((editdata[i].children[j].subset) && (editdata[i].children[j].subset != subset)) || (!editdata[i].children[j].subset)) ||
                       (((editdata[i].children[j].class) && (editdata[i].children[j].class != cls)) || (!editdata[i].children[j].class))) {

                        //remember old values (null if new)
                        if (editdata[i].children[j].subset) {
                            editdata[i].children[j].oldsubset =  editdata[i].children[j].subset;
                        } else {
                            editdata[i].children[j].oldsubset = null;
                        }
                        if (editdata[i].children[j].class) {
                            editdata[i].children[j].oldclass =  editdata[i].children[j].class;
                        } else {
                            editdata[i].children[j].oldclass = null;
                        }

                        editdata[i].children[j].subset = subset;
                        editdata[i].children[j].class = cls;
                        editdata[i].children[j].changed = true;
                        editdata[i].higherorderchanged = true;
                    }
                } else if (folia_isspanrole(editdata[i].children[j].type)) {
                    //Span roles: detect changes in span, and set the changed flag
                    if ( (!editdata[i].children[j].targets_begin) || (JSON.stringify(editdata[i].children[j].targets) != JSON.stringify(editdata[i].children[j].targets_begin) )) {
                        editdata[i].children[j].changed = true;
                        editdata[i].higherorderchanged = true;
                    }
                }
            }

        }
        if (editdata[i].higherorderchanged) changes = true;

        if (editdata[i].changed) {
            if (editdata[i].editform == 'correction') {
                //editdata[i].editform = 'correction';
                editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val().trim();
                editdata[i].correctionset = $('#editformcorrectionset').val().trim();
                if (!editdata[i].correctionclass) {
                    throw "Error (" + i + "): Annotation " + editdata[i].type + " was changed and submitted as correction, but no correction class was entered";
                }
            }
            if (editdata[i].type == 't') {
                if ((editdata[i].text.indexOf(' ') > 0) && (structure[editedelementid].type == 'w'))  {
                    //there is a space in a token! This can mean a number
                    //of things

                    //Is the leftmost word the same as the original word?
                    //Then the user wants to do an insertion to the right
                    if (editdata[i].text.substr(0,editdata[i].oldtext.length+1) == editdata[i].oldtext + ' ') {
                        editdata[i].insertright = editdata[i].text.substr(editdata[i].oldtext.length+1);
                        editdata[i].text = editdata[i].oldtext;
                    //Is the rightmost word the same as the original word?
                    //Then the user wants to do an insertion to the left
                    } else if (editdata[i].text.substr(editdata[i].text.length -  editdata[i].oldtext.length - 1, editdata[i].oldtext.length + 1) == ' ' + editdata[i].oldtext)  {
                        editdata[i].insertleft = editdata[i].text.substr(0,editdata[i].text.length - editdata[i].oldtext.length - 1);
                        editdata[i].text = editdata[i].oldtext;
                    } else {
                        //Words are different? than the user may want to split
                        //the original token into new ones:
                        //
                        //ask user if he wants to split the token into two
                        if (namespace == "testflat") {
                            editdata[i].dosplit = true; //no need to task for confirmation in test mode
                        } else {
                            editdata[i].dosplit = confirm("A space was entered for the token text. This will imply the tokens will be split into two new ones. Annotations pertaining to the original words will have to reentered for the new tokens. Continue with the split? Otherwise the token will remain one but contain a space.");
                        }

                    }

                }
            }
        }

        if ((editdata[i].changed) || (editdata[i].correctionclasschanged)) {

            changes = true;

            if (editdata[i].new) editdata[i].editform = "new";

            editdata[i].isspan = folia_isspan(editdata[i].type); //are we manipulating a span annotation element?

            //sort targets in proper order
            if (editdata[i].targets.length > 1) {
                editdata[i].targets = sort_targets(editdata[i].targets);
            } else if (editdata[i].targets.length === 0) {
                //annotation has no targets, this may be a span annotation that
                //relies purely on span roles, find the implicit targets (i.e.
                //the scope)
                if ((editdata[i].isspan) && (editdata[i].children.length > 0)) {
                    var match = {}; //will hold spanrole_type => bool
                    editdata[i].scope = [];
                    for (var j = 0; j < editdata[i].children.length; j++) {
                        if (editdata[i].children[j].targets) {
                            for (var k = 0; k < editdata[i].children[j].targets.length; k++) {
                                editdata[i].scope.push(editdata[i].children[j].targets[k]);
                                match[editdata[i].children[j].type] = true;
                            }
                        }
                    }
                    var required_spanroles = folia_required_spanroles(editdata[i].type);
                    for (var j = 0; j < required_spanroles.length; j++) {
                        if (!match[required_spanroles[j]]) {
                            throw "Error (" + i + "): Annotation of " + editdata[i].type + " incomplete, span role " + required_spanroles[j] + " has no targets defined";
                        }
                    }
                    editdata[i].scope = sort_targets(editdata[i].scope);
                } else {
                    throw "Error (" + i + "), no targets for action";
                }
            }
        }

    }

    //second iteration, process parent spans:
    //if a span annotation has targets x y z and its parentspan has targets u w v x y z, then remove x y z from the parentspan targets
    for (var i = 0; i < editfields;i++) {
        if (editdata[i].parentspan) {
            for (var j = 0; j < editfields;j++) {
                if (editdata[j].id == editdata[i].parentspan) {
                    //i is the childspan, j is the parentspan:
                    //
                    var newtargets = [];
                    for (var k = 0; k < editdata[j].targets.length; k++) {
                        if (editdata[i].targets.indexOf(editdata[j].targets[k]) == -1) { //not found in child, good
                            newtargets.push(editdata[j].targets[k]);
                        }
                    }
                    if (newtargets.length !== editdata[j].targets.length) {
                        editdata[j].targets = newtargets;
                        editdata[j].changed = true;
                        editdata[j].respan = true;
                        editdata[j].editform = "direct";
                        changes = true;
                    }
                    break;
                }
            }
        }
    }
    return changes;
}


function build_queries(addtoqueue) {
    /* Formulate FQL queries for all changes in the editdata structure */
    var queries = [];
    var useclause;
    if ((namespace == "testflat") && (docid != "manual")) {
        useclause = "USE testflat/" + testname;
    } else {
        useclause = "USE " + namespace + "/" + docid;
    }

    //gather edits that changed, and sort targets
    sentdata = []; //will be used in repeatmode
    for (var i = 0; i < editfields;i++) {  //jshint ignore:line
        if ((editdata[i].changed) || (editdata[i].correctionclasschanged)) {

            sentdata.push(editdata[i]);

            //compose query
            var action = "";
            var returntype = "target";
            var query = useclause + " ";
            var higherorder_subqueries_done = false;
            if (editdata[i].isspan) {
                if (editdata[i].id) {
                    returntype = "ancestor-focus";
                } else {
                    returntype = "ancestor-target";
                }
            }
            if ((editdata[i].correctionclasschanged) && (!editdata[i].respan)) {
                //TODO: this will change ALL corrections under the element, too generic
                action = "EDIT";
                query += "EDIT correction OF " + editdata[i].correctionset + " WITH class \"" + editdata[i].correctionclass  + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                returntype = "ancestor-focus";
                //set target expression
                if (editdata[i].targets.length > 0) {
                    query += " IN";
                    var forids = ""; //jshint ignore:line
                    editdata[i].targets.forEach(function(t){
                        if (forids) {
                            forids += " ,";
                        }
                        forids += " ID " + t;
                    });
                    query += forids;
                }
            } else if ((editdata[i].type == "t") && (editdata[i].text === "")) {
                if (editdata[i].editform == "new") continue;
                //deletion of text implies deletion of word
                if (editdata[i].targets.length > 1) {
                    editor_error("Can't delete multiple words at once");
                    return;
                }
                action = "DELETE";
                query += "DELETE w ID " + editdata[i].targets[0];
                if (editdata[i].editform == "correction") {
                    query += " (AS CORRECTION OF " + editdata[i].correctionset + " WITH class \"" + editdata[i].correctionclass + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence + ")";
                }
                returntype = "ancestor-focus";
            } else {
                if ((editdata[i].editform == "new")) {
                    action = "ADD";
                    if (editdata[i].class === "") continue;
                } else if (editdata[i].class === "") {
                    //deletion
                    action = "DELETE";
                    returntype = "ancestor-focus";
                } else if ((editdata[i].type == "t") && (editdata[i].text !== "")) {
                    if (editdata[i].insertleft) {
                        returntype = "ancestor-focus";
                        if (editsuggestinsertion) {
                            action = "SUBSTITUTE"; //substitute the correction for suggestion
                        } else {
                            action = "PREPEND";
                        }
                    } else if (editdata[i].insertright) {
                        returntype = "ancestor-focus";
                        if (editsuggestinsertion) {
                            action = "SUBSTITUTE"; //substitute the correction for suggestion
                        } else {
                            action = "APPEND";
                        }
                    } else if (editdata[i].dosplit) {
                        returntype = "ancestor-focus";
                        action = "SUBSTITUTE";
                    } else if (editdata[i].targets.length > 1) { //merge
                        returntype = "ancestor-focus";
                        action = "SUBSTITUTE";
                    } else {
                        action = "EDIT";
                    }
                } else {
                    action = "EDIT";
                }
                if (action != "SUBSTITUTE") {
                    query += action;
                    if (editdata[i].insertright) { //APPEND (insertion)
                        query += " w";
                        if ((editdata[i].type == "t") && (editdata[i].insertright !== "")) {
                            query += " WITH text \"" + escape_fql_value(editdata[i].insertright) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        }
                    } else if (editdata[i].insertleft) { //PREPEND (insertion)
                        query += " w";
                        if ((editdata[i].type == "t") && (editdata[i].insertleft !== "")) {
                            query += " WITH text \"" + escape_fql_value(editdata[i].insertleft) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        }
                    } else { //normal behaviour
                        query += " " +editdata[i].type;
                        if ((editdata[i].id) && ( editdata[i].editform != "new") && (editdata[i].id != "undefined")) {
                            query += " ID " + editdata[i].id;
                        } else if ((editdata[i].set)  && (editdata[i].set != "undefined")) {
                            query += " OF " + editdata[i].set;
                        }
                        if ((editdata[i].type == "t") && (editdata[i].text !== "")) {
                            query += " WITH text \"" + escape_fql_value(editdata[i].text) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        } else if ((editdata[i].type == "ph") && (editdata[i].text !== "")) {
                            query += " WITH phon \"" + escape_fql_value(editdata[i].text) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        } else if (editdata[i].class !== "") {
                            //no deletion
                            query += " WITH class \"" + escape_fql_value(editdata[i].class) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        }
                    }
                } else { //substitute
                    if (editdata[i].insertright) { //insertright as substitute
                        query += "SUBSTITUTE w";
                        if ((editdata[i].type == "t") && (editdata[i].insertright !== "")) {
                            query += " WITH text \"" + escape_fql_value(editdata[i].insertright) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        }
                    } else if (editdata[i].insertleft) { //insertleft as substitue
                        query += "SUBSTITUTE w";
                        if ((editdata[i].type == "t") && (editdata[i].insertleft !== "")) {
                            query += " WITH text \"" + escape_fql_value(editdata[i].insertleft) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence;
                        }
                    } if (editdata[i].dosplit) {
                        parts = editdata[i].text.split(" ");
                        for (var j = 0; j < parts.length; j++) { //SPLIT
                            if (j > 0) query += " ";
                            query += "SUBSTITUTE w WITH text \"" + escape_fql_value(parts[j]) + "\"";
                        }
                    } else if (editdata[i].targets.length > 1) { //MERGE
                        query += "SUBSTITUTE w WITH text \"" + escape_fql_value(editdata[i].text) + "\"";
                    }
                }
                if ((editdata[i].respan) && (action != "SUBSTITUTE")) { //isspan && editdata[i].id && (action == "EDIT")) {
                    //we edit a span annotation, edittargets reflects the new span:
                    if (editdata[i].targets.length > 0) {
                        query += " RESPAN ";
                        var forids = "";
                        editdata[i].targets.forEach(function(t){
                            if (forids) {
                                    forids += " &";
                            }
                            forids += " ID " + t;
                        });
                        query += forids;
                    }
                    returntype = "ancestor-focus";
                } else if (action == "SUBSTIUTE") {
                    editdata[i].respan = false;
                }


                //set AS expression
                if ((editdata[i].editform == "correction") && ((!editdata[i].correctionclasschanged) || (editdata[i].respan))) {
                    query += " (AS CORRECTION OF " + editdata[i].correctionset + " WITH class \"" + escape_fql_value(editdata[i].correctionclass) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now confidence " + editdata[i].confidence + ")";
                } else if (editdata[i].editform == "alternative") {
                    query += " (AS ALTERNATIVE)";
                }

                if ((editdata[i].isspan) && (action == "ADD") && (editdata[i].targets.length == 0)) {
                    //we are adding a span annotation without targets, we
                    //use a special trick to get it right by formulating
                    //an FQL query like: ADD .... RESPAN NONE FOR SPAN ID ..
                    //This ensures the span is added at the proper level in
                    //the FoLiA tree, but immediately respans it to be empty
                    query += " RESPAN NONE ";
                }

                if ((action == "ADD") && (editdata[i].higherorderchanged)) {
                    //process higher order queries as subqueries
                    if ((query.length > 0) && (query[query.length-1] != " ")) query += " ";
                    query += build_higherorder_queries(editdata[i], useclause, true);
                    higherorder_subqueries_done = true;
                }

                if (editsuggestinsertion) {
                    query += " FOR SPAN ID \"" + editsuggestinsertion + "\"";
                } else if (!( (editdata[i].isspan && editdata[i].id && (action == "EDIT")) )) { //only if we're not editing an existing span annotation
                    //set target expression
                    if (editdata[i].targets.length > 0) {
                        var forids = ""; //jshint ignore:line
                        editdata[i].targets.forEach(function(t){
                            if (forids) {
                                if ((action == "SUBSTITUTE") || (editdata[i].isspan)) {
                                    forids += " &";
                                } else {
                                    forids += " ,";
                                }
                            }
                            forids += " ID " + t;
                            if (addtoqueue) {
                                //elements are queued for later submission, highlight them
                                $('#' + valid(t)).addClass('queued');
                            }
                        });
                        if (!editdata[i].parentspan) {
                            //normal behaviour
                            query += " FOR";
                            if ((action == "SUBSTITUTE") || (editdata[i].isspan)) query += " SPAN";
                            query += forids;
                        } else if ((editdata[i].parentspan) && (action == "ADD")) {
                            //span element is nested within another
                            //
                            query += " SPAN " + forids;
                            query += " FOR ID " + editdata[i].parentspan;

                            //wrefs from the parent span that are part of the child now have to be removed from the parent
                            //this has been taken into account in gather_changes() already
                            //the parentspan span has been adapted accordingly
                        }
                    } else if ((editdata[i].isspan) && (action == "ADD")) {
                        //we are adding a span annotation without targets, use
                        //scope instead (using ADD.. RESPAN NONE FOR SPAN ID ..
                        //trick)
                        var forids = ""; //jshint ignore:line
                        editdata[i].scope.forEach(function(t){
                            if (forids) {
                                forids += " &";
                            }
                            forids += " ID " + t;
                            if (addtoqueue) {
                                //elements are queued for later submission, highlight them
                                $('#' + valid(t)).addClass('queued');
                            }
                        });
                        //process higher order queries as subqueries
                        query += " FOR SPAN " + forids;
                    }
                }

            }
            //set format and return type
            query += " FORMAT flat RETURN " + returntype;

            //add to queries
            queries.push(query);

        }

        //Process higher order annotations (if main action isn't a deletion and
        //if we didn't already process them as subqueries)
        if ((editdata[i].higherorderchanged) && (!higherorder_subqueries_done) && !(((editdata[i].type == "t") && (editdata[i].text === "")) ||((editdata[i].type != "t") && (editdata[i].class === "")))) { //not-clause checks if main action wasn't a deletion, in which case we needn't bother with higher annotations at all
            queries = queries.concat(build_higherorder_queries(editdata[i], useclause));
        }
    }
    return queries;
}

function build_higherorder_queries(edititem, useclause, build_subqueries) {
    /* Builds FQL queries for higher order annotations (including span roles),
     * called by build_queries() per item */
    var queries = [];
    for (var j = 0; j < edititem.children.length; j++) {
        if (edititem.children[j].changed) {
            var targetselector;
            var query;
            var returntype = "ancestor-focus";
            if (build_subqueries) {
                targetselector = "";
            } else if ((edititem.id === undefined) || (edititem.id == "undefined")) {
                //undefined ID, means parent annotation is new as well, select it by value:
                targetselector = " FOR " + build_parentselector_query(edititem);
            } else {
                targetselector = " FOR ID \"" + edititem.id + "\"";
            }
            if ((edititem.children[j].type == 'comment') ||(edititem.children[j].type == 'desc')) {
                //formulate query for comments and descriptions
                if (edititem.children[j].oldvalue) {
                    if (edititem.children[j].value) {
                        //edit
                        query = "EDIT " + edititem.children[j].type + " WHERE text = \"" + escape_fql_value(edititem.children[j].oldvalue) + "\" WITH text \"" + escape_fql_value(edititem.children[j].value) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now " + targetselector;
                    } else {
                        //delete
                        returntype = "ancestor-target";
                        query = "DELETE " + edititem.children[j].type + " WHERE text = \"" + escape_fql_value(edititem.children[j].oldvalue) + "\" " + targetselector;
                    }
                } else if (edititem.children[j].value !== "") {
                    //add
                    query = "ADD " + edititem.children[j].type + " WITH text \"" + escape_fql_value(edititem.children[j].value) + "\" annotator \"" + escape_fql_value(username) + "\" annotatortype \"manual\" datetime now " + targetselector;
                }
            } else if ((edititem.children[j].type == 'feat')) {
                //formulate query for features
                if ((edititem.children[j].oldclass)  && (edititem.children[j].oldsubset) && ( (!edititem.children[j].class) || (!edititem.children[j].subset))) {
                    //deletion
                    returntype = "ancestor-target";
                    query = "DELETE " + edititem.children[j].type + " WHERE subset = \"" + escape_fql_value(edititem.children[j].oldsubset) + "\" AND class = \"" + escape_fql_value(edititem.children[j].oldclass) + "\" " + targetselector;
                } else if ((!edititem.children[j].oldclass) && (!edititem.children[j].oldsubset)) {
                    //add
                    if (edititem.id !== undefined) {
                        query = "ADD " + edititem.children[j].type + " WITH subset \"" + escape_fql_value(edititem.children[j].subset) + "\" class \"" + escape_fql_value(edititem.children[j].class) + "\" " + targetselector;
                    } else {
                        //undefined ID, means parent annotation is new as well, select it by value:
                        query = "ADD " + edititem.children[j].type + " WITH subset \"" + escape_fql_value(edititem.children[j].subset) + "\" class \"" + escape_fql_value(edititem.children[j].class) + "\" " + targetselector;
                    }
                } else if ((edititem.children[j].oldclass) && (edititem.children[j].oldclass != edititem.children[j].class) && (edititem.children[j].oldsubset == edititem.children[j].subset)) {
                    //edit of class
                    query = "EDIT " + edititem.children[j].type + " WHERE subset = \"" + escape_fql_value(edititem.children[j].subset) + "\" AND class = \"" + escape_fql_value(edititem.children[j].oldclass) + "\"  WITH class \"" + escape_fql_value(edititem.children[j].class) + "\" " + targetselector;
                } else if ((edititem.children[j].oldsubset) && (edititem.children[j].oldsubset != edititem.children[j].subset) && (edititem.children[j].oldclass == edititem.children[j].class)) {
                    //edit of subset
                    query = "EDIT " + edititem.children[j].type + " WHERE subset = \"" + escape_fql_value(edititem.children[j].oldsubset) + "\" AND class = \"" + escape_fql_value(edititem.children[j].class) + "\"  WITH subset \"" + escape_fql_value(edititem.children[j].subset) + "\" " + targetselector;
                } else {
                    //edit of class and subset
                    query = "EDIT " + edititem.children[j].type + " WHERE subset = \"" + escape_fql_value(edititem.children[j].oldsubset) + "\" AND class = \"" + escape_fql_value(edititem.children[j].oldclass) + "\"  WITH subset \"" + escape_fql_value(edititem.children[j].subset) + "\" class \"" + escape_fql_value(edititem.children[j].class) + "\" " + targetselector;
                }
            } else if ((folia_isspanrole(edititem.children[j].type))) {
                //formulate query for span roles
                //foliadocserve adds IDs to all span roles
                if ((edititem.children[j].targets_begin) && (edititem.children[j].targets_begin.length > 0) && (edititem.children[j].targets.length === 0)) {
                    //deletion
                    returntype = "ancestor-target";
                    query = "DELETE " + edititem.children[j].type + " ID \"" + edititem.children[j].id  + "\" " + targetselector;
                } else {
                    //add or edit
                    var forids = "";
                    if (edititem.children[j].targets.length > 0) {
                        sort_targets(edititem.children[j].targets).forEach(function(t){
                            if (forids) {
                                    forids += " &";
                            }
                            forids += " ID " + t;
                        });
                    }
                    if ((edititem.children[j].targets_begin.length === 0) && (edititem.children[j].targets.length > 0)) {
                        //new
                        query = "ADD " + edititem.children[j].type + " ID \"" + edititem.children[j].id  + "\" SPAN " + forids + " " + targetselector;
                    } else {
                        //edit (span change)
                        query = "EDIT " + edititem.children[j].type + " ID \"" + edititem.children[j].id  + "\" SPAN " + forids + " " + targetselector;
                    }
                }
            }
            if (build_subqueries) {
                queries.push("(" + query.trim() + ")");
            } else {
                queries.push(useclause + " " + query + " FORMAT flat RETURN " + returntype);
            }

        }
    }

    if (build_subqueries) {
        return queries.join(" ");
    } else {
        return queries;
    }
}


function editor_submit(addtoqueue) {
    /* Submit the annotations prepared in the editor dialog */

    //If addtoqueue is set, the annotation will not be performed yet but added to a queue (the console window), for later submission
    if (arguments.length === 0) {
        addtoqueue = false;
    }

    var changes;
    var queries;
    try {
        //See if there are any changes in the values: did the user do something and do we have to prepare a query for the backend?
        changes = gather_changes();

        //Build all the queries based on the gathered changes (in editdata)
        queries = build_queries(addtoqueue);
    } catch (errormsg) {
        editor_error(errormsg);
        return false;
    }

    //queries are to be sent to the backend
    if ((addtoqueue) || ($('#openinconsole').prop('checked'))) {
        //Add-to-queue or delegate-to-console is selected (same thing, different route)
        var queuedqueries = $('#queryinput').val();
        if (queuedqueries !== "") queuedqueries = queuedqueries + "\n";
        $('#queryinput').val(queuedqueries + queries.join("\n")); //add query to query input in console
        update_queue_info(); //updates the interface to inform the user of the state of the queue and adds submit queue button
    }

    if ($('#openinconsole').prop('checked')) {
        //delegate-to-console is selected, we are done and can close the editor and open the console
        if (queries.length === 0) {
            notice("No changes");
        } else {
            notice("Queued (" + queries.length + ")");
        }
        closeeditor();
        openconsole();
        if (namespace == "testflat") editor_error("Delegating to console not supported by tests");
        return false;
    } else if (addtoqueue) {
        //add to queue selected, just close editor
        if (queries.length === 0) {
            notice("No changes");
        } else {
            notice("Queued (" + queries.length + ")");
        }
        closeeditor();
        return false;
    } else if ((queries.length === 0)) {
        //discard, nothing changed
        notice("No changes");
        closeeditor();
        if (namespace == "testflat") editor_error("No queries were formulated");
        return false;
    }

    //==========================================================================================
    //Queries are submitted now

    notice("Submitting (" + queries.length + ")");
    $('#wait span.msg').val("Submitting edits");
    $('#wait').show();

    var url;
    if (namespace == "pub") {
        url = "/pub/" + configuration_id + "/"+ docid + "/query/";
    } else {
        url = "/" + namespace + "/"+ docid + "/query/";
    }

    if ((namespace != "testflat") || (docid == "manual")) {  //tests will be handled by different ajax submission
        //submit queries
        $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            //processData: false,
            headers: {'X-sessionid': sid },
            data: JSON.stringify( { 'queries': queries}),
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    notice("Error");
                    editor_error("Received error from document server: " + data.error);
                } else {
                    editfields = 0;
                    closeeditor();
                    notice("Submitted");
                    update(data);
                    $('#saveversion').show();
                }
            },
            error: function(req,err,exception) {
                $('#wait').hide();
                notice("Error");
                editor_error("Editor submission failed: " + req.responseText);
            },
            dataType: "json"
        });
    } else {
        testbackend(docid, username, sid, queries);
    }
}

function build_parentselector_query(edititem) {
    //formulate a parentselector query (a partial query actually for an FQL FOR
    //statement) that selects the annotation that is to
    //become the parent of the higher order annotation
    //This is used when the parent annotation can not be selected by ID,
    //because it is newly added (i.e. the query has been formulated but not actually added yet)
    //called from editor_submit()
    //
    var parentselector = edititem.type;
    if ((edititem.id) && ( edititem.editform != "new")) {
        parentselector += " ID " + edititem.id;
    } else if ((edititem.set)  && (edititem.set != "undefined")) {
        parentselector += " OF " + edititem.set;
    }
    if ((edititem.type == "t") && (edititem.text !== "")) {
        parentselector += " WHERE text = \"" + escape_fql_value(edititem.text) + "\"";
    } else if (edititem.class !== "") {
        //no deletion
        parentselector += " WHERE class = \"" + escape_fql_value(edititem.class) + "\"";
    }
    if (edititem.targets.length > 0) {
        parentselector += " FOR";
        var forids = ""; //jshint ignore:line
        edititem.targets.forEach(function(t){
            forids += " ID " + t;
            return; //only one should be enough
        });
        parentselector += forids;
    }
    return parentselector;
}

function console_submit(savefunction) {
    /* Submit the queries in the query console (i.e. the queue) */
    var queries = $('#queryinput').val().split("\n");
    if ((queries.length === 1) && (queries[0] === "")) {
        notice("No changes");
        closeeditor();
        if (arguments.length === 1) savefunction();
        return;
    }

    $('#wait span.msg').val("Executing query and obtaining results");
    $('#wait').show();

    var url;
    if (namespace == "pub") {
        url = "/pub/" + configuration_id + "/"+ docid + "/query/";
    } else {
        url = "/" + namespace + "/"+ docid + "/query/";
    }

    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        //processData: false,
        headers: {'X-sessionid': sid },
        data: JSON.stringify( { 'queries': queries}),
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                notice("Error");
                editor_error("Received error from document server whilst submitting queued queries: " + data.error);
            } else {
                $('.queued').removeClass('queued');
                $('#queryinput').val("");
                editfields = 0;
                closeeditor();
                notice("Submitted");
                update_queue_info();
                update(data); //will unhide the wait shroud
                if (arguments.length === 1) {
                    savefunction();
                } else {
                    $('#saveversion').show();
                }
            }
        },
        error: function(req,err,exception) {
            $('#wait').hide();
            notice("Error");
            editor_error("Query failed: " + err + " " + exception + ": " + req.responseText);
        },
        dataType: "json"
    });
}


function saveversion() {
    /* Trigger a version save, propagates to the git backend */
    $('#wait span.msg').val("Saving version");
    $('#wait').show();
    $.ajax({
        type: 'GET',
        url: "/editor/" + namespace + "/"+ docid + "/save/",
        contentType: "application/json",
        headers: {'X-sessionid': sid },
        data: {'message': $('#versionlabel').val() },
        success: function(data) {
            $('#wait').hide();
            notice("Saved");
            $('#saveversion').hide();
        },
        error: function(req,err,exception) {
            $('#wait').hide();
            notice("Error");
            editor_error("save failed: " + req.responseText);
        },
        dataType: "json"
    });
}

function editor_oninit() {
    viewer_oninit();

    editor_loadmenus();
    $('#editordiscard').click(function(){
        repeat = false; //discarding the editor manually closes repeat-mode
        closeeditor();
    });
    $('#newdeclarationdiscard').click(function(){
        $('#newdeclaration').hide();
    });
    $('#historydiscard').click(function(){
        $('#history').hide();
    });
    $('#consolediscard').click(function(){
        $('#console').hide();
        update_queue_info();
    });

    $('#editorselecttarget').click(function(){
        //toggle coselector (select multiple)
        if (coselector) {
            coselector = false;
            $(this).removeClass("selectoron");
        } else {
            coselector = true;
            $(this).addClass("selectoron");
        }
    });
    $('#main').click(function(){
        if (editoropen) {
            closeeditor();
        }
    });


    var l = [];
    folia_annotationlist().forEach(function(annotationtype){
        var foliaelement = foliaelements[folia_elementclass(annotationtype)];
        if ((foliaelement.properties.primaryelement !== false) && (annotationtype != "t") && (annotationtype != "ph") && (foliaspec.annotationtype.indexOf(foliaelement.properties.annotationtype) != -1)) {
                l.push("<option value=\"" + annotationtype + "\">" + folia_label(annotationtype) + "</option>");
        }
    });
    var s = "";
    l.sort();
    l.forEach(function(e){s=s+e;});
    $('#newdeclarationannotationtype').html(s);


    $('#editoraddfield').click(function(){
        var index = $('#editoraddablefields').val();
        addeditorfield(index);
    });

    editforms.direct = configuration.editformdirect;
    editforms.correction = configuration.editformcorrection;
    editforms.alternative = configuration.editformalternative;
    editforms.new = configuration.editformnew;
    editconfidence = (configuration.allowconfidence === true); //allow setting/editing confidence?
    if (editconfidence) {
        $('#toggleeditconfidence').addClass('on');
    }


    Object.keys(editforms).forEach(function(editform){
        if (editforms[editform]) $('#editform' + editform).addClass('on');
    });
    s = "";
    Object.keys(declarations).forEach(function(annotationtype){
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if (annotationtype == "correction") {
                if (s) {
                    if (initialcorrectionset == set) {
                        s = s + "<option value=\"" + set + "\" selected=\"selected\">" + shorten(set) + "</option>";
                    } else {
                        s = s + "<option value=\"" + set + "\">" + shorten(set) + "</option>";
                    }
                } else {
                    if (!initialcorrectionset) {
                        s = "<option value=\"" + set + "\" selected=\"selected\">" + shorten(set) + "</option>";
                    } else {
                        s = "<option value=\"" + set + "\">" + shorten(set) + "</option>";
                    }
                }
            }
        });
    });
    $('#editformcorrectionset').html(s);
    if (editforms.correction) $('#editformcorrectionsetselector').show();

    $('#editorsubmit').click(function(){
        if ($('#queuemode').prop('checked')) {
            editor_submit(true);
            update_queue_info();
        } else {
            editor_submit(false);
        }
        if ($('#repeatmode').prop('checked')) {
            repeatmode = true;
        } else {
            repeatmode = false;
        }
    });

    $('#newdeclarationsubmit').click(function(){
        $('#wait').show();
        var url;
        if (namespace == "pub") {
            url = "/pub/" + configuration_id + "/"+ docid + "/query/";
        } else {
            url = "/" + namespace + "/"+ docid + "/query/";
        }
        queries = [];
        queries.push('USE ' + namespace + "/" + docid + " DECLARE " + $('#newdeclarationannotationtype').val() + " OF " + $('#newdeclarationset').val());
        $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            //processData: false,
            headers: {'X-sessionid': sid },
            data: JSON.stringify( { 'queries': queries}),
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    editor_error("Received error from document server: " + data.error);
                } else {
                    location.reload(); //just reload the entire page for now
                    $('#wait').hide();
                }
            },
            error: function(req,err,exception) {
                $('#wait').hide();
                $('#newdeclaration').hide();
                editor_error("Declaration failed: " + req.responseText);
            },
            dataType: "json"
        });
    });

    $('#consolesubmit').click(console_submit);
    $('#submitqueue').hide();
    $('#submitqueue').click(console_submit);


    $('#savebutton').click(function(){
        console_submit(saveversion); //will submit the queue and save (if there's no queue, it will just save)
    });

}
