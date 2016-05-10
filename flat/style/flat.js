// jshint evil:true
var annotationtypenames = {
    'pos': 'Part-of-Speech',
    'lemma': 'Lemma',
    't': 'Text',
    'ph': 'Phonetic Content',
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
    'note': 'Note',
    'entry': 'Entry',
    'def': 'Definition',
    'term': 'Term',
    'gap': 'Gap',
    'event': 'Event',
    'alignment': 'Alignments',
    'morpheme': 'Morpheme',
    'phoneme': 'Phoneme',
    'lang': 'Language',
    'ex': 'Example',
    'part': 'Part',
    'timesegment': 'Time Segment',
    'cell': 'Table cell',
    'row': 'Table row',
    'metric': 'Metric',
    'str': 'String'
};
var annotationtypespan = {
    'pos': false,
    'lemma': false,
    't': false,
    'ph': false,
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
};
var annotationtypestructure = ['p','w','s','div','event','utt'];
var spanroles = {
    'coreferencechain': ['coreferencelink'],
    'dependency': ['hd','dep'],
};


var sid = ((Math.random() * 1e9) | 0); //session id

var havecontent = false; //we start assuming we have no content
var closewait = true; //close the wait mask when we are done loading
var textclass = "current";

var perspective = 'document'; //initial perspective (will be overriden from config in init anyway)
var perspective_ids = null;
var perspective_start = null;
var perspective_end = null;

var annotations = {}; //annotations per structure item
var declarations = {};
var corrections = {};
var docid = null;
var initialannotationlist = [];
var initialdeclarationlist = [];
var mouseX = 0;
var mouseY = 0;

function getannotationtypename(t) {
    if (annotationtypenames[t]) {
        return annotationtypenames[t];
    }
    return t;
}

function function_exists(functionName) {
    if(eval("typeof(" + functionName + ") == typeof(Function)")) {
        return true;
    }
}


function isstructure(annotationtype) {
    return (annotationtypestructure.indexOf(annotationtype) !== -1);
}

function hash(s){
  if (s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);  //jshint ignore:line
  }
  return 0;
}

function getannotationid(annotation) {
    if (annotation.self) {
        return "self";
    } 
    if (annotation.id)  {
        return annotation.id;
    } 
    if (annotation.type === 't') {
        return annotation.type + '/' + annotation.set + ':' + annotation.class;
    } 
    if (annotation.set) {
        return annotation.type + '/' + annotation.set;
    } 
    if (annotation.type) {
        return annotation.type;
    }
    alert("Unable to get ID for " + annotation);
}

function onfoliaclick() {
    if (function_exists(mode + '_onclick')) {
        var f = eval(mode + '_onclick');
        f(this);
    }
    return false;
}
function onfoliadblclick() {
    if (function_exists(mode + '_ondblclick')) {
        var f = eval(mode + '_ondblclick');
        f(this);
    }
    return false;
}
function onfoliamouseenter() {
    if (function_exists(mode + '_onmouseenter')) {
        var f = eval(mode + '_onmouseenter');
        f(this);
    }
    return false;
}
function onfoliamouseleave() {
    if (function_exists(mode + '_onmouseleave')) {
        var f = eval(mode + '_onmouseleave');
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
                    if (target) { $('#' + valid(target) + " span.lbl").html(annotation.text); }
                });
            }
        }
    });
    /*if (function_exists(mode + '_onloadtext')) {
        var f = eval(mode + '_onloadtext');
        f(annotationlist);
    }*/
}

function loadannotations(annotationlist) {
    //load annotations in memory
    var annotationexists = {};

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
            if ((annotation.suggestions.length > 0) && (annotation.new.length === 0)) {
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
    Object.keys(annotationexists).forEach(function(target){
        if (annotations[target]) {
            Object.keys(annotations[target]).forEach(function(annotationid){
                if (!annotationexists[target][annotationid]) delete annotations[target][annotationid];
            });
        }
    });

    /*
    if (function_exists(mode + '_onloadannotations')) {
        f = eval(mode + '_onloadannotations');
        f(annotationlist);
    }
    */
}


function loaddeclarations(declarationlist) {
    declarationlist.forEach(function(declaration){
        if (!declarations[declaration.annotationtype])  declarations[declaration.annotationtype] =  {};
        declarations[declaration.annotationtype][declaration.set] = { 'settype': 'open', 'classes': [] }; //this will hold proper set definitions later on
    });
}

function rendertextclass() {
    Object.keys(annotations).forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationid){
            var annotation = annotations[target][annotationid];
            if ((annotation.type == "t") && (annotation.class == textclass)) {
                lbl = $('#' + valid(target) + " span.lbl");
                if ((lbl.length == 1) && ($('#'  + valid(target)).hasClass('deepest'))) {
                    if (annotation.htmltext) {
                        lbl.html(annotation.htmltext);
                    } else {
                        lbl.html(annotation.text);
                    }
                }
            }
        });
    });
    $('div.deepest>span.lbl').show();
    if (function_exists(mode + '_onrendertextclass')) {
        f = eval(mode + '_onrendertextclass');
        f();
    }
}

function setupcorrection(correction) {
    if (!((correction.original) || (correction.new) || (correction.current) || (correction.suggestions))) {
        //process 
        correction.children.forEach(function(correctionchild){
            if (correctionchild.type == "new") {
                correction.new = correctionchild.children;
            }
            if (correctionchild.type == "current") {
                correction.current = correctionchild.children;
            }
            if (correctionchild.type == "original") {
                correction.original = correctionchild.children;
            }
            if (correctionchild.type == "suggestion") {
                if (!correction.suggestions) correction.suggestions = [];
                correction.suggestions.push( correctionchild );
            }
        });
    }
    return correction;
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
            s = s.substr(0,s.length-13) + '..';
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
    if (data.sessions) {
        $('#connectioninfo').html("<span title=\"This is the number of people that are currently viewing/editing this document, yourself included\">" + data.sessions + "</span>");
    }
    if (data.elements) {
        reregisterhandler = false;
        data.elements.forEach(function(returnitem){
            if ((returnitem.html) && (returnitem.elementid)) { 
                var selector = $('#' + valid(returnitem.elementid));
                if (selector.length == 1) {
                    //structure exists
                    //update the existing elements
                    selector[0].outerHTML = returnitem.html;
                } else if (!havecontent) {
                    //structure does not exist yet and we we don't have content
                    //yet, add to main document
                    $('#document').append(returnitem.html);
                }
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
                reregisterhandlers = true;
            }
        });
        if (reregisterhandlers) registerhandlers();
        havecontent = true;
        if (function_exists(mode + '_onupdate')) {
            f = eval(mode + '_onupdate');
            f();
        }
    }
    if (data.aborted) {
        $('#aborted').show();
    }
}


function loadcontent(perspective, ids, start, end) {
    //get query depending on the perspective
    //  triggered on first page load and on change of perspective
    //
    $('#wait .msg').html("Obtaining document data...");
    $('#wait').show();
    $('#aborted').hide();

    havecontent = false; //global variable to indicate we have no content (anymore)
    annotations = {};
    $('#document').html(""); //clear document

    var query = "USE " + namespace + "/" + docid + " SELECT FOR";
    if (perspective == "document") {
        query += " ALL";
    } else if (ids) {
        for (i = 0; i < ids.length; i++) {
            if (i > 0) query += " ,";
            query += " ID " + ids[i];
        }
    } else {
        query += " " + perspective;
        if (start) {
            query += " START ID " + start;
        }
        if (end) {
            query += " ENDBEFORE ID " + end;
        }
    }
    query += " FORMAT flat";
    

    $.ajax({
        type: 'POST',
        url: "/" + namespace + "/"+ docid + "/query/",
        contentType: "application/json",
        //processData: false,
        headers: {'X-sessionid': sid },
        data: JSON.stringify( { 'queries': [query]}), 
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                alert("Received error from document server: " + data.error);
            } else {
                settextclassselector(data);
                update(data);
                if (function_exists(mode + '_contentloaded')) {
                    f = eval(mode + '_contentloaded');
                    f(data);
                }
                if (rtl) {
                    $('#document').css({'direction':'rtl'} );
                }
                $('#wait').hide();
            }
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            alert("Obtaining document data failed: " + req + " " + err + " " + exception);
        },
        dataType: "json"
    });
}

function settextclassselector(data) {
    $('#textclassselector').hide();
    if (data.textclasses) {
        if (data.textclasses.length > 1) {
            var s = "<span class=\"title\">Text class</span><select id=\"textclass\">";
            var found = false;
            var hascurrent = false;
            for (i = 0; i < data.textclasses.length; i++) { 
                if (textclass == data.textclasses[i]) {
                    found = true; 
                }
                if (data.textclasses[i] == 'current') {
                    hascurrent = true;
                }
            }
            if (!found) {
                if (hascurrent) {
                    textclass = "current";  
                } else {  
                    textclass = data.textclasses[0];
                }
            }
            for (i = 0; i < data.textclasses.length; i++) { 
                var extra ="";
                if (textclass == data.textclasses[i]) {
                    extra = " selected=\"selected\"";
                }
                s += "<option value=\"" + data.textclasses[i] + "\"" + extra + ">" + data.textclasses[i] + "</option>";
            }
            s += "</select>";
            $('#textclassselector').html(s);
            $('#textclassselector').show();
            $('#textclass').change(function(){
                textclass = $('#textclass').val();
                rendertextclass();
            });
        }
    }
}

$(document).mousemove( function(e) {
   mouseX = e.pageX; 
   mouseY = e.pageY;
});  

function rendertoc(tocitem, depth) {
    var opts = "<option value=\"div:" + tocitem.id + "\"";
    if ((perspective_ids) && (perspective_ids.indexOf(tocitem.id) != -1)) {
        opts += " selected=\"selected\">";
    } else {
        opts += ">";
    }
    opts += depth + tocitem.text + "</option>";
    if (tocitem.toc.length > 0) {
        tocitem.toc.forEach(function(subtocitem){
            opts += rendertoc(subtocitem, depth + "&horbar;");
        });
    }
    return opts;
}

function loadperspectivemenu() {
    var s = "<span class=\"title\">Perspective</span>";
    s += "<select id=\"perspectivemenu\">";
    var opts = "";
    if (perspectives.indexOf("document") != -1) {
        opts += "<option value=\"document\" ";
        if (perspective == "document") {
            opts += " selected=\"selected\">";
        } else {
            opts += ">";
        }
        opts += "Full Document</option>";
    }
    for (i = 0; i < perspectives.length; i++) {
        if ((perspectives[i] != "document") && (perspectives[i] != "toc")) {
            opts += "<option value=\"" + perspectives[i] + "\" ";
            if (perspective === perspectives[i]) {
                opts += " selected=\"selected\">";
            } else {
                opts += ">";
            }
            opts += annotationtypenames[perspectives[i]] + "</option>";
        }
    }
    if (perspectives.indexOf('toc') != -1) {
        opts += "<option value=\"\" style=\"font-weight: bold; font-style: italic;\">Table of contents</option>";
        toc.forEach(function(tocitem){
            opts += rendertoc(tocitem, "");
        });
    }
    s += opts;
    s += "</select>";
    s += "<div id=\"pager\"></div>";
    $('#perspective').html(s);
    if ((perspective !== "document") && (perspective_ids === null)) {
        loadpager();
    }

    $('#perspectivemenu').change(function(){
        var selected = $('#perspectivemenu').val();
        if (!selected) return;
        perspective_start = null;
        perspective_end = null;
        perspective_ids = null;
        if (selected == "document") {
            perspective = selected;
            $('#pager').hide();
        } else if (selected.substr(0,4) == "div:") {
            perspective = "div";
            perspective_ids = [selected.substr(4) ];
            $('#pager').hide();
        } else {
            perspective = selected;
            if ((slices[perspective]) &&  (slices[perspective].length > 1)) {
                perspective_end = slices[perspective][1];
            }
            //setup pager
            loadpager();
        }
        loadcontent(perspective, perspective_ids,null, perspective_end);
    });
}

function loadpager() {
    if (!slices[perspective]) {
        alert("Error: No slices available for perspective " + perspective + ". If you are the administrator, make sure to define this perspective in the slices in the configuration");
        return false;
    }
    var s = "<span>page:</span> <select id=\"pagemenu\">";
    for (i = 1; i <= slices[perspective].length; i++) {
        s += "<option value=\"" + i + "\">" + i + "</option>";
    }
    s += "</select>";
    $('#pager').html(s);

    $('#pager').show();
    $('#pagemenu').change(function(){
        var page = $('#pagemenu').val();
        var start = slices[perspective][page-1];
        var end = null;
        if (slices[perspective].length > page) {
            end = slices[perspective][page];
        }
        loadcontent(perspective, null, start, end);
    });
}

$(document).ajaxSend(function(event, xhr, settings) {
    //CSRF token support for jquery AJAX request to Django
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
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
        });
        return $(this).empty().append(op);
    });
    $(this).val(sel);
};

function bySortedValue(obj, callback, context) {
    var tuples = [];

    for (var key in obj) tuples.push([key, obj[key]]);

    tuples.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 }); //jshint ignore:line

    var length = tuples.length;
    while (length--) callback.call(context, tuples[length][0], tuples[length][1]);
}

function hideuploadform() {
    $('#uploadform').hide();
    return false;
}
function hideadddirectoryform() {
    $('#adddirectoryform').hide();
    return false;
}

function index_click() {
    $('#wait span.msg').html("Loading document on the server...<br/>(this may take a while for large documents)");
    $('#wait').show();
}

$(function() {
    if (typeof(mode) != "undefined") {
        $('nav>ul>li').mouseenter(function(){
            $('>ul',this).css('left', mouseX-30);
        });

        //loadtext(initialannotationlist);
        //loadannotations(initialannotationlist);
        loaddeclarations(initialdeclarationlist);
        registerhandlers();
        if ((namespace != "testflat")  || (docid == "manual")) {
            //get the data first of all (will take a while anyway)
            perspective = perspectives[0]; //set default perspective
            if ((slices[perspective]) && (slices[perspective].length > 1)) {
                perspective_start = slices[perspective][0];
                perspective_end = slices[perspective][1];
            }
            loadcontent(perspective, perspective_ids, perspective_start, perspective_end); 
        }
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
        $('#adddirectorybutton').click(function(){
            $('#adddirectoryform').show();
        });
        $('#canceladddirectory').click(function(){
            $('#adddirectoryform').hide();
            return false;
        });
    }
    if (closewait) $('#wait').hide();
});
