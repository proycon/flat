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
    //load text into the structure
    annotationlist.forEach(function(annotation){
        if ((annotation.type == "t") && (annotation.text) && (annotation.class == "current")) {
            annotation.targets.forEach(function(target){
                $('#' + target + " span.lbl").html(annotation.text);
            });
        }
    });
    if (function_exists(mode + '_onloadtext')) {
        f = eval(mode + '_onloadtext');
        f(annotationlist);
    }
}

function loadannotations(annotationlist) {
    //load text into the structure
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
    $('.F').each(function(){ //loop over all folia elements
        $(this).click(onfoliaclick);
    });
}

annotations = {}; //annotations per structure item
docid = null;
initialannotationlist = [];

$(function() {
    loadtext(initialannotationlist);
    loadannotations(initialannotationlist);
    registerhandlers();
});
