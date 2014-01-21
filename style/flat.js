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
function onfoliamouseenter() {
    sethover(this);
    if (function_exists(mode + '_onmouseenter')) {
        f = eval(mode + '_onmouseenter');
        f(this);
    }
}
function onfoliamouseleave() {
    if (function_exists(mode + '_onmouseleave')) {
        f = eval(mode + '_onmouseleave');
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
    $('.F').click(onfoliaclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
}

function setview(v) {
    view = v;
    $('div.F span.lbl').hide();
    $('div.s').css('display', 'inline');
    if (v == 'deepest') {
        $('div.deepest>span.lbl').show();
    } else if (v == 'w') {
        $('div.w>span.lbl').show();
    } else if (v == 's') {
        $('div.s').css('display', 'block');
        $('div.s>span.lbl').show();
    } else if (v == 'p') {
        $('div.p>span.lbl').show();
    }
}


function sethover(element) {
    if ((element) && ($(element).hasClass(view))) {
        if (hover) $(hover).removeClass("hover");
        $(element).addClass("hover");
        hover = element;
    }
}

annotations = {}; //annotations per structure item
docid = null;
initialannotationlist = [];
hover = null;
view = 'deepest';

$(function() {
    //loadtext(initialannotationlist);
    loadannotations(initialannotationlist);
    registerhandlers();
    if (function_exists(mode + '_oninit')) {
        f = eval(mode + '_oninit');
        f();
    }
    setview(view);
});
