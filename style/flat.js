function function_exists(functionName) {
    if(eval("typeof(" + functionName + ") == typeof(Function)")) {
        return true;
    }
}

function getannotationid(annotation) {
    if (annotation.id !== undefined)  {
        return annotation.id;
    } else if (annotation.set !== undefined) {
        return annotation.type + '/' + annotation.set;
    } else {
        return annotation.type;
    }
}

function onfoliaclick() {
    if (function_exist(mode + '_onclick')) {
        f = eval(mode + '_onclick');
        f(this);
    }
}

function loadtext(annotationlist) {
    //load text into the structure
    annotationlist.forEach(function(annotation){
        if ((annotation.text !== undefined) && (annotation.class == "current")) {
            annotation.targets.forEach(function(target){
                $('#' + target).html(annotation.text);
            });
        }
    });
    if (function_exist(mode + '_onloadtext')) {
        f = eval(mode + '_onloadtext');
        f(annotationlist);
    }
}

function loadannotations(annotationlist) {
    //load text into the structure
    annotationlist.forEach(function(annotation){
        annotation.targets.forEach(function(target){
            if (annotations[target] === undefined) annotations[target] = {};
            annotationid = getannotationid(annotation)
            annotations[target][annotationid] = annotation;
        });
    });
    if (function_exist(mode + '_onloadannotations')) {
        f = eval(mode + '_onloadannotations');
        f(annotationlist);
    }
}

function registerhandlers() {
    $('.F').each(function(){ //loop over all folia elements
        $(this).onclick(foliaclick);
    });
}

if (docid !== undefined) {
    annotations = {} //annotations per structure item


    $(function() {
        if (initialannotationlist !== undefined) {
            loadtext(initialannotationlist)
            loadannotations(initialannotationlist)
        }
    });
}
