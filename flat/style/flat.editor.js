var editannotations = {};
var editoropen = false;
var coselector = -1; //disabled
var editforms = {'direct': true, 'correction': false,'alternative': false, 'new': true} ;
var editedelementid = null;
var editfields = 0;
var editsuggestinsertion = null; //will hold a correction ID if a suggestion for insertion is accepted
var repeatmode = false;
var sentdata = []; //list of the last submitted edits (js objects, pre-fql)


function toggleeditform(editform) {
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
    editannotations[annotationtype+"/"+set] = !editannotations[annotationtype+"/"+set];
    if (editannotations[annotationtype+"/" + set]) {
        $('#annotationtypeedit_' + annotationtype + "_" + hash(set)).addClass('on');
    } else {
        $('#annotationtypeedit_' + annotationtype + "_" + hash(set)).removeClass('on');
    }
}

function select(element) {
    //toggles selection of an element (coselector)
    var found = false;
    var index = 0;
    for (var i = 0; i < editdata[coselector].targets.length; i++) {
        if (editdata[coselector].targets[i] == element.id) {
            index = i;
            found = true;
            break;
        }
    }
    if (found) {
        editdata[coselector].targets.splice(index, 1);
        $(element).removeClass("selected");
    } else { 
        editdata[coselector].targets.push( element.id);
        $(element).addClass("selected");
    }
}

function setaddablefields() {
    //Adds a selector in the editor for adding extra annotation types to an element (must be previously declared, $('#newdeclarationsubmit').click())
    //To actually add the field to the form, addeditorfield(i) is called, each addable field has a sequencenumber as ID
    //
    editoraddablefields_options = "";
    editoraddablefields = [];
    Object.keys(declarations).forEach(function(annotationtype){
        label = getannotationtypename(annotationtype);
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if ((annotationtype != "correction") && (viewannotations[annotationtype + "/" + set])) {
                setname = shorten(set);
                //check if it already exists
                found = false;
                editdata.forEach(function(editdataitem){
                    if ((editdataitem.type == annotationtype) && (editdataitem.set == set)) {
                        found = true; 
                        return true;
                    }
                });
                if (!found) {
                    editoraddablefields_options = editoraddablefields_options + "<option value=\"" + editoraddablefields.length + "\">" + label + " -- <span class=\"setname\">" + setname + "</span></option>";
                    editoraddablefields.push({'type': annotationtype, 'set': set});
                }
            }
        });
    });
    if (configuration.allowaddfields) {
        //only show if we're allowed to add fields manually
        if ((editoraddablefields_options) && (!annotationfocus)) {
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
            s = s +  "<input type=\"text\" id=\"editform" + editfields + "correctionclass\" class=\"editformcorrectionclass\" placeholder=\"(enter correction class)\" />";
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



function getclassesasoptions(c, selected) {
    //get classes pertaining to a set, from a set definition, as option elements (used in select)
    //supports recursive classes
    var s;
    if (c.id == selected) {
        s = s + "<option selected=\"selected\" value=\"" + c.id + "\">" + c.label + "</option>";
    } else {
        s = s + "<option value=\"" + c.id + "\">" + c.label + "</option>";
    }
    Object.keys(c.subclasses).forEach(function(cid){
        csub = c.subclasses[cid];
        s = s + getclassesasoptions(csub, selected);
    });
    return s;
}

function spanselector_click(){
    var i = parseInt(this.id.substr(12));  //get index ID (we can't reuse i from the larger scope here!!)
    //toggle coselector (select multiple), takes care of
    //switching off any other coselector
    var toggleon = true;
    var j;
    if (coselector > -1) {
        if (coselector == i) toggleon = false; //this is a toggle off action only

        $('#spanselector' + i).removeClass("selectoron");
        //
        //de-highlight all coselected elements
        for (j = 0; j < editdata[coselector].targets.length; j++) {
            $('#' + valid(editdata[coselector].targets[j])).removeClass('selected');
        }
        coselector = -1;
    }
    if (toggleon) {
        coselector = i;

        //highlight all coselected elements
        for (j = 0; j < editdata[coselector].targets.length; j++) {
            $('#' + valid(editdata[coselector].targets[j])).addClass('selected');
        }

        $(this).addClass("selectoron");
    }
}

function applysuggestion(e,i) {
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


function showeditor(element) {
    /* show and populate the editor for a particular element */
    editsuggestinsertion = null;

    var i;
    if ((element) && ($(element).hasClass(view)) && (element.id)) {  //sanity check: is there an element selected?
        if (annotations[element.id]) { //are there annotations for this element? 
            var s = "";
            editoropen = true;
            sethover(element);
            editedelementid = element.id;
            editfields = 0;
            editdata = [];

            //clear current selection
            $('.selected').removeClass('selected');
            $(element).addClass('selected');
            //select(element);

            var annotationfocusfound = false;
            var editformcount = 0;

            //Iterate over all annotations for the selected target element
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                var isannotationfocus = false;
                annotation = annotations[element.id][annotationid];
                if (annotationfocus) {
                    if ((annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)) {
                        //this annotation is corresponds to the annotation focus
                        isannotationfocus = true; //set per-item
                        annotationfocusfound = true; //set only once for all
                    }
                }

                //Is this an annotation we want to show? Is it either in editannotations or is it the annotationfocus?
                if ((annotation.type != "correction") && ((editannotations[annotation.type+"/" + annotation.set]) ||  (isannotationfocus))) {
                    
                    //Get the human-presentable label for the annotation type
                    label = getannotationtypename(annotation.type);
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
                    s = s + "<th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
                    var repeat_preset = false; //is this annotation preset because of repeatmode?
                    if (annotation.type == 't') {
                        //Annotation concerns text content
                        var class_value = annotation.class;
                        if (repeatmode) {
                            class_value = repeatreference.class;
                            if (class_value != annotation.class) { repeat_preset = true; }
                        }
                        var text_value = annotation.text;
                        if (repeatmode) {
                            text_value = repeatreference.text;
                            if (text_value != annotation.text) { repeat_preset = true; }
                        }
                        if (repeatmode) text_value = repeatreference.text;
                        if (annotation.class != "current") {
                            s = s + "Class: <input id=\"editfield" + editfields + "\" value=\"" + class_value + "\"/><br/>Text:";
                        } else {
                            s = s + "<input style=\"display: none\" id=\"editfield" + editfields + "\" value=\"" + class_value + "\"/>";
                        }
                        s = s + "<input id=\"editfield" + editfields + "text\" value=\"" + text_value + "\"/>";
                    } else {
                        //Annotation concerns a class
                        if (annotation.targets.length > 1) {
                            //Annotation spans multiple elements, gather the text of the entire span for presentation:
                            spantext = getspantext(annotation);
                            s  = s + "<span id=\"spantext" + editfields + "\" class=\"text\">" + spantext + "</span>";
                            s  = s + "<br/>";
                        }
                        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type == "closed")) {
                            //Annotation type uses a closed set of options, present a drop-down list
                            s = s + "<select id=\"editfield" + editfields + "\" >";
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
                            var class_value = annotation.class;
                            if (repeatmode) {
                                class_value = repeatreference.class;
                                if (annotation.class != class_value) { repeat_preset = true; }
                            }
                            s = s + "<input id=\"editfield" + editfields + "\" value=\"" + class_value + "\" title=\"Enter a value (class) for this annotation, an empty class will delete it\" />";
                        }
                    }
                    if (repeat_preset) s = s + " <span class=\"repeatnotice\">(preset)</span>";
                    s  = s + "<button id=\"spanselector" + editfields + "\" class=\"spanselector\" title=\"Toggle span selection for this annotation type: click additional words in the text to select or unselect as part of this annotation\">Select span&gt;</button><br />";
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
                            if (corrections[correctionid]) {
                                var correction = corrections[correctionid];
                                correction.suggestions.forEach(function(suggestion){
                                    suggestion.children.forEach(function(child){
                                        if ((child.type == annotation.type) && (child.set == annotation.set)) {
                                            var value;
                                            if (child.type == "t") {
                                                value = child.text;
                                            } else{
                                                value = child.cls;
                                            }
                                            if (suggestions.indexOf(value) == -1) {
                                                suggestions.push(value);
                                                s += "<option value=\"" + value + "|" + correction.class + "\">" + value + "</option>";
                                            }
                                        }
                                    });
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
                    s = s + "</td></tr>";

                    //Set up the data structure for this annotation input, changes in the forms will be reflected back into this (all items are pushed to the editdata list)
                    editfields = editfields + 1; //number of items in editdata, i.e. number of editable annotations in the editor
                    editdataitem = {'type':annotation.type,'set':annotation.set, 'class':annotation.class, 'new': false, 'changed': false };
                    if (annotation.type == 't') editdataitem.text = annotation.text;
                    if (annotation.id) editdataitem.id = annotation.id;

                    //set default edit form (seteditform will be called later to affect the interface)
                    if (configuration.alloweditformcorrection) {
                        editdataitem.editform = 'correction';
                    } else if (configuration.alloweditformdirect) {
                        editdataitem.editform = 'direct';
                    } else {
                        editdataitem.editform = 'alternative';
                    }            

                    //Set the target elements for this annotation (it may concern more than the selected element after all)
                    editdataitem.targets_begin = JSON.parse(JSON.stringify(annotation.targets)); //there are two versions so we can compare if there was a change in span (deep copy, hence the json parse/stringify)
                    editdataitem.targets = JSON.parse(JSON.stringify(annotation.targets)); //only this version will be altered by the interface and passed to the backend (deep copy, hence the json parse/stringify)
                    editdata.push(editdataitem); //add this item

                    if (isannotationfocus) {
                        //highlight other targets if this annotation type is the annotation focus (just mimicks user click)
                        for (var j = 0; j < annotation.targets.length; j++) {
                            $('#' + valid(annotation.targets[j])).addClass('selected');
                        }
                    }

                }
                
            });
            s = s + "<tr id=\"editrowplaceholder\"></tr>";
            idheader = "<div id=\"id\">" + element.id + "</div>";



            //extra fields list, adds a selector in the editor for adding extra annotation types to an element (must be previously declared)
            setaddablefields();

            //render editor
            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);
            $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-200} ); //editor positioning


            if ((annotationfocus) && (!annotationfocusfound)) {
                //the annotation focus has not been found, so no field appears, add one automatically:
                for (i = 0; i < editoraddablefields.length; i++) {
                    if ((editoraddablefields[i].type == annotationfocus.type) && (editoraddablefields[i].set == annotationfocus.set)) {
                        addeditorfield(i);
                        break;
                    }
                }
            }
            if (repeatmode) {
                //process unused elements from sentdata (!sentdata[x].used)
                for (i = 0; i < sentdata.length; i++) {
                    if (!sentdata[i].used) {
                        for (var j = 0; j < editoraddablefields.length; j++) {
                            if ((editoraddablefields[j].type == sentdata[i].type) && (editoraddablefields[j].set == sentdata[i].set)) {
                                addeditorfield(j);
                                break;
                            }
                        }
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
            for (i = 0; i < editfields;i++){
                //propagate editform to interface, for each field
                seteditform(i, editdata[i].editform);

                //sort options in down-lists alphabetically
                $('select#editfield'+i).sortOptions();

                //Enable the span selector button
                $('#spanselector' + i).off(); //prevent duplicates
                $('#spanselector' + i).click(spanselector_click);

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
    //add a new field to the editor, populated by setaddablefields() 
    if (annotationtypenames[editoraddablefields[index].type]) {
        label = annotationtypenames[editoraddablefields[index].type];
    } else {
        label = editoraddablefields[index].type;
    }
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

    s = "";
    if ((annotationfocus) && (annotationfocus.type == editoraddablefields[index].type) && (annotationfocus.set == editoraddablefields[index].set)) {
        s = s + "<tr class=\"focus\">";
    } else {
        s = s + "<tr>";
    }
    s =  s + "<th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
    if ((setdefinitions[editoraddablefields[index].set]) && (setdefinitions[editoraddablefields[index].set].type == "closed")) {
        //drop-down field
        s = s + "<select id=\"editfield" + editfields + "\">";
        var selected_option;
        if ((!repeatmode) || (repeatreference === null) || (repeatreference.class === "")) {
            s = s + "<option selected=\"selected\" value=\"\"></option>";
            selected_option = "";
        } else {
            s = s + "<option value=\"\"></option>";
            selected_option = repeatreference.class;
        }
        setdefinitions[editoraddablefields[index].set].classorder.forEach(function(cid){
            c = setdefinitions[editoraddablefields[index].set].classes[cid];
            s = s + getclassesasoptions(c, selected_option); // will add to s
        });
        s = s + "</select>";
    } else {
        //text-field
        s = s + "<input id=\"editfield" + editfields + "\" value=\"\"/>";
    }
    if (repeatmode) s = s + " <span class=\"repeatnotice\">(preset)</span>";
    s = s + "<button id=\"spanselector" + editfields + "\" class=\"spanselector\" title=\"Toggle span selection for this annotation type: click additional words in the text to select or unselect as part of this annotation\">Select span&gt;</button><br />";
    s = s + "</td></tr><tr id=\"editrowplaceholder\"></tr>";
    $('#editrowplaceholder')[0].outerHTML = s;

    $('#spanselector' + editfields).off(); //prevent duplicates
    $('#spanselector' + editfields).click(spanselector_click);

    editfields = editfields + 1; //increment after adding
    editdataitem = {'type':editoraddablefields[index].type,'set':editoraddablefields[index].set, 'targets': [editedelementid] , 'targets_begin': [editedelementid], 'class':'', 'new': true, 'changed': true };
    editdata.push(editdataitem);
    setaddablefields();
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
            editor_error("Unable to revert");
        },
        dataType: "json"
    });

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

function declare() {
    /* Presents the dialog window to declare a new annotation type */
    $('#newdeclaration').show();
    $('#newdeclaration').draggable();
}

function editor_loadmenus() {
    s = "";
    Object.keys(declarations).forEach(function(annotationtype){
      Object.keys(declarations[annotationtype]).forEach(function(set){
        if ((configuration.allowededitannotations === true) || (configuration.allowededitannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.allowededitannotations.indexOf(annotationtype) != -1)) {
            if ((configuration.initialeditannotations === true) || (configuration.initialeditannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.initialeditannotations.indexOf(annotationtype) != -1)) {
                editannotations[annotationtype + "/" + set] = true;
            }
            label = getannotationtypename(annotationtype);
            s = s +  "<li id=\"annotationtypeedit_" +annotationtype+"_" + hash(set) + "\" class=\"on\"><a href=\"javascript:toggleannotationedit('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>";
        }
      });
    });
    $('#annotationseditviewmenu').html(s);
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


function editor_submit(addtoqueue) {
    /* Submit the annotation prepared in the editor dialog */
    //If addtoqueue is set, the annotation will not be performed yet but added to a queue (the console window), for later submission
    if (arguments.length === 0) {
        addtoqueue = false; 
    }


    //See if there are any changes in the values: did the user do something and do we have to prepare a query for the backend? 
    var changes = false; //assume no changes, falsify:
    for (var i = 0; i < editfields;i++) { 
        if ($('#editfield' + i) && ($('#editfield' + i).val() != editdata[i].class) && ($('#editfield' + i).val() != 'undefined') ) {
            //A class was changed
            //alert("Class change for " + i + ", was " + editdata[i].class + ", changed to " + $('#editfield'+i).val());
            editdata[i].oldclass = editdata[i].class;
            editdata[i].class = $('#editfield' + i).val().trim();
            editdata[i].changed = true;
            changes = true;
        }
        if ((editdata[i].type == "t") && ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() != editdata[i].text))) {
            //Text content was changed
            //alert("Text change for " + i + ", was " + editdata[i].text + ", changed to " + $('#editfield'+i+'text').val());
            editdata[i].oldtext = editdata[i].text;
            editdata[i].text = $('#editfield' + i + 'text').val().trim();
            editdata[i].changed = true;
            changes = true;
        }
        if ((editdata[i].editform == 'correction') && (!editdata[i].changed) && ($('#editform' + i + 'correctionclass').val().trim())) {
            //edit of correction class only, affects existing correction
            editdata[i].correctionclasschanged = true;
            editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val().trim();
            editdata[i].correctionset = $('#editformcorrectionset').val().trim(); 
            if (!editdata[i].correctionclass) {
                editor_error("Error (" + i + "): Annotation " + editdata[i].type + " was changed and submitted as correction, but no correction class was entered");
                return false;
            }
            if ($('#editfield' + i) && ($('#editfield' + i).val() == editdata[i].class) && ($('#editfield' + i).val() != 'undefined') ) {
                editdata[i].oldclass = editdata[i].class; //will remain equal
                editdata[i].class = $('#editfield' + i).val().trim();
            }
            if ((editdata[i].type == "t") && ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() == editdata[i].text))) {
                editdata[i].oldtext = editdata[i].text; //will remain requal
                editdata[i].text = $('#editfield' + i + 'text').val().trim();
            }
        } 
        

        if ((!editdata[i].changed) && (JSON.stringify(editdata[i].targets) != JSON.stringify(editdata[i].targets_begin))) {
            //detect changes in span, and set the changed flag
            editdata[i].changed = true;
        }

        if (editdata[i].changed) {
            if (editdata[i].editform == 'correction') {
                //editdata[i].editform = 'correction';
                editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val().trim();
                editdata[i].correctionset = $('#editformcorrectionset').val().trim(); 
                if (!editdata[i].correctionclass) {
                    editor_error("Error (" + i + "): Annotation " + editdata[i].type + " was changed and submitted as correction, but no correction class was entered");
                    return false;
                }
            } 
            if (editdata[i].type == 't') {
                if ((editdata[i].text.indexOf(' ') > 0) && (annotations[editedelementid].self.type == 'w'))  {
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

    }

    var queries = []; //will hold the FQL queries to be send to the backend


    //gather edits that changed, and sort targets
    sentdata = []; //will be used in repeatmode 
    for (var i = 0; i < editfields;i++) {  //jshint ignore:line
        if ((editdata[i].changed) || (editdata[i].correctionclasschanged)) {
            if (editdata[i].new) editdata[i].editform = "new";
            //sort targets in proper order
            var sortededittargets = [];
            if (editdata[i].targets.length > 1) {
                $('.' + view).each(function(){
                    if (editdata[i].targets.indexOf(this.id) > -1) {
                        sortededittargets.push(this.id);
                    }
                });
            } else {
                sortededittargets = editdata[i].targets;
            }
            if (sortededittargets.length != editdata[i].targets.length) {
                editor_error("Error, unable to sort targets, expected " + editdata[i].targets.length + ", got " + sortededittargets.length);
                return;
            }
            if (sortededittargets.length === 0) {
                editor_error("Error, no targets for action");
                return;
            }
            editdata[i].targets = sortededittargets;
            sentdata.push(editdata[i]);
            
            //compose query  
            var action = "";
            var returntype = "target";
            var query = "";
            if ((namespace == "testflat") && (docid != "manual")) {
                query += "USE testflat/" + testname + " ";
            } else {
                query += "USE " + namespace + "/" + docid + " ";
            }
            var isspan = annotationtypespan[editdata[i].type]; //are we manipulating a span annotation element?
            if (isspan) returntype = "ancestor-target";
            if (editdata[i].correctionclasschanged) {
                //TODO: this will change ALL corrections under the element, too generic
                action = "EDIT";
                query += "EDIT correction OF " + editdata[i].correctionset + " WITH class \"" + editdata[i].correctionclass  + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                returntype = "ancestor-focus";
                //set target expression
                if (sortededittargets.length > 0) {
                    query += " IN";
                    var forids = ""; //jshint ignore:line
                    sortededittargets.forEach(function(t){
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
                if (sortededittargets.length > 1) {
                    editor_error("Can't delete multiple words at once");
                    return;
                }
                action = "DELETE";
                query += "DELETE w ID " + sortededittargets[0];
                if (editdata[i].editform == "correction") {
                    query += " (AS CORRECTION OF " + editdata[i].correctionset + " WITH class \"" + editdata[i].correctionclass + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now)";
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
                            query += " WITH text \"" + editdata[i].insertright + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        }
                    } else if (editdata[i].insertleft) { //PREPEND (insertion)
                        query += " w"; 
                        if ((editdata[i].type == "t") && (editdata[i].insertleft !== "")) {
                            query += " WITH text \"" + editdata[i].insertleft + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        }
                    } else { //normal behaviour
                        query += " " +editdata[i].type;
                        if ((editdata[i].id) && ( editdata[i].editform != "new")) {
                            query += " ID " + editdata[i].id;
                        } else if ((editdata[i].set)  && (editdata[i].set != "undefined")) {
                            query += " OF " + editdata[i].set;                    
                        }
                        if ((editdata[i].type == "t") && (editdata[i].text !== "")) {
                            query += " WITH text \"" + editdata[i].text + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        } else if (editdata[i].class !== "") {
                            //no deletion 
                            query += " WITH class \"" + editdata[i].class + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        }
                    }
                } else { //substitute
                    if (editdata[i].insertright) { //insertright as substitute
                        query += "SUBSTITUTE w";
                        if ((editdata[i].type == "t") && (editdata[i].insertright !== "")) {
                            query += " WITH text \"" + editdata[i].insertright + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        }
                    } else if (editdata[i].insertleft) { //insertleft as substitue
                        query += "SUBSTITUTE w"; 
                        if ((editdata[i].type == "t") && (editdata[i].insertleft !== "")) {
                            query += " WITH text \"" + editdata[i].insertleft + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now";
                        }
                    } if (editdata[i].dosplit) {
                        parts = editdata[i].text.split(" ");
                        for (var j = 0; j < parts.length; j++) { //SPLIT
                            if (j > 0) query += " ";
                            query += "SUBSTITUTE w WITH text \"" + parts[j] + "\"";
                        }
                    } else if (editdata[i].targets.length > 1) { //MERGE
                        query += "SUBSTITUTE w WITH text \"" + editdata[i].text + "\""; 
                    }
                }
                if (isspan && editdata[i].id && (action == "EDIT")) {
                    //we edit a span annotation, edittargets reflects the new span:
                    if (sortededittargets.length > 0) {
                        query += " RESPAN ";
                        var forids = "";
                        sortededittargets.forEach(function(t){
                            if (forids) {
                                    forids += " &";
                            }
                            forids += " ID " + t;
                        });
                        query += forids;
                    }
                    returntype = "ancestor-focus";
                }


                //set AS expression
                if ((editdata[i].editform == "correction") && (!editdata[i].correctionclasschanged)) {
                    query += " (AS CORRECTION OF " + editdata[i].correctionset + " WITH class \"" + editdata[i].correctionclass + "\" annotator \"" + username + "\" annotatortype \"manual\" datetime now)";
                } else if (editdata[i].editform == "alternative") {
                    query += " (AS ALTERNATIVE)";
                }

                if (editsuggestinsertion) {
                    query += " FOR SPAN ID \"" + editsuggestinsertion + "\"";
                } else if (!( (isspan && editdata[i].id && (action == "EDIT")) )) { //only if we're not editing an existing span annotation 
                    //set target expression
                    if (sortededittargets.length > 0) {
                        query += " FOR";
                        if ((action == "SUBSTITUTE") || (isspan)) query += " SPAN";
                        var forids = ""; //jshint ignore:line
                        sortededittargets.forEach(function(t){
                            if (forids) {
                                if ((action == "SUBSTITUTE") || (isspan)) {
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
                        query += forids;
                    }
                }
                
            }
            //set format and return type
            query += " FORMAT flat RETURN " + returntype;

            //add to queries
            queries.push(query);
                
        } 
    }

    if ((addtoqueue) || ($('#openinconsole').prop('checked'))) {
        //Add-to-queue or delegate-to-console is selected (same thing, different route)
        var queuedqueries = $('#queryinput').val();
        if (queuedqueries !== "") queuedqueries = queuedqueries + "\n";
        $('#queryinput').val(queuedqueries + queries.join("\n")); //add query to query input in console
        update_queue_info(); //updates the interface to inform the user of the state of the queue and adds submit queue button
    }

    if ($('#openinconsole').prop('checked')) {
        //delegate-to-console is selected, we are done and can close the editor and open the console
        closeeditor();
        openconsole();
        if (namespace == "testflat") editor_error("Delegating to console not supported by tests");
        return false;
    } else if (addtoqueue) {
        //add to queue selected, just close editor
        closeeditor();
        return false;
    } else if ((queries.length === 0)) {
        //discard, nothing changed
        closeeditor();
        if (namespace == "testflat") editor_error("No queries were formulated");
        return false;
    }
    //==========================================================================================
    //Queries are submitted now

    $('#wait span.msg').val("Submitting edits");
    $('#wait').show();

    if ((namespace != "testflat") || (docid == "manual")) {  //tests will be handled by different ajax submission  
        //submit queries
        $.ajax({
            type: 'POST',
            url: "/" + namespace + "/"+ docid + "/query/",
            contentType: "application/json",
            //processData: false,
            headers: {'X-sessionid': sid },
            data: JSON.stringify( { 'queries': queries}), 
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    editor_error("Received error from document server: " + data.error);
                } else {
                    editfields = 0;
                    closeeditor();
                    update(data);
                    $('#saveversion').show();
                }
            },
            error: function(req,err,exception) { 
                $('#wait').hide();
                editor_error("Editor submission failed: " + req + " " + err + " " + exception);
            },
            dataType: "json"
        });
    } else {
        testbackend(docid, username, sid, queries);
    }
}

function console_submit(savefunction) { 
    var queries = $('#queryinput').val().split("\n"); 
    if ((queries.length === 1) && (queries[0] === "")) {
        closeeditor();
        if (arguments.length === 1) savefunction();
        return;
    }

    $('#wait span.msg').val("Executing query and obtaining results");
    $('#wait').show();

    $.ajax({
        type: 'POST',
        url: "/" + namespace + "/"+ docid + "/query/",
        contentType: "application/json",
        //processData: false,
        headers: {'X-sessionid': sid },
        data: JSON.stringify( { 'queries': queries}), 
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                editor_error("Received error from document server whilst submitting queued queries: " + data.error);
            } else {
                $('.queued').removeClass('queued');
                $('#queryinput').val("");
                editfields = 0;
                closeeditor();
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
            editor_error("Query failed: " + err + " " + exception + ": " + req.responseText);
        },
        dataType: "json"
    });
}


function saveversion() {
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
            $('#saveversion').hide();
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            editor_error("save failed: " + req + " " + err + " " + exception);
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


    var s = "";
    Object.keys(annotationtypenames).forEach(function(annotationtype){
        s = s + "<option value=\"" + annotationtype + "\">" + annotationtypenames[annotationtype] + "</option>";
    });
    $('#newdeclarationannotationtype').html(s);


    $('#editoraddfield').click(function(){
        var index = $('#editoraddablefields').val();
        addeditorfield(index);
    });

    editforms.direct = configuration.editformdirect;
    editforms.correction = configuration.editformcorrection;
    editforms.alternative = configuration.editformalternative;
    editforms.new = configuration.editformnew;

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
        queries = [];
        queries.push('USE ' + namespace + "/" + docid + " DECLARE " + $('#newdeclarationannotationtype').val() + " OF " + $('#newdeclarationset').val());
        $.ajax({
            type: 'POST',
            url: "/" + namespace + "/"+ docid + "/query/",
            contentType: "application/json",
            //processData: false,
            headers: {'X-sessionid': sid },
            data: JSON.stringify( { 'queries': queries}), 
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    editor_error("Received error from document server: " + data.error);
                } else {
                    loaddeclarations(data.declarations);
                    viewer_loadmenus();
                    $('#wait').hide();
                    $('#newdeclaration').hide();
                    $('#saveversion').show();
                }
            },
            error: function(req,err,exception) { 
                $('#wait').hide();
                $('#newdeclaration').hide();
                editor_error("Declaration failed: " + req + " " + err + " " + exception);
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
