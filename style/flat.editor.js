editoropen = false;


function showeditor(element) {
    if ((element) && ($(element).hasClass(view))) {
        if ((element.id)  && (annotations[element.id])) {            
            s = "";
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
                    s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td><input value=\"" + annotation.class + "\"/></td></tr>";
                }
                 
            });
            if (s) {
                s = "<div id=\"id\">" + element.id + "</div><table>"  + s + "</table>";
                $('#editor div.body').html(s);
                $('#editor').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX-100} );
                $('#editor').show();    
                editoropen = true;
            }
        }
    }
}

function editor_onclick(element) {
    //open editor
    showeditor(element);
}

function editor_onmouseenter(element) {
    sethover(element);
    if (!editoropen) {
        showinfo(element);
    }
}


function editor_oninit() {
    viewer_oninit();
}
