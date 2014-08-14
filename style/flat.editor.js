editannotations = {};
editoropen = false;
coselector = false;
editforms = {'direct': true, 'correction': false,'alternative': false, 'new': true} ;
editedelementid = null;


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
    //toggles selection of an element
    var found = false;
    var index = 0;
    for (var i = 0; i < edittargets.length; i++) {
        if (edittargets[i] == element.id) {
            index = i;
            found = true;
            break;
        }
    }
    if (found) {
        edittargets.splice(index, 1);
        $(element).removeClass("selected");
    } else { 
        edittargets.push( element.id);
        $(element).addClass("selected");
    }

    //targets list
    edittargets_options = "";
    edittargets.forEach(function(edittarget){
        edittargets_options = edittargets_options + "<option value=\"" + edittarget + "\">" + edittarget + "</option>";
    });
    $("#editortargetlist").html(edittargets_options);
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
    editdata[index].editform = value
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

function addeditforms() {
    

    //do we have a single selection?
    var selected = false;
    Object.keys(editforms).forEach(function(editform){
        if (editforms[editform]) {
            if (selected == false) {
                selected = editform;
            } else {
                selected = null;
            }
        }
    });
    var editformcount = 0;
    var s = "<span id=\"editforms" + editfields + "\" class=\"editforms\">";
    if (editforms.direct) {
        if ((selected == "direct") || (selected == null)) {
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
            Object.keys(setdefinitions[correctionset].classes).forEach(function(cid){
                c = setdefinitions[correctionset].classes[cid]
                s = s + getclassesasoptions(c, ""); // will add to s
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
    return [s,editformcount]
}



function getclassesasoptions(c, selected) {
    //get classes pertaining to a set, from a set definition, as option elements (used in select)
    //supports recursive classes
    if (c.id == selected) {
        var s = s + "<option selected=\"selected\" value=\"" + c.id + "\">" + c.label + "</option>";
    } else {
        var s = s + "<option value=\"" + c.id + "\">" + c.label + "</option>";
    }
    Object.keys(c.subclasses).forEach(function(cid){
        csub = c.subclasses[cid]
        s = s + getclassesasoptions(csub, selected);
    });
    return s
}

function showeditor(element) {
    //show and populate the editor for a particular element

    if ((element) && ($(element).hasClass(view))) {
        if ((element.id)  && (annotations[element.id])) {            

            s = "";
            editoropen = true;
            sethover(element);
            editedelementid = element.id;
            editfields = 0;
            editdata = [];
            edittargets = [];
            select(element);
            var annotationfocusfound = false;
            var editformcount = 0;
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                annotation = annotations[element.id][annotationid];
                if (annotationfocus) {
                    if ((annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)) {
                        annotationfocusfound = true;
                    }
                }
                var ok = ((annotation.type != "correction") && ((editannotations[annotation.type+"/" + annotation.set]) ||  ((annotationfocus) && (annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)))  );
                if (ok) {
                    label = getannotationtypename(annotation.type);
                    if (annotation.set) {
                        setname = annotation.set;
                    } else {
                        setname = "";
                    }
                    if ((annotationfocus) && (annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)) {
                        s = s + "<tr class=\"focus\">";
                    } else {
                        s = s + "<tr>";
                    }
                    s = s + "<th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
                    if (annotation.type == 't') {
                        if (annotation.class != "current") {
                            s = s + "Class: <input id=\"editfield" + editfields + "\" value=\"" + annotation.class + "\"/><br/>Text:";
                        } else {
                            s = s + "<input style=\"display: none\" id=\"editfield" + editfields + "\" value=\"" + annotation.class + "\"/>";
                        }
                        s = s + "<input id=\"editfield" + editfields + "text\" value=\"" + annotation.text + "\"/>";
                    } else {
                        if (annotation.targets.length > 1) {
                            spantext = getspantext(annotation);
                            s  = s + "<span id=\"spantext" + editfields + "\" class=\"text\">" + spantext + "</span>";
                            s  = s + "<button id=\"spanselector" + editfields + "\" class=\"spanselector\">Select span</button>";
                            s  = s + "<br/>";
                        }
                        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type == "closed")) {
                            s = s + "<select id=\"editfield" + editfields + "\">";
                            s = s + "<option value=\"\"></option>";
                            Object.keys(setdefinitions[annotation.set].classes).forEach(function(cid){
                                c = setdefinitions[annotation.set].classes[cid]
                                s = s + getclassesasoptions(c, annotation.class); // will add to s
                            });
                            s = s + "</select>";
                        } else {
                            s = s + "<input id=\"editfield" + editfields + "\" value=\"" + annotation.class + "\"/>";
                        }
                    }
                    editformdata = addeditforms();
                    editformcount = editformdata[1];
                    s = s + editformdata[0];
                    //s = s + "<button id=\"editordelete" + editfields + "\">-</button>";
                    s = s + "</td></tr>";
                    editfields = editfields + 1;
                    editdataitem = {'type':annotation.type,'set':annotation.set, 'class':annotation.class, 'new': false, 'changed': false };
                    if (annotation.type == 't') editdataitem.text = annotation.text;
                    if (annotation.id) editdataitem.id = annotation.id;
                    //set default edit form (seteditform will be called later
                    //to affect the interface)
                    if (configuration.alloweditformcorrection) {
                        editdataitem.editform = 'correction';
                    } else if (configuration.alloweditformdirect) {
                        editdataitem.editform = 'direct';
                    } else {
                        editdataitem.editform = 'alternative';
                    }
                    editdata.push(editdataitem);

                    if ((annotationfocus) && (annotationfocus.type == annotation.type) && (annotationfocus.set == annotation.set)) {
                        //coselect other targets (just mimicks user click)
                        coselector = true;
                        annotation.targets.forEach(function(t){
                            var e = document.getElementById(t);
                            if (!$(e).hasClass("selected")) {
                                select(e);
                            }
                        });
                        coselector = false;
                    }
                }
                 
            });
            s = s + "<tr id=\"editrowplaceholder\"></tr>";
            if (edittargets.length == 1) {
                idheader = "<div id=\"id\">" + element.id + "</div>"
            } else {
                idheader = "<div id=\"id\">Editing " + edittargets.length + " items!</div>"
            }



            //extra fields list
            setaddablefields();


            edittargets_begin = JSON.parse(JSON.stringify(edittargets)); //deep copy, will be used for comparison on submission


            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);



            if ((annotationfocus) && (!annotationfocusfound)) {
                //the annotation focus has not been found, so no field appears, add one automatically:
                for (var i = 0; i < editoraddablefields.length; i++) {
                    if ((editoraddablefields[i].type == annotationfocus.type) && (editoraddablefields[i].set == annotationfocus.set)) {
                        addeditorfield(i);
                        break;
                    }
                }
            }
            $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-200} );
            if ((editformcount > 1) || (editforms.correction)) {
                $('.editforms').show();                
            } else {
                $('.editforms').hide();                
            }
            //configure actions and events for edit fields
            for (var i = 0; i < editfields;i++){
                //propagate editform to interface, for each field
                seteditform(i, editdata[i].editform);

                $('select#editfield'+i).sortOptions();
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
            $('#editor').show();    
            $('#editor').draggable();
        }
    }
}

function closeeditor() {
    $('#editor').hide();
    $('#wait').hide();
    editoropen = false;
    coselector = false;
    $('#document .selected').removeClass("selected");
    $('#editor .selectoron').removeClass("selectoron");
}



function addeditorfield(index) {
    //add a new field to the editor, populated by setaddablefields()
    //
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


    s =  "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
    if ((setdefinitions[editoraddablefields[index].set]) && (setdefinitions[editoraddablefields[index].set].type == "closed")) {
        s = s + "<select id=\"editfield" + editfields + "\">";
        s = s + "<option selected=\"selected\" value=\"\"></option>";
        Object.keys(setdefinitions[editoraddablefields[index].set].classes).forEach(function(cid){
            c = setdefinitions[editoraddablefields[index].set].classes[cid]
            s = s + getclassesasoptions(c, ""); // will add to s
        });
        s = s + "</select>";
    } else {
        s = s + "<input id=\"editfield" + editfields + "\" value=\"\"/>";
    }
    s = s + "</td></tr><tr id=\"editrowplaceholder\"></tr>";
    $('#editrowplaceholder')[0].outerHTML = s;

    editfields = editfields + 1; //increment after adding
    editdataitem = {'type':editoraddablefields[index].type,'set':editoraddablefields[index].set, 'class':'', 'new': true, 'changed': true };
    editdata.push(editdataitem);
    setaddablefields();
}

function showhistory() {
    $('#wait').show();
    $.ajax({
        type: 'GET',
        url: "/editor/" + namespace + "/"+ docid + "/history/",
        contentType: "application/json",
        //processData: false,
        success: function(data) {
            $('#wait').hide();
            s = "";
            data['history'].forEach(function(h){
                if (s == "") {
                    s = s + "<li><tt><strong>" + h['date'] + '</strong></tt> - <em>' + h['msg'] + '</em> - (current version)</li>';
                } else {
                    s = s + "<li><tt><strong>" + h['date'] + '</strong></tt> - <em>' + h['msg'] + "</em> - [<a href=\"javascript:revert('"+h['commit']+"')\">Revert to this version</a>]</li>";
                }
            });
            $('#historybody').html("<ol>" + s + "</ol>");
            $('#history').show();
            $('#history').draggable();
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            alert("Unable to obtain history");
        },
        dataType: "json"
    });
}


function revert(commithash) {
    $('#wait').show();
    $.ajax({
        type: 'GET',
        url: "/editor/" + namespace + "/"+ docid + "/revert/" + commithash,
        contentType: "application/json",
        //processData: false,
        success: function(data) {
            location.reload();
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            alert("Unable to revert");
        },
        dataType: "json"
    });

}

function editor_onclick(element) {
    //open editor
    if (coselector) {
        select(element); //toggle
    } else if (!editoropen) {
        $('#info').hide();
        showeditor(element);
    }
}




function editor_ondblclick(element) {
    //open editor
    $('#info').hide();
    if (editoropen) {
        closeeditor();
    }
    showeditor(element);
}

function editor_onmouseenter(element) {
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
    viewer_onupdate();
}

function declare() {
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



function editor_oninit() {
    viewer_oninit();
    editor_loadmenus();
    $('#editordiscard').click(closeeditor);
    $('#newdeclarationdiscard').click(function(){
        $('#newdeclaration').hide();
    });
    $('#historydiscard').click(function(){
        $('#history').hide();
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

    editforms['direct'] = configuration.editformdirect;
    editforms['correction'] = configuration.editformcorrection;
    editforms['alternative'] = configuration.editformalternative;
    editforms['new'] = configuration.editformnew;

    Object.keys(editforms).forEach(function(editform){
        if (editforms[editform]) $('#editform' + editform).addClass('on');
    });
    var s = "";
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
        var changes = false;
        for (var i = 0; i < editfields;i++) { 
            if ($('#editfield' + i) && ($('#editfield' + i).val() != editdata[i].class)) {
                //alert("Class change for " + i + ", was " + editdata[i].class + ", changed to " + $('#editfield'+i).val());
                editdata[i].class = $('#editfield' + i).val().trim();
                editdata[i].changed = true;
                changes = true;
            }
            if ((editdata[i].type == "t") && ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() != editdata[i].text))) {
                //alert("Text change for " + i + ", was " + editdata[i].text + ", changed to " + $('#editfield'+i+'text').val());
                editdata[i].oldtext = editdata[i].text;
                editdata[i].text = $('#editfield' + i + 'text').val().trim();
                editdata[i].changed = true;
                changes = true;
            }
            if (editdata[i].changed) {
                if (editdata[i].editform == 'correction') {
                    //editdata[i].editform = 'correction';
                    editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val().trim();
                    editdata[i].correctionset = $('#editformcorrectionset').val().trim(); 
                    if (!editdata[i].correctionclass) {
                        alert("Error (" + i + "): Annotation " + editdata[i].type + " was changed and submitted as correction, but no correction class was entered");
                        return false;
                    }
                } 
                if (editdata[i].type == 't') {
                    if ((editdata[i].text.indexOf(' ') > 0) && (annotations[editedelementid].self.type == 'w'))  {
                        //there is a space in a token! This can mean a number
                        //of things
                        
                        //Is the leftmost word the same as the original word?
                        //Then the user want to do an insertion to the right
                        if (editdata[i].text.substr(0,editdata[i].oldtext.length+1) == editdata[i].oldtext + ' ') {
                            editdata[i].insertright = editdata[i].text.substr(editdata[i].oldtext.length+1);
                            editdata[i].text = editdata[i].oldtext;
                        //Is the rightmost word the same as the original word?
                        //Then the user want to do an insertion to the left
                        } else if (editdata[i].text.substr(editdata[i].text.length -  editdata[i].oldtext.length - 1, editdata[i].oldtext.length + 1) == ' ' + editdata[i].oldtext)  {
                            editdata[i].insertleft = editdata[i].text.substr(0,editdata[i].text.length - editdata[i].oldtext.length - 1);
                            editdata[i].text = editdata[i].oldtext;
                        } else {
                            //Words are different? than the user may want to split
                            //the original token into new ones:
                            //
                            //ask user if he wants to split the token into two
                            editdata[i].dosplit = confirm("A space was entered for the token text. This will imply the tokens will be split into two new ones. Annotations pertaining to the original words will have to reentered for the new tokens. Continue with the split? Otherwise the token will remain one but contain a space."); 
                        
                        }
                        

                    }
                }
            }
        }


        if ((!changes) && (JSON.stringify(edittargets) != JSON.stringify(edittargets_begin))) {
            //we have a change in targets
            if (editfields == 1) {
                editdata[0].changed = true;
                if (editdata[0].editform == 'correction') {
                    //editdata[i].editform = 'correction';
                    editdata[0].correctionclass = $('#editform0correctionclass').val().trim();
                    editdata[0].correctionset = $('#editformcorrectionset').val().trim(); 
                    if (!editdata[0].correctionclass) {
                        alert("Error (" + 0 + "): Annotation " + editdata[0].type + " was changed and submitted as correction, but no correction class was entered");
                        return false;
                    }
                } 
            } else {
                alert("Unable to determine to what annotation type the change in span pertains... Please restrict editable fields and try again");
                closeeditor();
                return false;
            }
            changes = true;
        }

        var sendeditdata = []; 
        editdata.forEach(function(editdataitem){
            if (editdataitem.changed) {
                sendeditdata.push(editdataitem);
            }
        });
        if ((sendeditdata.length == 0)) {
            //discard
            closeeditor();
            return false;
        }
        
        
        //sort targets in proper order
        var sortededittargets = [];
        if (edittargets.length > 1) {
            $('.' + view).each(function(i){
                if (edittargets.indexOf(this.id) > -1) {
                    sortededittargets.push(this.id);
                }
            });
        } else {
            sortededittargets = edittargets;

        }

        if (sortededittargets.length != edittargets.length) {
            alert("Error, unable to sort targets, expected " + edittargets.length + ", got " + sortededittargets.length);
            return;
        }


        $('#wait').show();


        $.ajax({
            type: 'POST',
            url: "/editor/" + namespace + "/"+ docid + "/annotate/",
            contentType: "application/json",
            //processData: false,
            data: JSON.stringify( { 'elementid': editedelementid, 'edits': sendeditdata, 'targets': sortededittargets, 'annotator': username, 'sid': sid}),
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    alert("Received error from document server: " + data.error);
                } else {
                    editfields = 0;
                    closeeditor();
                    update(data);
                }
            },
            error: function(req,err,exception) { 
                $('#wait').hide();
                alert("Editor submission failed: " + req + " " + err + " " + exception);
            },
            dataType: "json"
        });
    });

    $('#newdeclarationsubmit').click(function(){
        $('#wait').show();
        $.ajax({
            type: 'POST',
            url: "/editor/" + namespace + "/"+ docid + "/declare/",
            contentType: "application/json",
            //processData: false,
            data: JSON.stringify( { 'annotationtype': $('#newdeclarationannotationtype').val(), 'set': $('#newdeclarationset').val(),'sid': sid }),
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    alert("Received error from document server: " + data.error);
                } else {
                    loaddeclarations(data['declarations']);
                    viewer_loadmenus();
                    $('#wait').hide();
                    $('#newdeclaration').hide();
                }
            },
            error: function(req,err,exception) { 
                $('#wait').hide();
                $('#newdeclaration').hide();
                alert("Declaration failed: " + req + " " + err + " " + exception);
            },
            dataType: "json"
        });

    });
}
