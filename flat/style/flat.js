annotationtypenames = {
    'pos': 'Part-of-Speech',
    'lemma': 'Lemma',
    't': 'Text',
    'w': 'Token',
    's': 'Sentence',
    'p': 'Paragraph',
    'div': 'Division',
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
annotationtypespan = {
    'pos': false,
    'lemma': false,
    't': false,
    'w': false,
    's': false,
    'p': false,
    'div': false,
    'entity': true,
    'su': true,
    'chunk': true,
    'sense': true,
    'semrole': true,
    'correction': true,
    'errordetection': false,
    'dependency': true,
    'coreferencechain': true,
}
sid = ((Math.random() * 1e9) | 0); //session id

function getannotationtypename(t) {
    if (annotationtypenames[t]) {
        return annotationtypenames[t];
    } else {
        return t;
    }
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
    if (annotation.self) {
        return "self";
    } else if (annotation.id)  {
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
function onfoliadblclick() {
    if (function_exists(mode + '_ondblclick')) {
        f = eval(mode + '_ondblclick');
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
                    if (target) $('#' + valid(target) + " span.lbl").html(annotation.text);
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
    var annotationexists = {}

    annotationlist.forEach(function(annotation){
        annotation.targets.forEach(function(target){
            if (!(annotations[target])) annotations[target] = {};
            if (!(annotationexists[target])) annotationexists[target] = {};
            var annotationid = getannotationid(annotation);
            annotations[target][annotationid] = annotation;
            annotations[target][annotationid].annotationid = annotationid;
            annotationexists[target][annotationid] = true;
        });
        if ((annotation.type == "correction") && (annotation.id)) {
            corrections[annotation.id] = annotation;
            if ((annotation.suggestions.length > 0) && (annotation.new.length == 0)) {
                //find the annotation the suggestions apply to and act as if
                //that is part of the correction
                target = annotation.targets[0];
                Object.keys(annotations[target]).forEach(function(annotationid){
                    if (annotationid != "self") {
                        if ((annotations[target][annotationid].type == annotation.suggestions[0].type) && (annotations[target][annotationid].set == annotation.suggestions[0].set)) {
                            if (!annotations[target][annotationid].incorrection) {
                                annotations[target][annotationid].incorrection = [annotation.id];
                            } else {
                                annotations[target][annotationid].incorrection.push(annotation.id);
                            }
                        }
                    }
                });
            }
        }
    });

    //find old annotations that are no longer in the response, delete them
    Object.keys(annotations).forEach(function(target){
        if (annotationexists[target]) {
            Object.keys(annotations[target]).forEach(function(annotationid){
                if (!annotationexists[target][annotationid]) delete annotations[target][annotationid];
            });
        }
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
    $('.F').off(); //prevent duplicates
    $('.F').click(onfoliaclick).dblclick(onfoliadblclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
}

function valid(id){
    return id.replace(/\./g,'\\.');
}

function shorten(s) {
    if (s.length > 30) {
        if (s.substr(s.length -13) == ".foliaset.xml") {
            s = s.substr(0,s.length-13) + '..'
        }
        if (s.substr(0,22) == "http://raw.github.com/") {
            s = ".." + s.substr(22);
        }
        if (s.length > 40) {
            s = s.substr(0,15) + ".." + s.substr(s.length-25,25);
        }
    }
    return s;
}

function update(data) {
    //partial update
    if (data.error) {
        alert(data.error);
    }
    if (data.elements) {
        data.elements.forEach(function(returnitem){
            if ((returnitem.html) && (returnitem.elementid)) { 
                $('#' + valid(returnitem.elementid))[0].outerHTML = returnitem.html;
                //$('#' + valid(data.elementid)).attr('id',"replacing");
                //$('#replacing').html("...");
                //$('#replacing').after(data.html);
                //$('#replacing').remove();
            }
            if (returnitem.annotations) {
                loadtext(returnitem.annotations);
                loadannotations(returnitem.annotations);
            }
            if (returnitem.elementid) {
                //reregister handlers
                registerhandlers();
            }
            if (function_exists(mode + '_onupdate')) {
                f = eval(mode + '_onupdate');
                f(returnitem);
            }
        });
    }
}


$(document).mousemove( function(e) {
   mouseX = e.pageX; 
   mouseY = e.pageY;
});  

annotations = {}; //annotations per structure item
declarations = {};
corrections = {};
docid = null;
initialannotationlist = [];
initialdeclarationlist = [];
mouseX = 0;
mouseY = 0;

$(document).ajaxSend(function(event, xhr, settings) {
    //CSRF token support for jquery AJAX request to Django
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

$.fn.sortOptions = function(){
    var sel = $(this).val();
    $(this).each(function(){
        var op = $(this).children("option");
        op.sort(function(a, b) {
            return a.text > b.text ? 1 : -1;
        })
        return $(this).empty().append(op);
    });
    $(this).val(sel);
}

function bySortedValue(obj, callback, context) {
    var tuples = [];

    for (var key in obj) tuples.push([key, obj[key]]);

    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    var length = tuples.length;
    while (length--) callback.call(context, tuples[length][0], tuples[length][1]);
}

function hideuploadform() {
    $('#uploadform').hide();
    return false;
}

$(function() {
    if (typeof(mode) != "undefined") {
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
        window.setInterval(function() {
            f = eval(mode + '_ontimer');
            f();
        }, 5000);
    } else {
        $('#showuploadbutton').click(function(){
            $('#uploadform').show();
        });
        $('#cancelupload').click(function(){
            $('#uploadform').hide();
            return false;
        });
    }
    $('#wait').hide();
});
