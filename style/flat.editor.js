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
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                annotation = annotations[element.id][annotationid];
                if (viewannotations[annotation.type+"/" + annotation.set]) {
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
                    s = s + "<input id=\"editfield" + editfields + "\" value=\"" + annotation.class + "\"/>";
                    //s = s + "<button id=\"editordelete" + editfields + "\">-</button>";
                    s = s + "</td></tr>";
                    editfields = editfields + 1;
                    editdataitem = {'type':annotation.type,'set':annotation.set, 'class':annotation.class, 'new': false, 'changed': false };
                    if (annotation.id) editdataitem.id = annotation.id;
                    editdata.push(editdataitem);
                }
                 
            });
            if (edittargets.length == 1) {
                idheader = "<div id=\"id\">" + element.id + "</div>"
            } else {
                idheader = "<div id=\"id\">Editing " + edittargets.length + " items!</div>"
            }

            //extra fields list
            editoraddablefields_options = "";
            editoraddablefields = [];
            Object.keys(declarations).forEach(function(annotationtype){
                Object.keys(declarations[annotationtype]).forEach(function(set){
                    if (viewannotations[annotationtype + "/" + set]) {
                        found = false;
                        editdata.forEach(function(editdataitem){
                            if ((editdataitem.type == annotationtype) && (editdataitem.set == set)) {
                                found = true; 
                                return true;
                            }
                        });
                        if (!found) {
                            editoraddablefields_options = editoraddablefields_options + "<option value=\"" + editoraddablefields.length + "\">" + annotationtype + "/" + set + "</option>";
                            editoraddablefields.push({'type': annotationtype, 'set': set});
                        }
                    }
                });
            });
            if (editoraddablefields_options) {
                $("#editoraddablefields").html(editoraddablefields_options);
                $("#editoraddfields").show();
            } else {
                $("#editoraddfields").hide();
            }




            s = idheader + "<table>"  + s + "</table>";
            $('#editor div.body').html(s);
            $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-200} );
            //configure actions and events for edit fields
            for (var i = 0; i < editfields;i++){
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

                $('#wait').show();
                $.ajax({
                    type: 'POST',
                    url: "/editor/" + docid + "/annotate/",
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
                        alert("Editor submission failed" + req + " " + err + " " + exception);
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

function addeditorfield() {
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

function editor_onmouseenter(element) {
    if (!editoropen) {
        sethover(element);
        showinfo(element);
    }
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

}
