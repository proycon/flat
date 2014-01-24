editoropen = false;
coselector = false;

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
        if (annotationtypenames[annotationtype]) {
            label = annotationtypenames[annotationtype];
        } else {
            label = annotationtype;
        }
        Object.keys(declarations[annotationtype]).forEach(function(set){
            if (viewannotations[annotationtype + "/" + set]) {
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
                    if (annotationtypenames[annotation.type]) {
                        label = annotationtypenames[annotation.type];
                    } else {
                        label = annotation.type;
                    }
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

            if ((annotationfocus) && (!annotationfocusfound)) {
                for (var i = 0; i < editoraddablefields.length; i++) {
                    if ((editoraddablefields[i].type == annotationfocus.type) && (editoraddablefields[i].set == annotationfocus.set)) {
                        addeditorfield(i);
                        break;
                    }
                }
            }


            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);
            $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-200} );
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
                    if ($('#editfield' + i).val() != editdata[i].class) {
                        editdata[i].class = $('#editfield' + i).val();
                        editdata[i].changed = true;
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
                    data: JSON.stringify( { 'elementid': element.id, 'edits': sendeditdata, 'targets': edittargets, 'annotator': username}),
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
    if ($('#editrowplaceholder')) {
        $('#editrowplaceholder')[0].outerHTML = s;
    }

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

}
