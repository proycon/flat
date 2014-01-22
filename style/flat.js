annotationtypenames = {
    'pos': 'Part-of-Speech',
    'lemma': 'Lemma',
    't': 'Text',
    'entity': 'Named Entity',
    'su': 'Syntax',
    'chunk': 'Chunk',
    'sense': 'Semantic Sense',
    'semrole': 'Semantic Role',
    'correction': 'Correction',
    'errordetection': 'Error detection',
    'dependency': 'Dependency',
    'coreferencechain': 'Coreference',
}


function function_exists(functionName) {
    if(eval("typeof(" + functionName + ") == typeof(Function)")) {
        return true;
    }
}

function hash(s){
  if (s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); 
  } else {
    return 0;
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
    return false;
}
function onfoliamouseenter() {
    if (function_exists(mode + '_onmouseenter')) {
        f = eval(mode + '_onmouseenter');
        f(this);
    }
    return false;
}
function onfoliamouseleave() {
    if (function_exists(mode + '_onmouseleave')) {
        f = eval(mode + '_onmouseleave');
        f(this);
    }
    return false;
}

function loadtext(annotationlist) {
    //reload text into the structure
    annotationlist.forEach(function(annotation){
        if ((annotation.type == "t") && (annotation.text) && (annotation.class == "current")) {
            if (annotation.targets) {
                annotation.targets.forEach(function(target){
                    $('#' + valid(target) + " span.lbl").html(annotation.text);
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
            var annotationid = getannotationid(annotation);
            annotations[target][annotationid] = annotation;
            annotations[target][annotationid].annotationid = annotationid;
        });
    });
    if (function_exists(mode + '_onloadannotations')) {
        f = eval(mode + '_onloadannotations');
        f(annotationlist);
    }
}


function loaddeclarations(declarationlist) {
    declarationlist.forEach(function(declaration){
        if (!declarations[declaration.annotationtype])  declarations[declaration.annotationtype] =  {};
        declarations[declaration.annotationtype][declaration.set] = { 'settype': 'open', 'classes': [] }; //this will hold proper set definitions later on, TODO
    });
}

function registerhandlers() {
    $('.F').click(onfoliaclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
}

function valid(id){
    return id.replace(/\./g,'\\.');
}

$(document).mousemove( function(e) {
   mouseX = e.pageX; 
   mouseY = e.pageY;
});  

annotations = {}; //annotations per structure item
declarations = {};
docid = null;
initialannotationlist = [];
initialdeclarationlist = [];
mouseX = 0;
mouseY = 0;

$(function() {
    $('nav>ul>li').mouseenter(function(){
        $('>ul',this).css('left', mouseX-30);
    });



    //loadtext(initialannotationlist);
    loadannotations(initialannotationlist);
    loaddeclarations(initialdeclarationlist);
    registerhandlers();
    if (function_exists(mode + '_oninit')) {
        f = eval(mode + '_oninit');
        f();
    }

});
