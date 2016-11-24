var viewannotations = {}; //view local annotations in editor
var viewglobannotations = {}; //view global annotations
var paintedglobannotations = {}; //target => bool,  target ids for which global annotations have been painted
var annotationfocus = null;
var annotatordetails = false; //show annotor details
var showoriginal = false; //show originals instead of corrections
var showdeletions = false; //show deletions
var hover = null;
var globannotationsorder = ['entity','semrole','coreferencechain','su','dependency','sense','pos','lemma','chunk']; //from top to bottom
var hoverstr = null; //ID of string element we're currently hovering over
var suggestinsertion = {}; //holds suggestions for insertion: id => annotation  , for use in the editor
var NROFCLASSES = 7; //number of coloured classes
var searchsubmitted = false;


function sethover(element) {
    if ((element) && (((selector !== "") && ($(element).hasClass(selector))) || ((selector === "") && ($(element).hasClass('deepest')))) ) {
        if (hover) $(".hover").removeClass("hover");
        $(element).addClass("hover");
        hover = element;
        if ($(element).hasClass('focustype')) {
            //colour related elements
            forannotations(element.id, function(annotation){
                if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set) && (annotation.scope.length > 1)) {
                    annotation.scope.forEach(function(target){
                        $('#' + valid(target)).addClass("hover");
                    });
                }
            });
        }
    }
}


function toggleannotatordetails() {
    annotatordetails = !annotatordetails;
    if (annotatordetails) {
        $('#toggleannotatordetails').addClass("on");
    } else {
        $('#toggleannotatordetails').removeClass("on");
    }
}

function toggledeletions() {
    showdeletions = !showdeletions;
    if (showdeletions) {
        $('#toggledeletions').addClass("on");
    } else {
        $('#toggledeletions').removeClass("on");
    }
    renderdeletions();
}

function renderdeletions() { //and suggested insertions
    $('.deleted').remove();
    $('.suggestinsertion').remove();
    if (showdeletions) {
        forallannotations(function(structureelement, annotation){
                var c;
                var s;
                var textblob = "";
                var originalid = "";
                var originaltype = "";
                if ((annotation.type == 'correction') && (annotation.original) && (annotation.specialtype=='deletion' )) {
                    //check if the deletion has a colored class
                    if ((classrank) && (classrank[annotation.class])) {
                        c = ' class' + classrank[annotation.class];
                    }                                
                    //find original text
                    annotation.original.forEach(function(original_id){
                        //is the correction structural?
                        if (annotation.structural) {
                            var original = structure[original_id];
                            //find text belonging to original structural element
                            forannotations(original_id,function(annotation2){
                                if (annotation2.type == "t") {
                                    if (textblob) textblob += " ";
                                    textblob += annotation2.text;
                                }
                            });
                            if ((!originaltype) && (folia_isstructure(original.type))) {
                                originaltype = original.type;
                                originalid = original.id;
                            }
                        } else {
                            //non-structural correction
                            var original = annotations[original_id];
                            if (original.text) {
                                if (textblob) textblob += " ";
                                textblob += original.text;
                            }
                        }
                    });                        
                    s = '<div id="'  + originalid + '" class="F ' + originaltype + ' deepest deleted' + c +'"><span class="lbl" style="display: inline;">' + textblob + '&nbsp;</span></div>';
                    if (annotation.previous) { //TODO: does this still work after refactor?
                        $('#' + valid(annotation.previous)).after(s);
                    } else if (annotation.next) {
                        $('#' + valid(annotation.next)).before(s);
                    }
                    $('#' + valid(originalid)).click(onfoliaclick).dblclick(onfoliadblclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
                } 
                if ((annotation.type == 'correction') && (annotation.specialtype=='suggest insertion' )) {
                    if ((classrank) && (classrank[annotation.class])) {
                        c = ' class' + classrank[annotation.class];
                    }                                
                    annotation.suggestions.forEach(function(suggestiontuple){
                        suggestiontuple.forEach(function(suggestion_id){
                            if ((annotation.structural) && (!suggestiontype)) {
                                var suggestion = structure[suggestion_id];
                                suggestiontype = suggestion.type;
                                suggestionid = suggestion.id;
                                forannotations(suggestion_id,function(annotation2){
                                    if (annotation2.type == "t") {
                                        if (textblob) textblob += " ";
                                        textblob += annotation2.text;
                                    }
                                });
                            }
                        });                        
                        return; //first suggestion only
                    });                        
                    s = '<div id="'  + suggestionid + '" class="F ' + suggestiontype + ' deepest suggestinsertion' + c +'"><span class="lbl" style="display: inline;">' + textblob + '&nbsp;</span></div>';
                    if (annotation.previous) {
                        $('#' + valid(annotation.previous)).after(s);
                    } else if (annotation.next) {
                        $('#' + valid(annotation.next)).before(s);
                    }
                    $('#' + valid(suggestionid)).click(onfoliaclick).dblclick(onfoliadblclick).mouseenter(onfoliamouseenter).mouseleave(onfoliamouseleave);
                    suggestinsertion[suggestionid] = annotation;
                }
        });

    }
}

function toggleoriginal() {
    showoriginal = !showoriginal;
    if (showoriginal) {
        $('#toggleoriginal').addClass("on");
        forallannotations(function(structureelement, annotation){
                if ((annotation.type == 'correction') && (annotation.original)) {
                    var textblob = "";
                    var originalid = "";
                    //find original text
                    annotation.original.forEach(function(original_id){
                        //is the correction structural?
                        if (annotation.structural) {
                            var original = structure[original_id];
                            //find text belonging to original structural element
                            forannotations(original_id,function(annotation2){
                                if (annotation2.type == "t") {
                                    if (textblob) textblob += " ";
                                    textblob += annotation2.text;
                                }
                            });
                            if ((original.type == 'w') && (originalid === "")) originalid = original.id;
                        } else {
                            //non-structural correction
                            var original = annotations[original_id];
                            if (original.text) {
                                if (textblob) textblob += " ";
                                textblob += original.text;
                            }
                        }
                    });                        

                    if (structureelement.type == 'w') {
                        $('#' + valid(structureelement.id) + ' span.lbl').html(textblob);
                    } else if (structureelement.type == 's') {
                        if (annotation.new.length > 0)  {
                            if ((structural) && ($('#' + valid(annotation.new[0])).hasClass('w'))) {
                                $('#' + valid(annotation.new[0]) + ' span.lbl').html(textblob);
                            } else {
                                //MAYBE TODO: no solution for non-structural text corrections on higher-levels?
                            }
                        } else {
                            //must be a deletion, show
                            if (structureelement.previousword) {
                                //check if the deletion has a colored class
                                var c = '';
                                if (classrank[annotation.class]) {
                                    c = ' class' + classrank[annotation.class];
                                }                                
                                $('#' + valid(structureelement.previousword)).after('<div id="'  + originalid + '" class="F w deepest deleted' + c +'"><span class="lbl" style="display: inline;">' + textblob + '&nbsp;</span></div>');
                            }
                        }
                    }

                }
        });
    } else {
        $('#toggleoriginal').removeClass("on");
        window.location.href = ''; //reload page
    }
}

function viewer_onmouseenter(element) {
    sethover(element);
    showinfo(element);
}


function getspantext(annotation, explicit) {
    if (annotation === undefined) {
        throw "Undefined annotation passed";
    }
    var spantext= "";
    var targets;
    if (explicit) {
        targets = annotation.targets;
    } else {
        targets = annotation.scope;
    }
    if (targets === undefined) {
        console.debug(annotation);
        throw "Invalid annotation; defines no targets/scope! ";
    } 
    targets = sort_targets(targets);
    targets.forEach(function(target){
        forannotation(target,function(annotation2){
                if ((annotation2.type == "t") && (annotation2.class == "current")) {
                    if (spantext) spantext += " ";
                    spantext += annotation2.text;
                }
        });
    });
    return spantext;
}

function getclasslabel_helper(c, key) {
    var label = key;
    c.subclasses.forEach(function(subc){
        if (label != key) return;
        if (subc.id == key) {
            label = subc.label;
            return;
        }
        label = getclasslabel_helper(subc, key);
        if (label != key) return;
    });
    return label;
}

function getclasslabel(set, key) {
    var label = key;
    if (setdefinitions[set]) {
        if (setdefinitions[set].classes[key]) {
            return setdefinitions[set].classes[key].label;
        } else {
            Object.keys(setdefinitions[set].classes).forEach(function(c){
                if (label != key) return;
                label = getclasslabel_helper(setdefinitions[set].classes[c], key);
                if (label != key) return;
            });
        }
    }
    return label;
}

function rendercorrection(correctionid, addlabels, explicitnew) {
    //pass either an ID or an annotation element
    //TODO: refactor!!!
    var s = "";
    var correction = annotations[correctionid];
    if ((viewannotations[correction.type+"/"+correction.set])) {
        s = s + "<div class=\"correction\"><span class=\"title\">Correction: ";
        if (correction.class) s = s + "<em>" + correction.class + "</em>";
        s = s + "</span>";
        if (annotatordetails && correction.annotator) {
            s = s + "<br/><span class=\"annotator\">" + correction.annotator + " (" + correction.annotatortype + ")</span>";
            if (correction.datetime) {
                s = s + "<br/><span class=\"datetime\">" + correction.datetime +"</span>";
            }
        }
        if (correction.confidence) {
            s = s + "<br/><span class=\"confidence\">Confidence " + (correction.confidence * 100) +"%</span>";
        }
        if (correction.specialtype) {
            s = s + "<span class=\"specialtype\">(" + correction.specialtype;
            if (correction.suggestmerge) {
                s = s + " and merge with next structure";
            } else if (correction.suggestsplit) {
                s = s + " and split structure at this point";
            }
            s = s + ")</span>";
        }
        if ((correction.suggestions) || (correction.original) || (explicitnew && correction.new || correction.current)) {
            s = s + "<table>";
        }
        if (explicitnew) {
            if ((correction.new) && (correction.new.length > 0)) {
                correction.new.forEach(function(new_id){
                    if (viewannotations[e.type+"/"+e.set]) {
                        s = s + "<tr><th>New";
                        if (addlabels) {
                            s = s + " " + folia_label(e.type, e.set);
                        }
                        s = s + ":</th><td> ";
                        s = s +  "<div class=\"correctionchild\">";
                        s = s + renderannotation(e,true);
                        s = s + "</div></td></tr>";
                    }
                });
            }
            if ((correction.current) && (correction.current.length > 0)) {
                correction.current.forEach(function(e){
                    if (viewannotations[e.type+"/"+e.set]) {
                        s = s + "<tr><th>Current";
                        if (addlabels) {
                            s = s + " " + folia_label(e.type, e.set);
                        }
                        s = s + ":</th><td> ";
                        s = s +  "<div class=\"correctionchild\">";
                        s = s + renderannotation(e,true);
                        s = s + "</div></td></tr>";
                    }
                });
            }
        }
        if ((correction.original) && (correction.original.length > 0)) {
            correction.original.forEach(function(original){
                if (viewannotations[original.type+"/"+original.set]) {
                    s = s + "<tr><th>Original";
                    if (addlabels) {
                        s = s + " " + folia_label(original.type, original.set);
                    }
                    s = s + ":</th><td> ";
                    s = s +  "<div class=\"correctionchild\">";
                    s = s + renderannotation(original,true);
                    s = s + "</div></td></tr>";
                }
            });
        }
        if ((correction.suggestions) && (correction.suggestions.length > 0)) {
            correction.suggestions.forEach(function(suggestion){
                s = s + "<tr><th>Suggestion:</th><td>";
                if ((suggestion.n) || (suggestion.confidence)) s = s + "<span class=\"suggestiondetails\">";
                if (suggestion.n) s = s + "N: " + suggestion.n + " ";
                if (suggestion.confidence) s = s + "Confidence: " + suggestion.confidence;
                if ((suggestion.n) || (suggestion.confidence)) s = s + "</span>";
                s = s +  "<div class=\"correctionchild\">";
                suggestion.children.forEach(function(child){
                    s  = s + "<table>";
                    label = folia_label(child.type, child.set);
                    s = s + "<tr><th>" + label + "</th><td>";
                    s = s +  renderannotation(child,true);
                    s = s + "</td></tr>";
                    if ((folia_isstructure(child.type)) && (child.children)) {
                        child.children.forEach(function(subchild){
                            s = s + "<tr><th>" + folia_label(subchild.type, subchild.set) + "</th><td>";
                            s = s + renderannotation(subchild,true);
                            s = s + "</td></tr>";
                        });
                    }
                    s = s + "</table>";
                });
                s = s + "</div></td></tr>";
            });
        }
        if ((correction.suggestions) || (correction.original)) {
            s = s + "</table>";
        }
        s = s + "</div>";
    }
    return s;
}

function checkparentincorrection(annotation, correctionid) {
    //TODO: refactor!!
    var parentincorrection = false;
    annotation.scope.forEach(function(t){
        Object.keys(annotations[t]).forEach(function(aid) {
            var a = annotations[t][aid];
            if (aid == 'self') {
                //alert(t + ": '" + a.incorrection + "' vs '" + annotation.incorrection + "'");
                if ((a.incorrection) && (a.incorrection[0] == annotation.incorrection[0]))  {
                    parentincorrection = t;
                }
            }
        });
    });
    return parentincorrection;
}


function renderspanrole(spanroledata) {
    return "<br/><label class=\"spanrole\">" + folia_label(spanroledata.type) + ":</label> <span class=\"text\">" + getspantext(spanroledata) + "</span>";
}

function renderannotation(annotation, norecurse) {
    //renders the annotation in the details popup
    var s = "";
    if (!((annotation.type == "t") && (annotation.class == "current"))) {
        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type != "open") && (setdefinitions[annotation.set].classes[annotation.class]) ) {
            s = s + "<span class=\"class\">" +  setdefinitions[annotation.set].classes[annotation.class].label + "</span>";
        } else if (annotation.class) {
            s = s + "<span class=\"class\">" + annotation.class + "</span>";
        }
    }
    if (annotation.span) {
        if (folia_accepts_class(foliatag2class[annotation.type],'WordReference')) {
            s = s + "<br /><span class=\"text\">" + getspantext(annotation) + "</span>";
        }
        if ((annotation.children) && (annotation.children.length > 0)) {
            for (var i = 0; i < annotation.children.length; i++) {
                if ((annotation.children[i].type) && (folia_isspanrole(annotation.children[i].type))) {
                    s = s + renderspanrole(annotation.children[i]);
                }
            }
        }
    }
    if (annotation.type == "t") {
        if (annotation.class != "current") s = s + "<br />";
        s = s + "<span class=\"text\">" + annotation.text + "</span>";
    }
    if (annotatordetails && annotation.annotator) {
        s = s + "<br/><span class=\"annotator\">" + annotation.annotator + " (" + annotation.annotatortype + ")</span>";
        if (annotation.datetime) {
            s = s + "<br/><span class=\"datetime\">" + annotation.datetime +"</span>";
        }
    }
    if (annotation.confidence) {
        s = s + "<br/><span class=\"confidence\">Confidence " + (annotation.confidence * 100) +"%</span>";
    }
    if (annotation.type == "str") {
        s = s + "<div class=\"strinfo\">";
        s = s + "<span class=\"id\">" + annotation.annotationid + "</span>";
        annotation.children.forEach(function(subannotation){
            if (subannotation.type) { //filter out invalid elements
            if (subannotation.type != "correction") {
                s  = s + "<table>";
                label = folia_label(subannotation.type, subannotation.set);
                if (subannotation.set) {
                    setname = subannotation.set;
                } else {
                    setname = "";
                }
                if (setname == "undefined") setname = "";
                s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
                s = s + renderannotation(subannotation);
                s = s + "</td></tr>";
                s = s + "</table>";
            } else {
                //correction
                s = s + rendercorrection( setupcorrection(subannotation), true, true);
            }
            }
        });
        s = s + "</div>";
    }
    if (annotation.children) {
        //Render higher order annotation
        for (var i = 0; i < annotation.children.length; i++) {
            if (annotation.children[i].type) {
                if ((annotation.children[i].type == "comment") || (annotation.children[i].type == "desc")) {
                    s = s + "<br/><span class=\"higherorder\">" + folia_label(annotation.children[i].type) + ": " + annotation.children[i].value + "</span>";
                } else if (annotation.children[i].type == "feat") {
                    s = s + "<br/><span class=\"higherorder\">" + folia_label(annotation.children[i].type) + " " + folia_subset_label(annotation.set, annotation.children[i].subset) + ": <span class=\"class\">" + folia_feature_label(annotation.set, annotation.children[i].subset, annotation.children[i].class) + "</span></span>";
                }
            }
        }
    }
    var renderedcorrections = [];
    if ( (annotation.incorrection) && (annotation.incorrection.length > 0) && (!norecurse)) {
        //is this item part of a correction? if so, deal with it
        annotation.incorrection.forEach(function(correctionid){
            //is it really this item or is the entire parent part of the
            //correction? in the latter case we don't want to display a correction
            //here
            if (!checkparentincorrection(annotation, correctionid)) {
                renderedcorrections.push(correctionid);
                if (corrections[correctionid]) {
                    s = s + rendercorrection( correctionid, true);
                }
            }
        });
    }
    if (annotation.hassuggestions)  {
        annotation.hassuggestions.forEach(function(correctionid){
            if (renderedcorrections.indexOf(correctionid)==-1) {
                if (corrections[correctionid]) {
                    s = s + rendercorrection( correctionid, true);
                }
            }
        });
    }
    return s;
}

function showinfo(element) {
    /* Populate and show the pop-up info box with annotations for the element under consideration */
    if ((element) && (((selector !== "") && ($(element).hasClass(selector))) || ((selector === "") && ($(element).hasClass('deepest')))) ) {
        if (element.id)  {
            var s = "";
            var structureelement = structure[element.id];
            if (structureelement) {            
                s = "<div id=\"id\">" + folia_label(structureelement.type, structureelement.set) + " &bull; " + structureelement.id + " &bull; " + structureelement.class + "</div><table>";
                forannotations(element.id,function(annotation){
                    if ((annotation.type != 'str') || ((annotation.type == 'str') && (annotation.id == hoverstr))) { //show strings too but only if they are hovered over
                        if ((viewannotations[annotation.type+"/" + annotation.set]) && (annotation.type != "correction")) { //corrections get special treatment
                                var label = folia_label(annotation.type, annotation.set);
                                var setname = "";
                                if (annotation.set) {
                                    setname = annotation.set;
                                }
                                if (setname === "undefined") setname = "";
                                s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
                                s = s + renderannotation(annotation);
                                s = s + "</td></tr>";
                        }
                    }
                });
                s = s + "</table>";
                if (structureelement.incorrection) {
                    s = s + rendercorrection( structureelement.incorrection, true);
                }
            } else if ($(element).hasClass('deleted')) {
                s = "<div id=\"id\"> " + element.id + "</div>";
                s += "<span class=\"specialdeleted\">Deleted structure</span>";
                s += "<table><tr><th>Text</th><td>" + $(element).find('.lbl').html() + "</td></tr></table>";
            } else if ($(element).hasClass('suggestinsertion')) {
                s = "<div id=\"id\">" + element.id + "</div>";
                s += "<span class=\"specialinsertion\">Suggestion for insertion</span>";
                s += "<table><tr><th>Text</th><td>" + $(element).find('.lbl').html() + "</td></tr></table>";
            }
            if (s) {
                $('#info').html(s);
                if (mouseX < $(window).width() / 2) {
                    $('#info').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX} );
                } else {
                    $('#info').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX - $('#info').width() } );
                }
                $('#info').show();    
            }
        }
    }
}


function toggleannotationview(annotationtype, set) {
    viewannotations[annotationtype+"/"+set] = !viewannotations[annotationtype+"/"+set];
    if (viewannotations[annotationtype+"/" + set]) {
        $('#annotationtypeview_' + annotationtype + "_" + hash(set)).addClass('on');
    } else {
        $('#annotationtypeview_' + annotationtype + "_" + hash(set)).removeClass('on');
    }
}


function toggleglobannotationview(annotationtype, set) {
    viewglobannotations[annotationtype+"/"+set] = !viewglobannotations[annotationtype+"/"+set];
    if (viewglobannotations[annotationtype+"/" + set]) {
        $('#globannotationtypeview_' + annotationtype + "_" + hash(set)).addClass('on');
    } else {
        $('#globannotationtypeview_' + annotationtype + "_" + hash(set)).removeClass('on');
    }
    $('span.ab').css('display','none'); 
    $('span.ab').html("");
    renderglobannotations(true);
}

function resetglobannotationview() {
    $('#globannotationsviewmenu li').removeClass('on');
    viewglobannotations = {};
    $('span.ab').css('display','none'); 
    $('span.ab').html("");
    renderglobannotations(true);
}


function setannotationfocus(t,set) {
    if (annotationfocus) {
        $('.focustype').removeClass("focustype");
        $('#annotationsfocusmenu li').removeClass('on');
        removeclasscolors();
    }
    if (t && set) {
        annotationfocus = { 'type': t, 'set': set };
        $('#annotationtypefocus_' + annotationfocus.type + "_" + hash(annotationfocus.set)).addClass('on');
        forallannotations(function(structureelement, annotation){
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set)) {
                if ($('#' + valid(target)).hasClass('w')) {
                    $('#' + valid(target)).addClass("focustype");
                }
            }
        });
        if (annotationfocus.type != 't') {
            setclasscolors();
        } else {
            $('.focustype').addClass('undofocustype');
        }
        if (annotationfocus.type == 'correction') {
            showdeletions = true;
            renderdeletions();
        }
    } else {
        if ((annotationfocus) && (annotationfocus.type == 'correction')) {
            showdeletions = false;
            renderdeletions(); //will delete the ones shown
        }
        annotationfocus = null;
    }
}


function removeclasscolors(toggle) {
    for (var i = 1; i <= NROFCLASSES; i++) {
        $('.class' + i).removeClass('class' + i);
    }
    $('.focustype').removeClass('focustype');
    $('.undofocustype').removeClass('undofocustype');
    if (toggle) {
        s = "<span class=\"title\">Legend</span>"; //text for legend
        s = s + "(<a href=\"javascript:setannotationfocus('"+ annotationfocus.type +"','" + annotationfocus.set + "')\">Show</a>)<br />";
        $('#legend').html(s);
    } else {
        $('#legend').hide();
    }
}

function computeclassfreq() {
    /* Compute class frequency for the annotationfocus */
    var classfreq = {};
    forallannotations(function(structureelement,annotation){
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set) && (annotation.class)) {
                if (classfreq[annotation.class]) {
                    classfreq[annotation.class]--; //reverse for sorting later
                } else {
                    classfreq[annotation.class] = -1; //reverse for sorting later
                }
            }
    });
    return classfreq;
}

function setclasscolors() {
    //count class distribution
    
    var legendtype = annotationfocus.type;
    var legendset = annotationfocus.set;
    var legendtitle = folia_label(legendtype, legendset);
    var classfreq = computeclassfreq();

    s = "<span class=\"title\">Legend &bull; " + legendtitle + "</span>"; //text for legend
    s = s + "(<a href=\"javascript:removeclasscolors(true)\">Hide</a>)<br />";
    classrank = {};
    currentrank = 1;
    bySortedValue(classfreq, function(key, val){
        if (currentrank <= NROFCLASSES) {
            classrank[key] = currentrank;
            var keylabel = getclasslabel(legendset, key);
            s = s + "<div id=\"class" + currentrank + "legend\" class=\"colorbox\"></div><span>" + keylabel + "</span><br />";
            currentrank++;
        } else {
            classrank[key] = 'other';
        }
    });


    Object.keys(annotations).forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationkey){
            annotation = annotations[target][annotationkey];
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set) && (annotation.class)) {
                if (classrank[annotation.class]) {
                    if ($('#' + valid(target)).hasClass('w')) {
                        $('#' + valid(target)).addClass('class' + classrank[annotation.class]);
                    }
                    if (($('#' + valid(target)).hasClass('s')) && (annotation.type == 'correction')) {
                        if (annotation.new.length === 0) {
                            //a deletion occurred
                        } else {
                            annotation.new.forEach(function(newtarget) {
                                if (newtarget.type == 'w') {
                                    $('#' + valid(newtarget.id)).addClass('class' + classrank[annotation.class]);
                                }
                            });
                        }
                        if (annotation.current.length > 0) {
                            annotation.current.forEach(function(newtarget) {
                                if (newtarget.type == 'w') {
                                    $('#' + valid(newtarget.id)).addClass('class' + classrank[annotation.class]);
                                }
                            });
                        }
                    }
                }
            }
        });
    });

    $('#legend').html(s);
    $('#legend').show();
}

function showdeletions() {
    //remove all deletions
    $('.deletion').remove();
    
}

function partofspanhead(annotation, target) {
    var partofhead = false;
    if (annnotation.children) {
        annotation.children.forEach(function(child) {
            if (child.type == "hd") {
                if (child.words.indexOf(target) != -1) {
                    partofhead = true;
                }
            }
        });
    }
    return partofhead;
}


function renderglobannotations(all) {
    if ((all !== undefined) && (all)) {
        annotations_base = annotations;
    } else {
        annotations_base = latestannotations;
    }

    var globalannotations = 0;
    Object.keys(viewglobannotations).forEach(function(annotationtypeset){
      if (viewglobannotations[annotationtypeset]) globalannotations += 1;
    });

    if (globalannotations) {
        var containers = {};
        Object.keys(annotations_base).forEach(function(target){
            var targetabselection = null;
            if (paintedglobannotations[target]) {
                targetabselection = $('#' + valid(target) + " span.ab");
                targetabselection.css('display','none'); //we clear on this level 
                targetabselection.html("");
                paintedglobannotations[target] = false;
            }
            //var changed = false;
            $(globannotationsorder).each(function(annotationtype){ //ensure we insert types in the desired order
                annotationtype = globannotationsorder[annotationtype];
                Object.keys(annotations_base[target]).forEach(function(annotationkey){
                    if (annotationkey != "self") {
                        var annotation = annotations[target][annotationkey];
                        if ((annotation.type == annotationtype) && (viewglobannotations[annotation.type + '/' + annotation.set])) {
                                //changed = true;
                                var s = "";
                                if (annotation.class) {
                                    s = "<span class=\""+annotation.type+"\">" + annotation.class + "</span>";
                                } else {
                                    s = "<span class=\""+annotation.type+"\">?</span>";
                                }
                                if (annotation.span) {
                                        var extra = "";
                                        var usecontext = true;
                                        if (annotation.type == "dependency") {
                                            //for dependencies we point from the dependents to the head.
                
                                            //grab the head
                                            var headtext = "";
                                            var partofhead = partofspanhead(annotation, target);
                                            if (annotation.children) {
                                                annotation.children.forEach(function(child) {
                                                    if (child.type == "hd") {
                                                        headtext = getspantext(child);
                                                    }
                                                });
                                            }
                                            if (partofhead) { //if we're part of the head, we don't render this annotation here
                                                usecontext = false;
                                                s = "<span class=\""+annotation.type+"\">HD&Leftarrow;" + annotation.class + "</span>";
                                            } else {
                                                extra = "&Rightarrow;<span class=\"headtext\">" + headtext + "</span>";
                                            }
                                        }

                                        if (usecontext) {
                                            var previnspan = false;
                                            var nextinspan = false;
                                            //If the previous word is in the same
                                            //span we do not repeat it explicitly
                                            //but draw a line
                                            var prevwordid = annotations[target].self.previousword;
                                            if ((annotations[prevwordid]) && (annotations[prevwordid][annotationkey])) {
                                                var prevannotation = annotations[prevwordid][annotationkey];
                                                if ((prevannotation.class == annotation.class) && (prevannotation.layerparent == annotation.layerparent)) {
                                                    //previous word part of span already
                                                    if ((annotation.type != "dependency") || (!partofspanhead(prevannotation, prevwordid))) { //for dependencies we're only interested in dependents
                                                        previnspan = true;
                                                    }
                                                }
                                            }

                                            //is the next word still part of the span?
                                            var nextwordid = annotations[target].self.nextword;
                                            if ((annotations[nextwordid]) && (annotations[nextwordid][annotationkey])) {
                                                var nextannotation = annotations[nextwordid][annotationkey];
                                                if ((nextannotation.class == annotation.class) && (nextannotation.layerparent == annotation.layerparent)) {
                                                    if ((annotation.type != "dependency") || (!partofspanhead(nextannotation, nextwordid))) { //for dependencies we're only interested in dependents
                                                        nextinspan = true;
                                                    }
                                                }
                                            }

                                            if ((previnspan) && (nextinspan)) {
                                                s = "<span class=\""+annotation.type+"\" style=\"text-align: center\">&horbar;</span>";
                                            } else if (nextinspan) {
                                                s = "<span class=\""+annotation.type+"\">&lang;" + annotation.class + extra + "</span>";
                                            } else if (previnspan) {
                                                s = "<span class=\""+annotation.type+"\" style=\"text-align: right\">&horbar;&rang;</span>";
                                            } else {
                                                s = "<span class=\""+annotation.type+"\">&lang;" + annotation.class + extra + "&rang;</span>";
                                            }
                                        }


                                        //this is a complex annotatation that
                                        //may span multiple lines, build a
                                        //container for it. All containers will
                                        //have the same height so content can
                                        //be aligned.
                                        var containerkey = annotation.type + "/" + annotation.set + "/" + annotation.layerparent;
                                        if (!containers[containerkey]) {
                                            containers[containerkey] = [];
                                        }
                                        var slot = -1;
                                        //find the slot used before
                                        for (var j = 0; j < containers[containerkey].length; j++) {
                                            if (containers[containerkey][j].annotation.id === annotation.id) {
                                                slot = containers[containerkey][j].slot;
                                            }
                                        }
                                        if (slot == -1) {
                                            //find the first free slot
                                            slot = 0;
                                            while (slot < 100) {
                                                var found = false;
                                                containers[containerkey].forEach(function(container){
                                                    if (container.slot === slot) {
                                                        //slot exists already
                                                        //but does the span of this annotation overlap with the one currently under consideration?
                                                        annotation.scope.forEach(function(spanmember){
                                                            if (annotations[container.target][container.annotation.id].scope.indexOf(spanmember) != -1) {
                                                                found = true;
                                                                return;
                                                            }
                                                        });
                                                    }
                                                });
                                                if (!found) {
                                                    break;
                                                } else {
                                                    slot++;
                                                }
                                            }

                                        }

                                        containers[containerkey].push({
                                            'html': s, 
                                            'annotation': annotation,
                                            'target': target,
                                            'slot': slot,
                                        }); 
                                        paintedglobannotations[target] = true;
                                } else {
                                    //no span, no need for intermediate container structure, directly add
                                    if (targetabselection === null) {
                                        targetabselection = $('#' + valid(target) + " span.ab");
                                        targetabselection.css('display','none'); 
                                        paintedglobannotations[target] = true;
                                    }
                                    targetabselection.append(s);
                                }
                        }
                    }
                }); ///
            });

            //if (changed) targetabselection.css('display','block'); 
            if (targetabselection !== null) targetabselection.css('display','block'); 
        });
        
        var displaycontainers = {}; //will hold the actual containers for display
        Object.keys(containers).forEach(function(containerkey){
            //find maximum slot and gather targets
            var maxslot = 0;
            var targets = [];
            containers[containerkey].forEach(function(container){
                if (container.slot > maxslot) {
                    maxslot = container.slot;
                }
                if (targets.indexOf(container.target) === -1) {
                    targets.push(container.target);
                }
            });

            //iterate over targets
            targets.forEach(function(target){
                targetabselection = $('#' + valid(target) + " span.ab");
                targetabselection.append("<span class=\"abc\"></span>");
                var abcs = $('#' + valid(target) + " span.ab span.abc");
                var displaycontainer = abcs[abcs.length-1]; //nasty patch cause I can't get last() to work

                //fill the slots in order 
                var displaycontainer_html = "";
                var slot;
                for (slot = 0; slot <= maxslot; slot++) {
                    var found = false;
                    containers[containerkey].forEach(function(container){
                        if ((container.target === target) && (container.slot === slot)) {
                            displaycontainer_html = container.html + displaycontainer_html;
                            found = true;
                        }
                    });
                    if (!found) {
                        //free slot
                        displaycontainer_html = "<span>&nbsp;</span>" + displaycontainer_html;
                    }
                }
                $(displaycontainer).html(displaycontainer_html);
                
                //add to structure so we can compute height later on
                if (displaycontainers[containerkey] === undefined) {
                    displaycontainers[containerkey] = {};
                }
                if (displaycontainers[containerkey][target] === undefined) {
                    displaycontainers[containerkey][target]= [];
                }
                displaycontainers[containerkey][target].push(displaycontainer);

                //show the annotation box
                targetabselection.css('display','block');
            });
        });


        //process containers, all containers for the same span layer must all have the same height (will be set to the height of the largest)
        Object.keys(displaycontainers).forEach(function(containerkey){
            var height = 0;
            Object.keys(displaycontainers[containerkey]).forEach(function(target){
                displaycontainers[containerkey][target].forEach(function(container){
                    c_height =  $(container).height();
                    if (c_height > height) height = c_height;
                });
            });
            if (height > 0) {
                Object.keys(displaycontainers[containerkey]).forEach(function(target){
                    displaycontainers[containerkey][target].forEach(function(container){
                        $(container).css('height',height);
                    });
                });
            }
        });

    }

}


function viewer_onupdate() {
    $('div.F span.lbl').hide();
    if (perspective != "s") {
        $('div.s').css('display', 'inline');
    } else {
        $('div.s').css('display', 'block');
    }
    $('div.persp').removeClass('persp');
    if ((perspective) && (perspective != "document") && ((!perspective_ids) || (perspective_ids.length > 1))) {
        $('div.' + perspective).addClass('persp');
    }
    $('div.deepest>span.lbl').show();

    $('div.deepest span.str').mouseenter(function(){
        hoverstr = this.id.substr(7);
    });
    if (annotationfocus) {
        setclasscolors();
    }
    renderglobannotations();
}

function viewer_ontimer() {
    if (namespace != "testflat") { //no polling for tests 
       $.ajax({
            type: 'GET',
            headers: {'X-sessionid': sid },
            url: "/viewer/" + namespace + "/"+ docid + "/poll/",
            success: function(data) {
                update(data);
            },
            dataType: "json"
        }); 
    }
}



function viewer_loadmenus() {
    s = "";
    s2 = "<li><a href=\"javascript:setannotationfocus()\">Clear</li>";
    sglob = "<li><a href=\"javascript:resetglobannotationview()\">Clear</li>";
    Object.keys(declarations).forEach(function(annotationtype){
      Object.keys(declarations[annotationtype]).forEach(function(set){
        if ((configuration.allowedviewannotations === true) || (configuration.allowedviewannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.allowedviewannotations.indexOf(annotationtype) != -1)) {
            var state = "";
            if ((configuration.initialviewannotations === true) || (configuration.initialviewannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.initialviewannotations.indexOf(annotationtype) != -1)) {
                viewannotations[annotationtype + "/" + set] = true;
                state = "class=\"on\"";
            } else {
                state = "";
            }
            label = folia_label(annotationtype, set);
            s = s +  "<li id=\"annotationtypeview_" +annotationtype+"_" + hash(set) + "\" " + state + "><a href=\"javascript:toggleannotationview('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>";
            if (globannotationsorder.indexOf(annotationtype) != -1) {
                if (('initialglobviewannotations' in configuration  ) &&  ((configuration.initialglobviewannotations === true) || (configuration.initialglobviewannotations.indexOf(annotationtype + '/' + set) != -1) || (configuration.initialglobviewannotations.indexOf(annotationtype) != -1))) {
                    viewglobannotations[annotationtype + "/" + set] = true;
                    state = "class=\"on\"";
                } else {
                    state = "";
                }
                sglob = sglob +  "<li id=\"globannotationtypeview_" +annotationtype+"_" + hash(set) + "\" " + state + "><a href=\"javascript:toggleglobannotationview('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>";
            }
        }
        if ((configuration.allowedannotationfocus === true) || (configuration.allowedannotationfocus.indexOf(annotationtype + '/' + set) != -1) || (configuration.allowedannotationfocus.indexOf(annotationtype) != -1)) {
            s2 = s2 +  "<li id=\"annotationtypefocus_" +annotationtype+"_" + hash(set) + "\"><a href=\"javascript:setannotationfocus('" + annotationtype + "','" + set + "')\">" + label +  "<span class=\"setname\">" + set + "</span></a></li>";
        }

      });
    });
    $('#annotationsviewmenu').html(s); //TODO: sort alphabetically
    $('#globannotationsviewmenu').html(sglob);
    $('#annotationsfocusmenu').html(s2);
}




function viewer_contentloaded(data) {
    editfields = 0;
    if (textclass != 'current') rendertextclass();
    if (annotationfocus) {
        setannotationfocus(annotationfocus.type, annotationfocus.set);
    }
}


function viewer_onrendertextclass() {
    $('div.deepest span.str').mouseenter(function(){
        hoverstr = this.id.substr(7);
        showinfo($(this).parents('.deepest')[0]);
    });
}

function viewer_onpagechange() {
    //resubmit any searches if there is a search and highlight mode is selected
    if ((searchsubmitted) && ($('#searchqueryinput').val() !== "") && ($('#searchhighlight').is(':checked'))) {
        $('#searchsubmit').click();
    }
}

function opensearch() {
    $('#search').show();
    $('#search').draggable();
}

function highlight(data) {
    $('.highlighted').removeClass('highlighted');
    if (data.elements) {
        data.elements.forEach(function(returnitem){
            if (returnitem.elementid) { 
                $('#' + valid(returnitem.elementid)).addClass("highlighted");
            }
        });
    }
}


function viewer_oninit() {
    closewait = false; //to notify called we'll handle it ourselves 


    $('#document').mouseleave( function(e) {
        $('#info').hide();
    });  
    annotatordetails = false;
    if ((configuration.annotationfocustype) && (configuration.annotationfocusset)) {
        setannotationfocus(configuration.annotationfocustype, configuration.annotationfocusset);
    }
    viewer_loadmenus();
    loadperspectivemenu();
    loadselectormenu();


    //if (viewannotations['t']) toggleannotationview('t');
    $('#document').mouseleave(function() { $('#info').hide(); });

    $('#searchdiscard').click(function(){
        $('#search').hide();
    });

    $('#searchclear').click(function(){
        //clear search results
        $('#searchqueryinput').val(''); 
        $(".highlighted").removeClass("highlighted");
        searchsubmitted = false;
    });

    $('#searchsubmit').click(function(){ 
        //execute the search

        var queries = $('#searchqueryinput').val().split("\n"); 
        var changeperspective = $('#searchperspective').is(':checked');
        searchsubmitted = true;

        if (changeperspective) {
            $('#document').html('');
            havecontent = false;
        }


        for (var i = 0; i < queries.length; i++) {
            if (queries[i].trim() !== "") {
                var cql = false;
                if ((queries[i].trim()[0] == '"') || (queries[i].trim()[0] == '[')) {
                    cql = true;
                    queries[i] = "USE " + namespace + "/" + docid + " CQL " + queries[i].trim();
                } else if (queries[i].trim().substr(0,3) == "USE") {
                    queries[i] = queries[i].trim();
                } else {
                    queries[i] = "USE " + namespace + "/" + docid + " " + queries[i].trim();
                }  
                if (queries[i].indexOf('FORMAT') == -1) {
                    queries[i] += " FORMAT flat"; 
                }
            }
        }

        $('#wait span.msg').val("Executing search query and obtaining results");
        $('#wait').show();

        $.ajax({
            type: 'POST',
            url: "/" + namespace + "/"+ docid + "/query/",
            contentType: "application/json",
            //processData: false,
            headers: {'X-sessionid': sid },
            data: JSON.stringify( { 'queries': queries}), 
            success: function(data) {
                if (data.error) {
                    $('#wait').hide();
                    alert("Received error from document server: " + data.error);
                } else {
                    $('#search').hide();
                    if (changeperspective) {
                        settextclassselector(data);
                        update(data);
                        if (textclass != 'current') rendertextclass();
                        if (annotationfocus) {
                            setannotationfocus(annotationfocus.type, annotationfocus.set);
                        }
                    } else {
                        highlight(data);
                    }
                    $('#wait').hide();
                }
            },
            error: function(req,err,exception) { 
                $('#wait').hide();
                alert("Query failed: " + err + " " + exception + ": " + req.responseText);
            },
            dataType: "json"
        });
    });
}
