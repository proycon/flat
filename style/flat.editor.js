editoropen = false;
coselector = false;
editforms = {'direct': true, 'correction': false,'alternative': false} ;
editform_correctionset = null;


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


function select(element) {
    //toggles
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
    editoraddablefields_options = "";
    editoraddablefields = [];
    Object.keys(declarations).forEach(function(annotationtype){
        label = getannotationtypename(annotationtype);
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if ((annotationtype != "correction") && (viewannotations[annotationtype + "/" + set])) {
                setname = set;
                if (setname.length > 30) {
                    setname = setname.substr(0,15) + ".." + setname.substr(setname.length-15,15);
                }
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
    if ((editoraddablefields_options) && (!annotationfocus)) {
        $("#editoraddablefields").html(editoraddablefields_options);
        $("#editoraddfields").show();
    } else {
        $("#editoraddfields").hide();
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
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "direct\" value=\"direct\" checked=\"checked\" /><label title=\"Edit Directly\">D</label>";
        } else {
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "direct\" value=\"direct\" /><label title=\"Edit Directly\">D</label>";
        }
        editformcount++;
    }
    if (editforms.correction) {
        if (selected == "correction") {
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "correction\" value=\"correction\" checked=\"checked\" /><label title=\"Edit as new Correction\">C</label>";
        } else {
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "correction\" value=\"correction\" /><label title=\"Edit as new Correction\">C</label>";
        }
        s = s +  "<input type=\"text\" id=\"editform" + editfields + "correctionclass\" class=\"editformcorrectionclass\" placeholder=\"(enter correction class)\" />";
        editformcount++;
    }
    if (editforms.alternative) {
        if (selected == "alternative") {
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "alternative\" value=\"alternative\" checked=\"checked\" /><label title=\"Edit as new Alternative\">A</label>";
        } else {
            s += "<input type=\"radio\" name=\"editform" + editfields + "\" id=\"editform" + editfields + "alternative\" value=\"alternative\" /><label title=\"Edit as new Alternative\">A</label>";
        }
        editformcount++;
    }
    s = s + "</span>";
    return [s,editformcount]
}




function showeditor(element) {

    if ((element) && ($(element).hasClass(view))) {
        if ((element.id)  && (annotations[element.id])) {            
            s = "";
            editoropen = true;
            sethover(element);
            editfields = 0;
            editdata = [];
            edittargets = [];
            select(element);
            var annotationfocusfound = false;
            var editformcount = 0;
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                annotation = annotations[element.id][annotationid];
                var ok = true;
                if ((annotationfocus) && ((annotationfocus.type != annotation.type) || (annotationfocus.set != annotation.set))) {
                    ok = false;;
                } else if (annotationfocus) {
                    annotationfocusfound = true;
                }
                ok = ok && ((annotationfocusfound) || (viewannotations[annotation.type+"/" + annotation.set]));
                if (ok) {
                    label = getannotationtypename(annotation.type);
                    if (annotation.set) {
                        setname = annotation.set;
                    } else {
                        setname = "";
                    }
                    s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
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
                            s  = s + "<span class=\"text\">" + spantext + "</span><br/>";
                        }
                        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type == "closed")) {
                            s = s + "<select id=\"editfield" + editfields + "\">";
                            s = s + "<option value=\"\"></option>";
                            Object.keys(setdefinitions[annotation.set].classes).forEach(function(cid){
                                c = setdefinitions[annotation.set].classes[cid]
                                if (c.id == annotation.class) {
                                    s = s + "<option selected=\"selected\" value=\"" + c.id + "\">" + c.label + "</option>";
                                } else {
                                    s = s + "<option value=\"" + c.id + "\">" + c.label + "</option>";
                                }
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
                    if (annotation.id) editdataitem.id = annotation.id;
                    editdata.push(editdataitem);
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



            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);
            if ((annotationfocus) && (!annotationfocusfound)) {
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
                $('select#editfield'+i).sortOptions();
                $('#editfield'+i).change(function(){
                    index = 0;
                    for (var i = 0; i < editfields;i++) { if (this.id == "editfield" + i) { index = i; break; } }
                    if ($(this).val() != editdata[index].class) {
                        editdata[index].class = $(this).val();
                        editdata[index].changed = true;
                        if (!$(this).hasClass("changed")) $(this).addClass("changed");
                    }
                });
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



            $('#editorsubmit').click(function(){

                for (var i = 0; i < editfields;i++) { 
                    if ($('#editfield' + i) && ($('#editfield' + i).val() != editdata[i].class)) {
                        editdata[i].class = $('#editfield' + i).val();
                        editdata[i].changed = true;
                    }
                    if ($('#editfield' + i + 'text') && ($('#editfield' + i + 'text').val() != editdata[i].text)) {
                        editdata[i].text = $('#editfield' + i + 'text').val();
                        editdata[i].changed = true;
                    }
                    if (editdata[i].changed) {
                        if ($('#editform' + i + 'correction').checked()) {
                            editdata[i].editform = 'correction';
                            editdata[i].correctionclass = $('#editform' + i + 'correctionclass').val();
                            editdata[i].correctionset = $('#editformcorrectionset').val(); 
                            if (!editdata[i].correctionclass) {
                                alert("Error: An annotation was changed and submitted as correction, but no correction class was entered");
                                return false;
                            }
                        } else if ($('#editform' + i + 'alternative').checked()) {
                            editdata[i].editform = 'alternative';
                        } else {
                            editdata[i].editform = 'direct';
                        }
                    }
                }


                sendeditdata = []; 
                editdata.forEach(function(editdataitem){
                    if (editdataitem.changed) {
                        sendeditdata.push(editdataitem);
                    }
                });
                if (sendeditdata.length == 0) {
                    //discard
                    closeeditor();
                    return false;
                }
                
                //sort targets in proper order
                sortededittargets = [];
                $('.' + view).each(function(element){
                    if (edittargets.indexOf(element.id) > -1) {
                        sortededittargets.push(element.id);
                    }
                });


                $('#wait').show();
                $.ajax({
                    type: 'POST',
                    url: "/editor/" + namespace + "/"+ docid + "/annotate/",
                    contentType: "application/json",
                    //processData: false,
                    data: JSON.stringify( { 'elementid': element.id, 'edits': sendeditdata, 'targets': edittargets, 'annotator': username, 'sid': sid}),
                    success: function(data) {
                        if (data.error) {
                            $('#wait').hide();
                            alert("Received error from document server: " + data.error);
                        } else {
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
                return true;
            });

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
            s = s + "<option value=\"" + c.id + "\">" + c.label + "</option>";
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

function editor_oninit() {
    viewer_oninit();
    $('#editordiscard').click(closeeditor);
    $('#editorselecttarget').click(function(){
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
    $('#editoraddfield').click(function(){
        var index = $('#editoraddablefields').val();
        addeditorfield(index);
    });
    Object.keys(editforms).forEach(function(editform){
        if (editforms[editform]) $('#editform' + editform).addClass('on');
    });
    var s = "";
    Object.keys(declarations).forEach(function(annotationtype){
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if (annotationtype == "correction") {
                if (s) {
                    s = s + "<option value=\"" + set + "\">" + set + "</option>";
                } else {
                    s = "<option value=\"" + set + "\" selected=\"selected\">" + set + "</option>";
                }
            }
        });
    });
    $('#editformcorrectionset').html(s);
    if (editforms.correction) $('#editformcorrectionsetselector').show();
}
