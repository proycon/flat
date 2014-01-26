view = 'deepest';
viewannotations = {};
annotationfocus = null;
annotatordetails = false;
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
        if (hover) $(".hover").removeClass("hover");
        $(element).addClass("hover");
        hover = element;
        if ($(element).hasClass('focustype')) {
            //colour related elements
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                if ((annotations[element.id][annotationid].type == annotationfocus.type) && (annotations[element.id][annotationid].set == annotationfocus.set) && (annotations[element.id][annotationid].targets.length > 1)) {
                    annotations[element.id][annotationid].targets.forEach(function(target){
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

function viewer_onmouseenter(element) {
    sethover(element);
    showinfo(element);
}


function getspantext(annotation) {
    spantext= "";
    annotation.targets.forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationid2){
            annotation2 = annotations[target][annotationid2];
            if ((annotation2.type == "t") && (annotation2.class == "current")) {
                if (spantext) spantext += " ";
                spantext += annotation2.text;
            }
        });
    });
    return spantext;
}


function renderannotation(annotation, norecurse) {
    if (!((annotation.type == "t") && ((annotation.class == "current")  || (annotation.class == "original")) )) {
        if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].type != "open") && (setdefinitions[annotation.set].classes[annotation.class]) ) {
            s = s + "<span class=\"class\">" +  setdefinitions[annotation.set].classes[annotation.class].label + "</span>";
        } else {
            s = s + "<span class=\"class\">" + annotation.class + "</span>";
        }
    }
    if (annotation.targets.length > 1) {
        spantext = getspantext(annotation)
        s = s + "<br/><span class=\"text\">" + spantext + "</span>";
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
    if ((annotation.incorrection) && (annotation.incorrection.length > 0) && (!norecurse)) {
        var correctionid = annotation.incorrection[0];
        if (corrections[correctionid]) {
            correction = corrections[correctionid];
            s = s + "<div class=\"correction\"><span class=\"title\">Correction: " + correction.class + "</span>";
            if (annotatordetails && correction.annotator) {
                s = s + "<br/><span class=\"annotator\">" + correction.annotator + " (" + correction.annotatortype + ")</span>";
                if (annotation.datetime) {
                    s = s + "<br/><span class=\"datetime\">" + correction.datetime +"</span>";
                }
            }
            if (correction.suggestions.length > 0) {
                correction.suggestions.forEach(function(suggestion){
                    s = s + "<br />Suggestion: ";
                    s = s +  "<div class=\"correctionchild\">";
                    renderannotation(suggestion,true)
                    s = s + "</div>";
                });
            }
            if (correction.original.length > 0) {
                correction.original.forEach(function(original){
                    s = s + "<br />Original: ";
                    s = s +  "<div class=\"correctionchild\">";
                    renderannotation(original,true);
                    s = s + "</div>";
                });
            }
            s = s + "</div>";
        } else {
            s = s + "<div class=\"correction\"><span class=\"title\">Correction</span></div>";
        }
    }
}

function showinfo(element) {
    if ((element) && ($(element).hasClass(view))) {
        if ((element.id)  && (annotations[element.id])) {            
            s = "";
            Object.keys(annotations[element.id]).forEach(function(annotationid){
                annotation = annotations[element.id][annotationid];
                if (viewannotations[annotation.type+"/" + annotation.set]) {
                    if (annotationtypenames[annotation.type]) {
                        label = annotationtypenames[annotation.type];
                    } else {
                        label = annotation.type;
                    }
                    if (annotation.set) {
                        setname = annotation.set;
                    } else {
                        setname = "";
                    }
                    s = s + "<tr><th>" + label + "<br /><span class=\"setname\">" + setname + "</span></th><td>";
                    renderannotation(annotation);
                    s = s + "</td></tr>";

                }
                 
            });
            if (s) {
                s = "<div id=\"id\">" + element.id + "</div><table>"  + s + "</table>";
                $('#info').html(s);
                $('#info').css({'display': 'block', 'top':mouseY+ 20, 'left':mouseX} );
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


function setannotationfocus(t,set) {
    if (annotationfocus) {
        $('.focustype').removeClass("focustype");
        $('#annotationsfocusmenu li').removeClass('on');
        removeclasscolors();
    }
    if (t && set) {
        annotationfocus = { 'type': t, 'set': set };
        $('#annotationtypefocus_' + annotationfocus.type + "_" + hash(annotationfocus.set)).addClass('on');
        Object.keys(annotations).forEach(function(target){
            Object.keys(annotations[target]).forEach(function(annotationkey){
                annotation = annotations[target][annotationkey];
                if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set)) {
                    $('#' + valid(target)).addClass("focustype");
                }
            });
        });
        setclasscolors();
    } else {
        annotationfocus = null;
    }
}

function removeclasscolors(toggle) {
    for (var i = 1; i < 8; i++) {
        $('.class' + i).removeClass('class' + i);
    }
    $('.focustype').removeClass('focustype');
    if (toggle) {
        s = "<span class=\"title\">Legend &bull; " + title + "</span>"; //text for legend
        s = s + "(<a href=\"javascript:setannotationfocus('"+ annotationfocus.type +"','" + annotationfocus.set + "')\">Show</a>)<br />";
        $('#legend').html(s);
    } else {
        $('#legend').hide();
    }
}

function setclasscolors() {
    //count class distribution
    classfreq = {};
    Object.keys(annotations).forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationkey){
            annotation = annotations[target][annotationkey];
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set) && (annotation.class)) {
                if (classfreq[annotation.class]) {
                    classfreq[annotation.class]--; //reverse for sorting later
                } else {
                    classfreq[annotation.class] = -1; //reverse for sorting later
                }
            }
        });
    });

    if (annotationtypenames[annotation.type]) {
        title = annotationtypenames[annotation.type];
    } else {
        title = annotation.type;
    }
    s = "<span class=\"title\">Legend &bull; " + title + "</span>"; //text for legend
    s = s + "(<a href=\"javascript:removeclasscolors(true)\">Hide</a>)<br />";
    classrank = {}
    currentrank = 1;
    bySortedValue(classfreq, function(key, val){
        if (currentrank < 8) {
            classrank[key] = currentrank;
            if ((setdefinitions[annotation.set]) && (setdefinitions[annotation.set].classes[key])) {
                key = setdefinitions[annotation.set].classes[key].label;
            }
            s = s + "<div id=\"class" + currentrank + "legend\" class=\"colorbox\"></div><span>" + key + "</span><br />"
            currentrank++;
        }
    });


    Object.keys(annotations).forEach(function(target){
        Object.keys(annotations[target]).forEach(function(annotationkey){
            annotation = annotations[target][annotationkey];
            if ((annotation.type == annotationfocus.type) && (annotation.set == annotationfocus.set) && (annotation.class)) {
                if (classrank[annotation.class]) {
                    $('#' + valid(target)).addClass('class' + classrank[annotation.class]);
                }
            }
        });
    });

    $('#legend').html(s);
    $('#legend').show();
}

function viewer_onloadannotations(annotationlist) {
    if (annotationfocus) {
        setclasscolors();
    }
}

function viewer_ontimer() {
    $.ajax({
        type: 'GET',
        data: {'sid': sid },
        url: "/viewer/" + namespace + "/"+ docid + "/poll/",
        success: function(data) {
            if (data.update) {
                data.update.forEach(function(d){
                    update(d);
                });
            }
        },
        dataType: "json"
    });

}

function viewer_oninit() {
    $('#document').mouseleave( function(e) {
        $('#info').hide();
    });  
    setview(view);
    setannotationfocus(annotationfocus);
    s = "";
    s2 = "<li><a href=\"javascript:setannotationfocus()\">Clear</li>";
    Object.keys(declarations).forEach(function(annotationtype){
      Object.keys(declarations[annotationtype]).forEach(function(set){
        viewannotations[annotationtype + "/" + set] = true;
        if (annotationtypenames[annotationtype]) {
            label = annotationtypenames[annotationtype];
        } else {
            label = annotationtype;
        }
        s = s +  "<li id=\"annotationtypeview_" +annotationtype+"_" + hash(set) + "\" class=\"on\"><a href=\"javascript:toggleannotationview('" + annotationtype + "', '" + set + "')\">" + label + "<span class=\"setname\">" + set + "</span></a></li>";
        s2 = s2 +  "<li id=\"annotationtypefocus_" +annotationtype+"_" + hash(set) + "\"><a href=\"javascript:setannotationfocus('" + annotationtype + "','" + set + "')\">" + label +  "<span class=\"setname\">" + set + "</span></a></li>";
      });
    });
    $('#annotationsviewmenu').html(s);
    $('#annotationsfocusmenu').html(s2);
    //if (viewannotations['t']) toggleannotationview('t');
    $('#document').mouseleave(function() { $('#info').hide(); });
}
