view = 'deepest';
viewannotations = {};
annotationfocus = null;
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
        if (hover) $(hover).removeClass("hover");
        $(element).addClass("hover");
        hover = element;
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
                if (viewannotations[annotationtype]) {
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


function toggleannotationview(annotationtype) {
    viewannotations[annotationtype] = !viewannotations[annotationtype];
    if (viewannotations[annotationtype]) {
        $('#annotationtypeview_' + annotationtype).addClass('on');
    } else {
        $('#annotationtypeview_' + annotationtype).removeClass('on');
    }
}


function setannotationfocus(t) {
    if (annotationfocus) {
        $('.focustype').removeClass("focustype");
        $('#annotationtypefocus_' + annotationfocus).removeClass('on');
    }
    annotationfocus = t;
    $('#annotationtypefocus_' + annotationfocus).addClass('on');
    Object.keys(annotations).forEach(function(target){
      Object.keys(annotations[target]).forEach(function(annotationkey){
        annotation = annotations[target][annotationkey];
        if (annotation.type == annotationfocus) {
            $('#' + valid(target)).addClass("focustype");
        }
     });
    });
}

function viewer_oninit() {
    setview(view);
    s = "";
    s2 = "";
    Object.keys(annotations).forEach(function(target){
      Object.keys(annotations[target]).forEach(function(annotationkey){
        annotation = annotations[target][annotationkey];
        if (!viewannotations[annotation.type]) {
            viewannotations[annotation.type] = true;
            if (annotationtypenames[annotation.type]) {
                label = annotationtypenames[annotation.type];
            } else {
                label = annotation.type;
            }
            s = s +  "<li id=\"annotationtypeview_" +annotation.type+"\" class=\"on\"><a href=\"javascript:toggleannotationview('" + annotation.type + "')\">" + label + "</a></li>";
            s2 = s2 +  "<li id=\"annotationtypefocus_" +annotation.type+"\"><a href=\"javascript:setannotationfocus('" + annotation.type + "')\">" + label + "</a></li>";
        }
      });
    });
    $('#annotationsviewmenu').html(s);
    $('#annotationsfocusmenu').html(s2);
    if (viewannotations['t']) toggleannotationview('t');
    $('#document').mouseleave(function() { $('#info').hide(); });
}
