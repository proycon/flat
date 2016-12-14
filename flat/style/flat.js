// jshint evil:true

//A random session ID
var sid = ((Math.random() * 1e9) | 0); 

var havecontent = false; //we start assuming we have no content
var closewait = true; //close the wait mask when we are done loading
var textclass = "current"; //the default text class: "current"

var perspective = 'document'; //initial perspective (will be overriden from config in init anyway)
var perspective_ids = null;
var perspective_start = null;
var perspective_end = null;

var selector = ""; //structural element to select when clicking/hovering: empty selector selects deepest element (default)

var structure = {}; //structural items
var annotations = {}; //annotations per structure item
var latestannotations = {}; //latest annotations cache (annotationid -> true map), will be populated again by loadannotations()
var lateststructure = {}; //latest structure cache (structureid -> true map), will be populated again by loadstructure()
var declarations = {};
var docid = null;
var initialannotationlist = [];
var initialdeclarationlist = [];
var mouseX = 0;
var mouseY = 0;

var poll = true;

//************************************************************************************************************************************************************************

function function_exists(functionName) {
    //Test if a function exists
    if(eval("typeof(" + functionName + ") == typeof(Function)")) {
        return true;
    }
}



function hash(s){
  //Generic hash function
  if (s) {
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);  //jshint ignore:line
  }
  return 0;
}

function onfoliaclick() {
    //Called when an element (often a word) is clicked, delegates to *_onclick methods of the enabled mode
    if (function_exists(mode + '_onclick')) {
        if ((selector === "") || (selector == structure[this.id].type)) {
            var f = eval(mode + '_onclick');
            f(this);
            return false;
        }
    }
}
function onfoliadblclick() {
    //Called when an element (often a word) is double clicked, delegates to *_ondblclick methods of the enabled mode
    if (function_exists(mode + '_ondblclick')) {
        if ((selector === "") || (selector == structure[this.id].type)) {
            var f = eval(mode + '_ondblclick');
            f(this);
            return false;
        }
    }
}
function onfoliamouseenter() {
    //Called when an element (often a word) is entered with the cursor, delegates to *_mouseenter methods of the enabled mode
    if (function_exists(mode + '_onmouseenter')) {
        if ((selector === "") || (selector == structure[this.id].type)) {
            var f = eval(mode + '_onmouseenter');
            f(this);
            return false;
        }
    }
}
function onfoliamouseleave() {
    //Called when an element (often a word) is exited with the cursor, delegates to *_mouseleave methods of the enabled mode
    if (function_exists(mode + '_onmouseleave')) {
        if ((selector === "") || (selector == structure[this.id].type)) {
            var f = eval(mode + '_onmouseleave');
            f(this);
            return false;
        }
    }
}


function loadstructure(structureresponse) {
    //update structure data
    Object.keys(structureresponse).forEach(function(structureid){
        structure[structureid] = structureresponse[structureid];
        lateststructure[structureid] = true;
    });
    //old (deleted) structure may linger in memory but is no longer
    //referenced by other structure or other updated annotations
}

function loadtext(annotationresponse) {
    //reload text from the annotation data response back into the DOM structure, called by update()
    forlatestannotations(function(annotation){
        if ((annotation.type == "t") && (annotation.text) && (annotation.class == "current") && (annotation.auth)) {
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

function loadannotations(annotationresponse) {
    Object.keys(annotationresponse).forEach(function(annotationid){
        annotations[annotationid] = annotationresponse[annotationid];
        latestannotations[annotationid] = true;
    });
    //old (deleted) annotations may linger in memory but are no longer
    //referenced by structure or other updated annotations
}


function loaddeclarations(declarationlist) {
    //parse the metadata response and populate the declarations structure in memory, declarationlist is supplied through the server-side template on page load
    declarationlist.forEach(function(declaration){
        if (!declarations[declaration.annotationtype])  declarations[declaration.annotationtype] =  {};
        declarations[declaration.annotationtype][declaration.set] = { 'settype': 'open', 'classes': [] }; //this will hold proper set definitions later on
    });
}

function forstructure(callback) {
    Object.keys(structure).forEach(function(structure_id){
        callback(structure[structure_id]);
    });
}

function forlateststructure(callback) {
    Object.keys(lateststructure).forEach(function(structure_id){
        callback(structure[structure_id]);
    });
}

function forannotations(structure_id, callback) {
    /*  Calls a function for all annotations pertaining to a specific
     *  structural element, includes span annotations as well */
    if ((structure[structure_id]) && (structure[structure_id].annotations)) {
        structure[structure_id].annotations.forEach(function(annotation_id){
            if (annotations[annotation_id]) {
                callback(annotations[annotation_id]);
            }
        });
    }
}

function forsubstructure(structure_id, callback) {
    /*  Calls a function for all structural elements pertaining to a specific
     *  structural element */
    if ((structure[structure_id]) && (structure[structure_id].annotations)) {
        structure[structure_id].structure.forEach(function(sub_id){
            if (structure[sub_id]) {
                callback(structure[sub_id]);
            }
        });
    }
}


function forlatestannotations(structure_id, callback) {
    /*  Calls a function for all annotations pertaining to a specific
     *  structural element, includes span annotations as well. Only includes
     *  annotations that were returned in the latest response from server */
    if ((structure[structure_id]) && (structure[structure_id].annotations)) {
        structure[structure_id].annotations.forEach(function(annotation_id){
            if (latestannotations[annotation_id]) {
                callback(annotations[annotation_id]);
            }
        });
    }
}

function forallannotations(callback) {
    /*  Calls a function for all structure element and all annotations pertaining to the
     *  structural element, includes span annotations as well. */
    Object.keys(structure).forEach(function(structure_id){
        if (structure[structure_id].annotations) {
            structure[structure_id].annotations.forEach(function(annotation_id){
                if (annotations[annotation_id]) {
                    callback(structure[structure_id],annotations[annotation_id]);
                } else {
                    console.debug("Annotation " + annotation_id + " for structure " + structure_id + " is not defined");
                }
            });
        }
    });
}

function forspanannotations(structure_id, callback) {
    /* Calls a function for all span annotations layered in a structural element, NOT span
     * annotation applying over a structural element! */
    if ((structure[structure_id]) && (structure[structure_id].annotations)) {
        structure[structure_id].spanannotations.forEach(function(annotation_id){
            if (annotations[annotation_id]) {
                callback(annotations[annotation_id]);
            }
        });
    }
}

function foralllatestannotations(callback) {
    /*  Calls a function for all structure element and all annotations pertaining to the
     *  structural element, includes span annotations as well. Only includes
     *  annotations that were returned in the latest response from server */
    Object.keys(lateststructure).forEach(function(structure_id){
        if (structure[structure_id].annotations) {
            structure[structure_id].annotations.forEach(function(annotation_id){
                if (latestannotations[annotation_id]) {
                    callback(structure[structure_id],annotations[annotation_id]);
                }
            });
        }
    });
}

function rendertextclass() {
    //Renders the right text label based on the text class (current by default)
    forallannotations(function(structureelement, annotation){
        if ((annotation.type == "t") && (annotation.class == textclass)) {
            lbl = $('#' + valid(structureelement.id) + " span.lbl");
            if ((lbl.length == 1) && ($('#'  + valid(structureelement.id)).hasClass('deepest'))) {
                if (annotation.htmltext) {
                    lbl.html(annotation.htmltext);
                } else {
                    lbl.html(annotation.text);
                }
            }
        }
    });
    $('div.deepest>span.lbl').show();
    //Delegate to mode's callback function
    if (function_exists(mode + '_onrendertextclass')) {
        f = eval(mode + '_onrendertextclass');
        f();
    }
}

function setupcorrection(correction) {
    //TODO: refactor
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
    //Registers all event handlers on elements (mostly words)
    $('.F').off(); //prevent duplicates
    $('.F').click(onfoliaclick).dblclick(onfoliadblclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
}

function valid(id){
    //Validate a HTML DOM element ID  for use in javascript (dots need to be escaped)
    return id.replace(/\./g,'\\.');
}

function shorten(s) {
    //Shorten set URLs for presentation
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

function update(data, extracallback) {
    //Process data response from the server, does a partial update, called through loadcontent() on initialisation
    //

    latststructure = {}; //reset latest structure cache (structureid -> true map), will be populated again by loadstructure()
    latestannotations = {}; //reset latest annotations cache (annotationid -> true map), will be populated again by loadannotations()

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
                    //structure does not exist yet and we don't have content
                    //yet, add to main document
                    $('#document').append(returnitem.html);
                }
                //$('#' + valid(data.elementid)).attr('id',"replacing");
                //$('#replacing').html("...");
                //$('#replacing').after(data.html);
                //$('#replacing').remove();
            }
            if (returnitem.structure) {
                loadstructure(returnitem.structure);
            }
            if (returnitem.annotations) {
                loadannotations(returnitem.annotations);
                loadtext(returnitem.annotations);
            }
            if (returnitem.elementid) {
                //reregister handlers
                reregisterhandlers = true;
            }
        });
        if (reregisterhandlers) registerhandlers();
        havecontent = true;
        //Call mode-specific callback function for further processing
        if (function_exists(mode + '_onupdate')) {
            f = eval(mode + '_onupdate');
            f();
        }
        if (extracallback) {
            extracallback();
        }
    }
    if (data.aborted) {
        //If not all data could be loaded, show a note to that effect
        $('#aborted').show();
    }
}


function loadcontent(perspective, ids, start, end, extracallback) {
    //Formulates and submits an FQL query to the backend to retrieve the
    //content, depending on the perspective
    //  Triggered on first page load and on change of perspective/page
    //
    $('#wait .msg').html("Obtaining document data...");
    $('#wait').show();
    $('#aborted').hide();

    havecontent = false; //global variable to indicate we have no content (anymore)
    annotations = {}; //clear all annotations in memory
    $('#document').html(""); //clear document

    //Formulate FQL query
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


    //Submit to backend
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
                update(data, extracallback); //main function to  update all elements according to the data response

                //Delegate to mode-specific callbacks
                if (function_exists(mode + '_contentloaded')) {
                    f = eval(mode + '_contentloaded');
                    f(data);
                }
                if (rtl) {
                    //Trigger right-to-left presentation for languages such as Arabic, Hebrew, Farsi,
                    //rtl is set based on FoLiA metadata
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
    //Populate the text class selector and render text classes
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
    //Render Table of Contents in perspectivemenu (called by loadperspectivemenu())
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
    //Create and populate the perspective menu and pager
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
            opts += folia_label(perspectives[i]) + "</option>";
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

function selectorchange(){
    selector = $('#selectormenu').val(); 
}

function loadselectormenu() {
    var s = "<span class=\"title\">Selector</span>";
    s += "<select id=\"selectormenu\">";
    if (selector === "") { 
        s += "<option value=\"\" selected=\"selected\">Automatic (deepest)</option>";
    } else {
        s += "<option value=\"\">Automatic (deepest)</option>";
    }
    folia_structurelist().forEach(function(structuretype){
        var label = structuretype;
        if (folia_label(structuretype)) {
            label = folia_label(structuretype);
        }
        if (selector == structuretype) { 
            s += "<option value=\"" + structuretype + "\" selected=\"selected\">"  + label + "</option>";
        } else {
            s += "<option value=\"" + structuretype + "\">"  + label + "</option>";
        }
    });
    s += "</select>";
    $('#selector').html(s);
    $('#selectormenu').off();
    $('#selectormenu').change(selectorchange);
}

function onpagechange(){
    //callback function called after on page change has been complete
    if (function_exists(mode + '_onpagechange')) {
        f = eval(mode + '_onpagechange');
        f();
    }
}

function loadpager() {
    //Create and populate the pager, to page through multiple pages of the
    //document (called by loadperspectivemenu())
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
        loadcontent(perspective, null, start, end, onpagechange);
    });
}



$(document).ajaxSend(function(event, xhr, settings) {
    //Generic AJAX send function, with
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
    //Generic alphabetic sort function for option elements in select
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
    //Generic sort by value function
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

function submitfilemanager(filemanmode) {
    //Submit a file management operation (sets a mode and submits the HTML form)
    $('#filemanmode').val(filemanmode);
    $('#filemanform').submit();
}

function auto_grow(element) {
    //Generic auto-grow function for elements
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}


function sort_targets(targets) {
    //Sort a list of target IDs (words only) so that they are in proper order of appearance
    var sameparent = false;
    if ((targets.length > 0) && (structure[targets[0]]) && (structure[targets[0]].parent) && (structure[structure[targets[0]].parent].structure)) {
        sameparent = structure[targets[0]].parent;
        for (var i = 1; i < targets.length; i++) {
            if (structure[targets[0]].parent != sameparent) {
                sameparent = false;
                break;
            }
        }
    }
    var sortedtargets = [];
    if (sameparent) {
        //sort targets by looking at the word order for the parent element
        for (var j = 0; j < structure[sameparent].structure.length; j++) {
            if (targets.indexOf(structure[sameparent].structure[j]) > -1) {
                sortedtargets.push(structure[sameparent].structure[j]);
            }
        }
    } else { 
        //fallback: sort targets by simply looking at the order they are rendered in  the interface
        $('.w').each(function(){
            if (targets.indexOf(this.id) > -1) {
                sortedtargets.push(this.id);
            }
        });
    }
    if (sortedtargets.length != targets.length) {
        throw "Error, unable to sort targets, expected " + targets.length + ", got " + sortedtargets.length;
    }
    return sortedtargets;
}

function escape_fql_value(v) {
    //Escape values in FQL
    return v.replace(/"/g,'\\"').replace(/\n/g,"\\n");
}

$(function() {
    //on page load
    //
    //clear any wait screens (needed when user pressed back in browser)
    $('#wait').hide();
    if (typeof(mode) != "undefined") {
        folia_parse(foliaspec, []);

        $('nav>ul>li').mouseenter(function(){
            $('>ul',this).css('left', mouseX-30);
        });

        //Load the declarations, set definitions
        loaddeclarations(initialdeclarationlist);
        //Register handlers for all elements
        registerhandlers();
        if ((namespace != "testflat")  || (docid == "manual")) {
            //get the data first of all (will take a while anyway)
            perspective = perspectives[0]; //set default perspective
            if ((slices[perspective]) && (slices[perspective].length > 1)) {
                perspective_start = slices[perspective][0];
                perspective_end = slices[perspective][1];
            }
            //Request content to be loaded (will be a call to server) and eventually calls update()
            loadcontent(perspective, perspective_ids, perspective_start, perspective_end);
        }
        //Delegate to mode-specific callback
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
