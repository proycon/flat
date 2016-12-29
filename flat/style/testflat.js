
//will be invoked by editor submit
function testbackend(testname,username,sid,queries) {
    //if (testname == "testflat") throw "Got testname 'testflat' rather than an actual specific test!";
    console.log("Running queries " + queries.join(' ; '));
    $.ajax({
        type: 'POST',
        url: "/testflat/"+ testname + "/query/",
        contentType: "application/json",
        //processData: false,
        headers: {'X-sessionid': sid },
        data: JSON.stringify( { 'queries': queries}), 
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                testeval({'testresult': false, 'testmessage': data.error});
            } else {
                editfields = 0;
                closeeditor();
                update(data);
                testeval(data); //this will do the proper evaluation
            }
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            testeval({'testresult': false, 'testmessage': "Editor submission failed: " + req + " " + err + " " + exception});
        },
        dataType: "json"
    });
}


//will be called by each test to set up the environment anew
function testinit(name, assert) {
    $('#wait .msg').html("Obtaining document data (for test " + name + ")");
    $('#wait').show();
    $('#aborted').hide();

    console.log("(testinit) clear data prior to test " + name);
    testname = name;
    globalassert = assert;
    havecontent = false;
    $('#document').html("");
    annotations = {};//reset, will be newly populated
    perspective = 'full';
    editfields = 0;
    closeeditor();

    $.ajax({
        type: 'POST',
        url: "/testflat/testflat/query/",
        contentType: "application/json",
        //processData: false,
        headers: {'X-sessionid': sid },
        async: false, //important here!! does not continue until ajax is all done!!!
        data: JSON.stringify( { 'queries': ["USE testflat/testflat SELECT FOR ALL FORMAT flat"]}), 
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                testeval({'testresult': false, 'testmessage': data.error}); //show in test units when things go wrong already at this stage
            } else {
                editfields = 0;
                update(data); 
                $('#wait .msg').html("Automatically clicking and typing for test " + name );
                $('#wait').show();
            }
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            alert("Obtaining document data for test failed: " + req + " " + err + " " + exception);
        },
        dataType: "json"
    });
}


function testtext(elementselector, reference, message) {
    if (!message) message = "Testing whether text of " + elementselector + " is \"" + reference + "\"";
    globalassert.equal($(valid(elementselector)).text().trim(), reference, message);
}

function ui_get(selectexpression) {
    var selector = $(valid(selectexpression));
    globalassert.equal(selector.length, 1 , "[UI] Get  " + selectexpression);
    return selector;
}

function ui_edit(selectexpression, value) {
    var e = ui_get(selectexpression);
    e.val(value);
    globalassert.equal( e.val() , value, "[UI] Change text of  " + selectexpression + " to \"" + value + "\"");
}

function ui_choose(selectexpression, value) {
    var e = ui_get(selectexpression);
    e.val(value);
    //e.prop('selectedIndex',value);
    globalassert.equal( e.val() , value, "[UI] Choosing " + selectexpression + " , selecting option \"" + value + "\"");
    e.trigger('change');
}

function ui_click(selectexpression) {
    ui_get(selectexpression).trigger('click');
}

function ui_find(annotationtype){
    for (var i = 0; i < editfields; i++) {
        if (editdata[i].type === annotationtype) {
            return i;
        }
    }
    throw "Annotation type " + annotationtype + " not found";
}

//we want tests in the order defined here
//our tests are run sequentially
QUnit.config.reorder = false;
testname = ""; //global variable
globalassert = null;

//these will need to be adjusted when set definitions change
FLATTEST_ADD_NER = "6"; 
FLATTEST_CORRECTIONCLASS_UNCERTAIN = "uncertain";

// This is how we detect the failure and cancel the rest of the tests...
/*QUnit.testDone(function(details) {
    console.log(details);
    if (details.failed) {
        throw new Error('Test ' + details.name + ' failed, aborting tests...');
    }
});*/


QUnit.asyncTest("Text Change", function(assert){
    testinit("textchange",assert);
    ui_click('#untitleddoc.p.3.s.1.w.2');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"mijn"); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Class change (token annotation)", function(assert){
    testinit("classchange_token",assert);
    ui_click('#untitleddoc.p.3.s.1.w.2');
    var idx = ui_find('lemma');
    ui_edit('#editfield' + idx,"mijn");  //lemma
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Class change (span annotation)", function(assert){
    testinit("classchange_span",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    var idx = ui_find('chunk');
    ui_choose('#editfield' + idx,'X'); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Text Change (Merging multiple words)", function(assert){
    testinit("textmerge",assert);
    ui_click('#untitleddoc.p.3.s.1.w.5');
    var idx = ui_find('t');
    ui_click('#spanselector' + idx);
    ui_click('#untitleddoc.p.3.s.1.w.4');
    ui_click('#spanselector' + idx);
    ui_edit('#editfield' + idx + 'text',"wegreden"); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Changing Text and multiple token annotations at once", function(assert){
    testinit("multiannotchange",assert);
    ui_click('#untitleddoc.p.3.s.6.w.8');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"het"); 
    ui_click('#editform' + idx + 'direct'); 
    idx = ui_find('pos');
    ui_edit('#editfield' + idx,"LID(onbep,stan,rest)");  //pos
    ui_click('#editform' + idx + 'direct'); 
    idx = ui_find('lemma');
    ui_edit('#editfield' + idx,"het");  //lemma
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Adding a new span annotation, out of order selection", function(assert){
    //tests adding new fields
    //tests span selection (deliberately selected out of order)

    testinit("addentity",assert);
    ui_click('#untitleddoc.p.3.s.1.w.12b');
    //selected named entity to add
    ui_choose('#editoraddablefields',FLATTEST_ADD_NER); 
    ui_click('#editoraddfield'); //click add button

    //fill new field:
    var idx = editfields-1;
    ui_choose('#editfield' + idx,"per"); 

    //select span
    ui_click('#spanselector' + idx); 
    ui_click('#untitleddoc.p.3.s.1.w.12');
    ui_click('#spanselector' + idx); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Adding new overlapping span", function(assert){
    testinit("newoverlapspan",assert);
    ui_click('#untitleddoc.p.3.s.9.w.8');
    var idx = ui_find('entity');
    ui_choose('#editfield' + idx,"org");
    ui_click('#spanselector' + idx); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    //8 and 9 are already selected!
    ui_click('#spanselector' + idx); 
    ui_click('#editform' + idx + 'new'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word deletion", function(assert){
    testinit("worddelete",assert);
    ui_click('#untitleddoc.p.3.s.8.w.10');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',""); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word split", function(assert){
    testinit("wordsplit",assert);
    ui_click('#untitleddoc.p.3.s.12.w.5');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"4 uur"); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word insertion to the right", function(assert){
    testinit("wordinsertionright",assert);
    ui_click('#untitleddoc.p.3.s.12.w.1');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"en we"); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word insertion to the left", function(assert){
    testinit("wordinsertionleft",assert);
    ui_click('#untitleddoc.p.3.s.13.w.12');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"we hoorden"); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span change", function(assert){
    testinit("spanchange",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    var idx = ui_find('entity');
    ui_click('#spanselector' + idx); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    ui_click('#spanselector' + idx); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span and class change", function(assert){
    testinit("spanclasschange",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    var idx = ui_find('entity');
    ui_choose('#editfield' + idx,"org");
    ui_click('#spanselector' + idx); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    ui_click('#spanselector' + idx); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Deletion of token annotation", function(assert){
    testinit("tokenannotationdeletion",assert);
    ui_click('#untitleddoc.p.3.s.8.w.4');
    var idx = ui_find('lemma');
    ui_edit('#editfield' + idx,""); 
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span deletion", function(assert){
    testinit("spandeletion",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    var idx = ui_find('entity');
    ui_choose('#editfield' + idx,""); //corresponds to empty class, implies deletion
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Setting confidence",function(assert){
    testinit("confidence_set",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    var idx = ui_find('lemma');
    ui_click('#confidencecheck' + idx);
    $('#confidenceslider' + idx).slider('value',88);
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Editing confidence",function(assert){
    testinit("confidence_edit",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    var idx = ui_find('chunk');
    $('#confidenceslider' + idx).slider('value',88);
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Unsetting confidence",function(assert){
    testinit("confidence_unset",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    var idx = ui_find('chunk');
    ui_click('#confidencecheck' + idx);
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Text Change", function(assert){
    testinit("correction_textchange",assert);
    ui_click('#untitleddoc.p.3.s.1.w.2');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"mijn"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Text Change (Merging multiple words)", function(assert){
    testinit("correction_textmerge",assert);
    ui_click('#untitleddoc.p.3.s.1.w.5');
    var idx = ui_find('t');
    ui_click('#spanselector' + idx);
    ui_click('#untitleddoc.p.3.s.1.w.4');
    ui_click('#spanselector' + idx);
    ui_edit('#editfield' + idx + 'text',"wegreden"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Changing token annotation", function(assert){
    testinit("correction_tokenannotationchange",assert);
    ui_click('#untitleddoc.p.3.s.6.w.8');
    var idx = ui_find('pos');
    ui_edit('#editfield' + idx,"LID(onbep,stan,rest)"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word deletion", function(assert){
    testinit("correction_worddelete",assert);
    ui_click('#untitleddoc.p.3.s.8.w.10');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',""); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word split", function(assert){
    testinit("correction_wordsplit",assert);
    ui_click('#untitleddoc.p.3.s.12.w.5');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"4 uur"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx +'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word insertion to the right", function(assert){
    testinit("correction_wordinsertionright",assert);
    ui_click('#untitleddoc.p.3.s.12.w.1');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"en we"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Word insertion to the left", function(assert){
    testinit("correction_wordinsertionleft",assert);
    ui_click('#untitleddoc.p.3.s.13.w.12');
    var idx = ui_find('t');
    ui_edit('#editfield' + idx + 'text',"we hoorden"); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Deletion of token annotation", function(assert){
    testinit("correction_tokenannotationdeletion",assert);
    ui_click('#untitleddoc.p.3.s.8.w.4');
    var idx = ui_find('lemma');
    ui_edit('#editfield' + idx,""); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Span change", function(assert){
    testinit("correction_spanchange",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    var idx = ui_find('entity');
    ui_click('#spanselector' + idx); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    ui_click('#spanselector' + idx); 
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Span deletion", function(assert){
    testinit("correction_spandeletion",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    var idx = ui_find('entity');
    ui_choose('#editfield' + idx,""); //corresponds to empty class, implies deletion
    ui_click('#editform' + idx + 'correction'); 
    ui_choose('#editform' + idx + 'correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Adding a comment to a span annotation",function(assert){
    testinit("comment_span",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    var idx = ui_find('chunk');
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editoraddhigherorder' + idx + '_comment');
    ui_edit('#higherorderfield' + idx + '_0',"This is a comment"); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Editing a feature (class)",function(assert){
    testinit("feature_edit",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('pos');
    ui_click('#editform' + idx + 'direct'); 
    ui_edit('#higherorderfield_' + idx + '_0',"ADJX");  //head feature
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Editing a feature (subset and class)",function(assert){
    testinit("feature_edit2",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('pos');
    ui_click('#editform' + idx + 'direct'); 
    ui_edit('#higherorderfield_subset_' + idx + '_0',"headX");  //head feature
    ui_edit('#higherorderfield_' + idx + '_0',"ADJX");  //head feature
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Adding a new feature",function(assert){
    testinit("feature_add",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('pos');
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#editoraddhigherorder' + idx + '_feat');
    ui_edit('#higherorderfield_subset_' + idx + '_4',"testsubset");  //head feature
    ui_edit('#higherorderfield_' + idx + '_4',"testvalue");  //head feature
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Deleting a feature",function(assert){
    testinit("feature_delete",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('pos');
    ui_click('#editform' + idx + 'direct'); 
    ui_edit('#higherorderfield_' + idx + '_0',"");  //head feature
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span role edit (respan)",function(assert){
    testinit("spanrole_respan",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('dependency');
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#spanselector' + idx + '_0');  //head spanrole
    ui_click('#untitleddoc.p.3.s.1.w.12b');
    ui_click('#spanselector' + idx + '_0');  
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span role deletion",function(assert){
    testinit("spanrole_delete",assert);
    ui_click('#untitleddoc.p.3.s.1.w.11');
    var idx = ui_find('dependency');
    ui_click('#editform' + idx + 'direct'); 
    ui_click('#spanselector' + idx + '_0');  //head spanrole
    ui_click('#untitleddoc.p.3.s.1.w.12');
    ui_click('#spanselector' + idx + '_0');  
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Adding a new span annotation (dependency) with span roles from scratch",function(assert){
    testinit("dependency_add",assert);
    ui_click('#untitleddoc.p.3.s.15.w.3');
    ui_choose('#editoraddablefields',"5");  //5 corresponds to dependency, as long as the ordering doesn't change...
    ui_click('#editoraddfield'); //click add button

    //fill new field:
    var idx = editfields-1;
    ui_choose('#editfield' + idx,"crd"); 
    //empty fields for the span roles should have been added automatically as they are required, no need to manually add them
    ui_click('#spanselector' + idx + '_0');  //dep spanrole
    ui_click('#untitleddoc.p.3.s.15.w.1');
    ui_click('#spanselector' + idx + '_0');  //dep spanrole
    ui_click('#spanselector' + idx + '_1');  //head spanrole
    ui_click('#untitleddoc.p.3.s.15.w.3');
    ui_click('#spanselector' + idx + '_1');  //head spanrole
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Adding a new syntax annotation from scratch",function(assert){
    testinit("syntax_add",assert);
    ui_click('#untitleddoc.p.3.s.15.w.1');
    ui_choose('#editoraddablefields',"6");  //5 corresponds to syntax, as long as the ordering doesn't change...
    ui_click('#editoraddfield'); //click add button

    //fill new field:
    var idx = editfields-1;
    ui_choose('#editfield' + idx,"crd"); 
    //empty fields for the span roles should have been added automatically as they are required, no need to manually add them
    ui_click('#spanselector' + idx);  
    ui_click('#untitleddoc.p.3.s.15.w.2');
    ui_click('#untitleddoc.p.3.s.15.w.3');
    ui_click('#untitleddoc.p.3.s.15.w.4');
    ui_click('#untitleddoc.p.3.s.15.w.5');
    ui_click('#spanselector' + idx);  
    ui_choose('#editfield' + idx,"s"); 
    ui_click('#editorsubmit'); 
});



QUnit.asyncTest("Tests completed", function(assert){
    $('#wait').hide();
    havecontent = false;
    $('#document').html("(All tests completed!)");
    annotations = {};//reset, will be newly populated
});

function findcorrectionbytext(text) {
    var correction = null;
    forallannotations(function(structureelement, annotation){
        if (annotation.type == "correction") {
            if (annotation.structural) {
                if (annotation.new) {
                    for (var i = 0; i < annotation.new.length; i++) {
                        var sid = annotation.new[i];
                        forannotations(sid, function(annotation2){
                            if ((annotation2.type == "t") && (annotation2.class == "current") && (annotation2.text === text)) {
                                correction = sid;
                                return;
                            }
                        });
                    }
                }
                if (annotation.current) {
                    for (var i = 0; i < annotation.current.length; i++) {
                        var sid = annotation.current[i];
                        forannotations(sid, function(annotation2){
                            if ((annotation2.type == "t") && (annotation2.class == "current") && (annotation2.text === text)) {
                                correction = sid;
                                return;
                            }
                        });
                    }
                }
            } else {
                if (annotation.new) {
                    for (var i = 0; i < annotation.new.length; i++) {
                        var aid = annotation.new[i];
                        if ((annotations[aid].type == "t") && (annotations[aid].class == "current") && (annotations[aid].text === text)) {
                            correction = annotation.id;
                            return;
                        }
                    }
                }
                if (annotation.current) {
                    for (var i = 0; i < annotation.current.length; i++) {
                        var aid = annotation.current[i];
                        if ((annotations[aid].type == "t") && (annotations[aid].class == "current") && (annotations[aid].text === text)) {
                            correction = annotation.id;
                            return;
                        }
                    }
                }
            }
        }
    });
    globalassert.notEqual(correction, null,  "Checking if correction was found by text");
    return correction;
}

function hasannotation(structure_id, annotation_id) {
   return (structure[structure_id].annotations.indexOf(annotation_id) != -1);
}

function getannotations(structure_id, type) {
    var l = [];
    forannotations(structure_id, function(a){
        if (a.type == type) {
            l.push(a);
            return;
        }
    });
    return l;
}

function assert_ok(test, label) {
    globalassert.ok(test, label);
    return (test == true);
}

// TESTS -- Second stage, the actual test evaluation

function testeval(data) {
    console.log("(testeval) evaluating test result");
    if (data.testmessage === "") data.testmessage = "ok";

    if (data.queries) {
        globalassert.ok(data.testresult, "Backend Queries: " + data.queries.join(" -- ") );
    } else {
        globalassert.ok(false, "Backend did not return queries! This probably means an exception occurred in the backend!");
    }
    globalassert.ok(data.testresult, "Backend Test: " + data.testmessage.replace("\n"," -- " ) );

    if ((testname == "textchange") || (testname == "correction_textchange")) {
        testtext('#untitleddoc.p.3.s.1.w.2', "mijn");
    } else if (testname == "classchange_token") {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.2/lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "mijn");
    } else if (testname == "classchange_span") {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].class, "X");
    } else if ((testname == "textmerge")) {
        testtext('#untitleddoc.p.3.s.1.w.14', "wegreden");
    } else if ((testname == "correction_textmerge")) {
        var id = findcorrectionbytext("wegreden");
        if (id) {
            testtext('#' + id, "wegreden");
        }
    } else if ((testname == "multiannotchange") ) {
        testtext('#untitleddoc.p.3.s.6.w.8', "het");
        globalassert.equal(annotations["untitleddoc.p.3.s.6.w.8/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].class, "LID(onbep,stan,rest)", "Testing POS class");
        globalassert.equal(annotations["untitleddoc.p.3.s.6.w.8/lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "het", "Testing lemma class");
    } else if ((testname == "addentity") || (testname == "correction_addentity")) {
        globalassert.equal(getannotations('untitleddoc.p.3.s.1.w.12','entity')[0].class, "per", "Finding named entity on first word");
        globalassert.equal(getannotations('untitleddoc.p.3.s.1.w.12b','entity')[0].class, "per", "Finding named entity on second word");
    } else if ((testname == "worddelete") ||  (testname == "correction_worddelete")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.8.w.10')).length, 0, "Test if word is removed from interface");
    } else if ((testname == "wordsplit")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.17')).length, 1, "Checking presence of new words (1/2)");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.18')).length, 1, "Checking presence of new words (1/2)");
    } else if ((testname == "correction_wordsplit")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");
        id = findcorrectionbytext("4");
        globalassert.equal($(valid('#' + id )).length, 1, "Checking presence of new words (1/2)");
        id = findcorrectionbytext("uur");
        globalassert.equal($(valid('#'+ id )).length, 1, "Checking presence of new words (1/2)");
    } else if ((testname == "wordinsertionright"))  {
        testtext('#untitleddoc.p.3.s.12.w.1',"en");
        testtext('#untitleddoc.p.3.s.12.w.17',"we");
    } else if ((testname == "wordinsertionleft")) {
        testtext('#untitleddoc.p.3.s.13.w.12',"hoorden");
        testtext('#untitleddoc.p.3.s.13.w.16',"we");
    } else if ((testname == "correction_wordinsertionright"))  {
        id = findcorrectionbytext("we");
        testtext('#untitleddoc.p.3.s.12.w.1',"en");
        testtext('#' + id,"we");
    } else if ((testname == "correction_wordinsertionleft"))  {
        id = findcorrectionbytext("we");
        testtext('#untitleddoc.p.3.s.13.w.12',"hoorden");
        testtext('#' + id,"we");
    } else if ((testname == "spanchange") || (testname=="spanclasschange") ) {
        globalassert.equal(hasannotation('untitleddoc.p.3.s.9.w.9',"untitleddoc.p.3.s.9.entity.1"), true, "Finding named entity on original word");
        globalassert.equal(hasannotation('untitleddoc.p.3.s.9.w.7',"untitleddoc.p.3.s.9.entity.1"), true, "Finding named entity on new word");
        if (testname == "spanclasschange") {
            globalassert.equal(annotations["untitleddoc.p.3.s.9.entity.1"].class, "org", "Testing named entity class");
        } else {
            globalassert.equal(annotations["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Testing named entity class");
        }
    } else if ((testname == "newoverlapspan") || (testname == "correction_newoverlapspan")) {
        globalassert.equal(getannotations( 'untitleddoc.p.3.s.9.w.9','entity')[0].class, "loc", "Finding first entity");
        globalassert.equal(getannotations( 'untitleddoc.p.3.s.9.w.9','entity')[1].class, "org", "Finding second entity");
    } else if ((testname == "spandeletion")  || (testname == "correction_spandeletion")) {
    } else if ((testname == "tokenannotationdeletion")  ||(testname == "correction_tokenannotationdeletion")) {
    } 

    if (testname == "correction_textchange") {
        if (assert_ok(annotations["untitleddoc.p.3.s.1.w.2.correction.1/new/t/current"], "Corrected annotation exists")) {
            globalassert.equal(annotations["untitleddoc.p.3.s.1.w.2.correction.1/new/t/current"].incorrection, "untitleddoc.p.3.s.1.w.2.correction.1", "Checking if annotation is in correction");
        }
        if (assert_ok(annotations["untitleddoc.p.3.s.1.w.2.correction.1"], "Correction exists")) {
            globalassert.equal(annotations["untitleddoc.p.3.s.1.w.2.correction.1"].class, "uncertain", "Checking correction and its class");
        }
    } else if (testname == "correction_textmerge") {
        var id = findcorrectionbytext("wegreden");
        if (id) {
            if (assert_ok(annotations[id + "/t/current"], "Corrected annotation exists")) {
                globalassert.equal(annotations[id + "/t/current"].incorrection, id,  "Checking if annotation is in correction");
            }
            var correction_id = structure[id].incorrection;
            if (assert_ok(annotations[correction_id], "Correction exists")) {
                globalassert.equal(annotations[correction_id].class, "uncertain", "Checking correction and its class");
            }
        }
    } else if ((testname == "correction_tokenannotationchange") ) {
        if (assert_ok(annotations["untitleddoc.p.3.s.6.w.8.correction.1/new/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"], "Corrected annotation exists")) {
            globalassert.equal(annotations["untitleddoc.p.3.s.6.w.8.correction.1/new/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].class, "LID(onbep,stan,rest)", "Testing POS class");
            globalassert.equal(annotations["untitleddoc.p.3.s.6.w.8.correction.1/new/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].incorrection, "untitleddoc.p.3.s.6.w.8.correction.1", "Checking if annotation is in correction");
        }
        globalassert.equal(annotations["untitleddoc.p.3.s.6.w.8.correction.1"].class, "uncertain", "Checking correction and its class");
    } else if ((testname == "correction_spanchange") ) {
        globalassert.equal(getannotations('untitleddoc.p.3.s.9.w.9', 'entity')[0].class, "loc", "Finding named entity on original word and checking class");
        globalassert.equal(getannotations('untitleddoc.p.3.s.9.w.7', 'entity')[0].class, "loc", "Finding named entity on new word and checking class");
    } else if ((testname == "comment_span") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children.length, 1);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children[0].type, "comment");
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children[0].value, "This is a comment");
    } else if ((testname == "confidence_set") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.3/lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].confidence, 0.88);
    } else if ((testname == "confidence_edit") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].confidence, 0.88);
    } else if ((testname == "confidence_unset") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.chunking.1.chunk.2"].confidence, undefined);
    } else if ((testname == "feature_edit") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children.length, 4);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[0].subset, "head");
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[0].class, "ADJX");
    } else if ((testname == "feature_edit2") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children.length, 4);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[0].subset, "headX");
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[0].class, "ADJX");
    } else if ((testname == "feature_add") ) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children.length, 5);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[4].subset, "testsubset");
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children[4].class, "testvalue");
    } else if ((testname == "feature_delete")) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.w.11/pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].children.length, 3);
    } else if ((testname == "spanrole_respan")) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.dependencies.1.dependency.10"].children.length, 2);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.dependencies.1.dependency.10"].children[0].targets.length, 2);
    } else if ((testname == "spanrole_delete")) {
        globalassert.equal(annotations["untitleddoc.p.3.s.1.dependencies.1.dependency.10"].children.length, 1);
        globalassert.equal(annotations["untitleddoc.p.3.s.1.dependencies.1.dependency.10"].children[0].type, "dep");
    }
    
    console.log("(testeval) (qunit.start)");
    QUnit.start(); //continue (for asynchronous tests)
}
