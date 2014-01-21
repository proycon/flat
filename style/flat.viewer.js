view = 'deepest';
viewannotations = {};
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

function viewer_onmouseenter() {
    sethover(this);
}

function toggleannotationview(annotationtype) {
    viewannotations[annotationtype] = !viewannotations[annotationtype];
    if (viewannotations[annotationtype]) {
        $('#annotationtypeview_' + annotationtype).addClass('on');
    } else {
        $('#annotationtypeview_' + annotationtype).removeClass('on');
    }
}

function viewer_oninit() {
    setview(view);
    s = "";
    Object.keys(annotations).forEach(function(annotationkey){
        annotation = annotations[annotationkey];
        if (!viewannotations[annotation.type]) {
            viewannotations[annotation.type] = true;
            if (annotationtypenames[annotation.type]) {
                label = annotationtypenames[annotation.type];
            } else {
                label = annotation.type;
            }
            s = s +  "<li id=\"annotationtypeview_" +annotation.type+"\" class=\"on\"><a href=\"javascript:toggleannotationview('" + annotation.type + "')\">" + label + "</a></li>";
        }
    });
    $('#annotationsviewmenu').html(s);
}
