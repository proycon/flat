function function_exists(functionName) {
    if(eval("typeof(" + functionName + ") == typeof(Function)")) {
        return true;
    }
}

function getannotationid(annotation) {
    if (annotation.id)  {
        return annotation.id;
    } else if (annotation.set) {
        return annotation.type + '/' + annotation.set;
    } else if (annotation.type) {
        return annotation.type;
    } else {
        alert("Unable to get ID for " + annotation)
    }
}

function onfoliaclick() {
    if (function_exists(mode + '_onclick')) {
        f = eval(mode + '_onclick');
        f(this);
    }
}

function loadtext(annotationlist) {
    //reload text into the structure
    annotationlist.forEach(function(annotation){
        if ((annotation.type == "t") && (annotation.text) && (annotation.class == "current")) {
            if (annotation.targets) {
                annotation.targets.forEach(function(target){
                    $('#' + target + " span.lbl").html(annotation.text);
                });
            }
        }
    });
    if (function_exists(mode + '_onloadtext')) {
        f = eval(mode + '_onloadtext');
        f(annotationlist);
    }
}

function loadannotations(annotationlist) {
    //load annotations in memory
    annotationlist.forEach(function(annotation){
        annotation.targets.forEach(function(target){
            if (!(annotations[target])) annotations[target] = {};
            var annotationid = getannotationid(annotation)
            annotations[target][annotationid] = annotation;
        });
    });
    if (function_exists(mode + '_onloadannotations')) {
        f = eval(mode + '_onloadannotations');
        f(annotationlist);
    }
}

function registerhandlers() {
    $('.F').click(onfoliaclick);
}

function setview(view) {
    $('div.F span.lbl').hide();
    if (view == 'n') {
        $('div.deepest>span.lbl').show();
    } else if (view == 'w') {
        $('div.w>span.lbl').show();
    } else if (view == 's') {
        $('div.s>span.lbl').show();
    } else if (view == 's') {
        $('div.p>span.lbl').show();
    }
}

annotations = {}; //annotations per structure item
docid = null;
initialannotationlist = [];

$(function() {
    //loadtext(initialannotationlist);
    loadannotations(initialannotationlist);
    registerhandlers();
    if (function_exists(mode + '_oninit')) {
        f = eval(mode + '_oninit');
        f();
    } else {
        setview('n');
    }
});
