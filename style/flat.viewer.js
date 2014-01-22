view = 'deepest';
viewannotations = {};
annotationfocus = 't';
hover = null;

function setview(v) {
    view = v;
    $('div.F span.lbl').hide();
    $('div.s').css('display', 'inline');
    $('ul#viewsmenu li').removeClass('on');
    if (v == 'deepest') {
        $('div.deepest>span.lbl').show();
        $('li#views_deepest').addClass('on');
    } else if (v == 'w') {
        $('div.w>span.lbl').show();
        $('li#views_w').addClass('on');
    } else if (v == 's') {
        $('div.s').css('display', 'block');
        $('div.s>span.lbl').show();
        $('li#views_s').addClass('on');
    } else if (v == 'p') {
        $('div.p>span.lbl').show();
        $('li#views_p').addClass('on');
    }
}


function sethover(element) {
    if ((element) && ($(element).hasClass(view))) {
        if (hover) $(".hover").removeClass("hover");
        $(element).addClass("hover");
        hover = element;
        if ($(element).hasClass('focustype')) {
            //colour related elements
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                if ((annotations[element.id][annotationid].type == annotationfocus.type) && (annotations[element.id][annotationid].set == annotationfocus.set) && (annotations[element.id][annotationid].targets.length > 1)) {
                    annotations[element.id][annotationid].targets.forEach(function(target){
                        $('#' + valid(target)).addClass("hover");
                    });
                }
            });
        }
    }
}

function viewer_onmouseenter(element) {
    sethover(element);
    showinfo(element);
}

function showinfo(element) {
    if ((element) && ($(element).hasClass(view))) {
        if ((element.id)  && (annotations[element.id])) {
            s = "";
            Object.keys(annotations[element.id]).forEach(function(annotationtype){
                annotation = annotations[element.id][annotationtype];
                if (viewannotations[annotationtype+"/" + annotation.set]) {
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
                    s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>" + annotation.class + "</td></tr>";
                }
            });
            if (s) {
                s = "<table>"  + s + "</table>";
                $('#info').html(s);
                $('#info').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX} );
                $('#info').show();    
            }
        }
    }
}


function toggleannotationview(annotationtype, set) {
    viewannotations[annotationtype+"/"+set] = !viewannotations[annotationtype+"/"+set];
    if (viewannotations[annotationtype+"/" + set]) {
        $('#annotationtypeview_' + annotationtype + "_" + hash(set)).addClass('on');
    } else {
        $('#annotationtypeview_' + annotationtype + "_" + hash(set)).removeClass('on');
    }
}


function setannotationfocus(t,set) {
    if (annotationfocus) {
        $('.focustype').removeClass("focustype");
        $('#annotationsfocusmenu li').removeClass('on');
    }
    annotationfocus = { 'type': t, 'set': set };
    $('#annotationtypefocus_' + annotationfocus.type + "_" + hash(annotationfocus.set)).addClass('on');
    if (annotationfocus != 't') {
        Object.keys(annotations).forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationkey){
            annotation = annotations[target][annotationkey];
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set)) {
                $('#' + valid(target)).addClass("focustype");
            }
        });
        });
    }
}

function viewer_oninit() {
    setview(view);
    setannotationfocus(annotationfocus);
    s = "";
    s2 = "";
    Object.keys(declarations).forEach(function(annotationtype){
      Object.keys(declarations[annotationtype]).forEach(function(set){
        if (!viewannotations[annotationtype + "/" + set]) {
            viewannotations[annotationttype + "/" + set] = true;
            if (annotationtypenames[annotationtype]) {
                label = annotationtypenames[annotationtype];
            } else {
                label = annotationtype;
            }
            s = s +  "<li id=\"annotationtypeview_" +annotationtype+"_" + hash(set) + "\" class=\"on\"><a href=\"javascript:toggleannotationview('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>";
            s2 = s2 +  "<li id=\"annotationtypefocus_" +annotationtype+"_" + hash(set) + "\"><a href=\"javascript:setannotationfocus('" + annotationtype + "','" + set + "')\">" + label +  "<span class=\"setname\">" + set + "</span></a></li>";
        }
      });
    });
    $('#annotationsviewmenu').html(s);
    $('#annotationsfocusmenu').html(s2);
    if (viewannotations['t']) toggleannotationview('t');
    $('#document').mouseleave(function() { $('#info').hide(); });
}
