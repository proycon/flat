
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
    annotations = {} //reset, will be newly populated
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
    return selector
}

function ui_edit(selectexpression, value) {
    var e = ui_get(selectexpression)
    e.val(value);
    globalassert.equal( e.val() , value, "[UI] Change text of  " + selectexpression + " to \"" + value + "\"");
}

function ui_choose(selectexpression, value) {
    var e = ui_get(selectexpression)
    e.prop('selectedIndex',value);
    globalassert.equal( e.prop('selectedIndex') , value, "[UI] Choosing " + selectexpression + " , selecting option \"" + value + "\"");
    e.trigger('change');
}

function ui_click(selectexpression) {
    ui_get(selectexpression).trigger('click');
}

//we want tests in the order defined here
//our tests are run sequentially
QUnit.config.reorder = false;
testname = ""; //global variable
globalassert = null;

//these will need to be adjusted when set definitions change
FLATTEST_ADD_NER = 5; 
FLATTEST_CORRECTIONCLASS_UNCERTAIN = 11;

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
    ui_edit('#editfield1text',"mijn"); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Class change (token annotation)", function(assert){
    testinit("classchange_token",assert);
    ui_click('#untitleddoc.p.3.s.1.w.2');
    ui_edit('#editfield3',"mijn");  //lemma
    ui_click('#editform3direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Class change (span annotation)", function(assert){
    testinit("classchange_span",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    ui_choose('#editfield4',21); 
    ui_click('#editform4direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Text Change (Merging multiple words)", function(assert){
    testinit("textmerge",assert);
    ui_click('#untitleddoc.p.3.s.1.w.5');
    ui_click('#spanselector1');
    ui_click('#untitleddoc.p.3.s.1.w.4');
    ui_click('#spanselector1');
    ui_edit('#editfield1text',"wegreden"); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Changing Text and multiple token annotations at once", function(assert){
    testinit("multiannotchange",assert);
    ui_click('#untitleddoc.p.3.s.6.w.8');
    ui_edit('#editfield1text',"het"); 
    ui_click('#editform1direct'); 
    ui_edit('#editfield2',"LID(onbep,stan,rest)");  //pos
    ui_click('#editform2direct'); 
    ui_edit('#editfield3',"het");  //lemma
    ui_click('#editform3direct'); 
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
    ui_choose('#editfield2',5); //corresponds to person as long as the set definition doesn't change

    //select span
    ui_click('#spanselector2'); 
    ui_click('#untitleddoc.p.3.s.1.w.12');
    ui_click('#spanselector2'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Adding new overlapping span", function(assert){
    testinit("newoverlapspan",assert);
    ui_click('#untitleddoc.p.3.s.9.w.8');
    ui_choose('#editfield6',4); //corresponds to organisation as long as the set definition doesn't change
    ui_click('#spanselector6'); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    //8 and 9 are already selected!
    ui_click('#spanselector6'); 
    ui_click('#editform6new'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word deletion", function(assert){
    testinit("worddelete",assert);
    ui_click('#untitleddoc.p.3.s.8.w.10');
    ui_edit('#editfield1text',""); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word split", function(assert){
    testinit("wordsplit",assert);
    ui_click('#untitleddoc.p.3.s.12.w.5');
    ui_edit('#editfield1text',"4 uur"); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word insertion to the right", function(assert){
    testinit("wordinsertionright",assert);
    ui_click('#untitleddoc.p.3.s.12.w.1');
    ui_edit('#editfield1text',"en we"); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Word insertion to the left", function(assert){
    testinit("wordinsertionleft",assert);
    ui_click('#untitleddoc.p.3.s.13.w.12');
    ui_edit('#editfield1text',"we hoorden"); 
    ui_click('#editform1direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span change", function(assert){
    testinit("spanchange",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    ui_click('#spanselector8'); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    ui_click('#spanselector8'); 
    ui_click('#editform8direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Deletion of token annotation", function(assert){
    testinit("tokenannotationdeletion",assert);
    ui_click('#untitleddoc.p.3.s.8.w.4');
    ui_edit('#editfield3',""); 
    ui_click('#editform3direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Span deletion", function(assert){
    testinit("spandeletion",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    ui_choose('#editfield8',0); //corresponds to empty class, implies deletion
    ui_click('#editform8direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Setting confidence",function(assert){
    testinit("confidence_set",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    ui_click('#confidencecheck3');
    $('#confidenceslider3').slider('value',88);
    ui_click('#editform3direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Editing confidence",function(assert){
    testinit("confidence_edit",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    $('#confidenceslider4').slider('value',88);
    ui_click('#editform4direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("Unsetting confidence",function(assert){
    testinit("confidence_unset",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    ui_click('#confidencecheck4');
    ui_click('#editform4direct'); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Text Change", function(assert){
    testinit("correction_textchange",assert);
    ui_click('#untitleddoc.p.3.s.1.w.2');
    ui_edit('#editfield1text',"mijn"); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Text Change (Merging multiple words)", function(assert){
    testinit("correction_textmerge",assert);
    ui_click('#untitleddoc.p.3.s.1.w.5');
    ui_click('#spanselector1');
    ui_click('#untitleddoc.p.3.s.1.w.4');
    ui_click('#spanselector1');
    ui_edit('#editfield1text',"wegreden"); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Changing token annotation", function(assert){
    testinit("correction_tokenannotationchange",assert);
    ui_click('#untitleddoc.p.3.s.6.w.8');
    ui_edit('#editfield2',"LID(onbep,stan,rest)");  //pos
    ui_click('#editform2correction'); 
    ui_choose('#editform2correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word deletion", function(assert){
    testinit("correction_worddelete",assert);
    ui_click('#untitleddoc.p.3.s.8.w.10');
    ui_edit('#editfield1text',""); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word split", function(assert){
    testinit("correction_wordsplit",assert);
    ui_click('#untitleddoc.p.3.s.12.w.5');
    ui_edit('#editfield1text',"4 uur"); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN); 
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[As correction] Word insertion to the right", function(assert){
    testinit("correction_wordinsertionright",assert);
    ui_click('#untitleddoc.p.3.s.12.w.1');
    ui_edit('#editfield1text',"en we"); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Word insertion to the left", function(assert){
    testinit("correction_wordinsertionleft",assert);
    ui_click('#untitleddoc.p.3.s.13.w.12');
    ui_edit('#editfield1text',"we hoorden"); 
    ui_click('#editform1correction'); 
    ui_choose('#editform1correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Deletion of token annotation", function(assert){
    testinit("correction_tokenannotationdeletion",assert);
    ui_click('#untitleddoc.p.3.s.8.w.4');
    ui_edit('#editfield3',""); 
    ui_click('#editform3correction'); 
    ui_choose('#editform3correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Span change", function(assert){
    testinit("correction_spanchange",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    ui_click('#spanselector8'); 
    ui_click('#untitleddoc.p.3.s.9.w.7');
    ui_click('#spanselector8'); 
    ui_click('#editform8correction'); 
    ui_choose('#editform8correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("[As correction] Span deletion", function(assert){
    testinit("correction_spandeletion",assert);
    ui_click('#untitleddoc.p.3.s.9.w.9');
    ui_choose('#editfield8',0); //corresponds to empty class, implies deletion
    ui_click('#editform8correction'); 
    ui_choose('#editform8correctionclass',FLATTEST_CORRECTIONCLASS_UNCERTAIN);  //corresponds to uncertain, as long as the set definition doesn't change
    ui_click('#editorsubmit'); 
});
QUnit.asyncTest("[Higher order] Adding a comment to a span annotation",function(assert){
    testinit("comment_span",assert);
    ui_click('#untitleddoc.p.3.s.1.w.3');
    ui_click('#editform4direct'); 
    ui_click('#editoraddhigherorder4_comment');
    ui_edit('#higherorderfield4_0',"This is a comment"); 
    ui_click('#editorsubmit'); 
});

QUnit.asyncTest("Tests completed", function(assert){
    $('#wait').hide();
    havecontent = false;
    $('#document').html("(All tests completed!)");
    annotations = {} //reset, will be newly populated
});

function findcorrectionbytext(text) {
    for (var key in annotations) {
        if ((annotations[key]["t/undefined:current"]) && (annotations[key]["t/undefined:current"].incorrection) && (annotations[key]["t/undefined:current"].incorrection.length == 1)  && (annotations[key]["t/undefined:current"].text == text)) return annotations[key]['self'].id;
    }
    return null;
}

// TESTS -- Second stage, the actual test evaluation

function testeval(data) {
    console.log("(testeval) evaluating test result");
    if (data.testmessage == "") data.testmessage = "ok";

    if (data.queries) {
        globalassert.ok(data.testresult, "Backend Queries: " + data.queries.join(" -- ") );
    } else {
        globalassert.ok(false, "Backend did not return queries! This probably means an exception occurred in the backend!");
    }
    globalassert.ok(data.testresult, "Backend Test: " + data.testmessage.replace("\n"," -- " ) );

    if ((testname == "textchange") || (testname == "correction_textchange")) {
        testtext('#untitleddoc.p.3.s.1.w.2', "mijn");
    } else if (testname == "classchange_token") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.2']["lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "mijn");
    } else if (testname == "classchange_span") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].class, "X");
    } else if ((testname == "textmerge")) {
        testtext('#untitleddoc.p.3.s.1.w.14', "wegreden");
    } else if ((testname == "correction_textmerge")) {
        id = findcorrectionbytext("wegreden")
        globalassert.notEqual(id,null,"Testing whether correction found (by text)")
        testtext('#' + id, "wegreden");
    } else if ((testname == "multiannotchange") ) {
        testtext('#untitleddoc.p.3.s.6.w.8', "het");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].class, "LID(onbep,stan,rest)", "Testing POS class");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "het", "Testing lemma class");
    } else if ((testname == "addentity") || (testname == "correction_addentity")) {
        var e = null;
        for (var key in annotations['untitleddoc.p.3.s.1.w.12']) {
            if (annotations['untitleddoc.p.3.s.1.w.12'][key].type == "entity") {
                e = annotations['untitleddoc.p.3.s.1.w.12'][key];
                break;
            }
        }
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12'][e.id].class, "per", "Finding named entity on first word");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12b'][e.id].class, "per", "Finding named entity on second word");
    } else if ((testname == "worddelete") ||  (testname == "correction_worddelete")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.8.w.10')).length, 0, "Test if word is removed from interface");
    } else if ((testname == "wordsplit")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.17')).length, 1, "Checking presence of new words (1/2)");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.18')).length, 1, "Checking presence of new words (1/2)");
    } else if ((testname == "correction_wordsplit")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");
        id = findcorrectionbytext("4")
        globalassert.equal($(valid('#' + id )).length, 1, "Checking presence of new words (1/2)");
        id = findcorrectionbytext("uur")
        globalassert.equal($(valid('#'+ id )).length, 1, "Checking presence of new words (1/2)");
    } else if ((testname == "wordinsertionright"))  {
        testtext('#untitleddoc.p.3.s.12.w.1',"en")
        testtext('#untitleddoc.p.3.s.12.w.17',"we")
    } else if ((testname == "wordinsertionleft")) {
        testtext('#untitleddoc.p.3.s.13.w.12',"hoorden")
        testtext('#untitleddoc.p.3.s.13.w.16',"we")
    } else if ((testname == "correction_wordinsertionright"))  {
        id = findcorrectionbytext("we")
        testtext('#untitleddoc.p.3.s.12.w.1',"en")
        testtext('#' + id,"we")
    } else if ((testname == "correction_wordinsertionleft"))  {
        id = findcorrectionbytext("we")
        testtext('#untitleddoc.p.3.s.13.w.12',"hoorden")
        testtext('#' + id,"we")
    } else if ((testname == "spanchange") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9']["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Finding named entity on original word");
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.7']["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Finding named entity on new word");
    } else if ((testname == "newoverlapspan") || (testname == "correction_newoverlapspan")) {
        var e = null;
        var e2 = null;
        for (var key in annotations['untitleddoc.p.3.s.9.w.9']) {
            if (annotations['untitleddoc.p.3.s.9.w.9'][key].type == "entity") {
                if (e != null) {
                    e2 = annotations['untitleddoc.p.3.s.9.w.9'][key];
                    break;
                } else {
                    e = annotations['untitleddoc.p.3.s.9.w.9'][key];
                }
            }
        }
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9'][e.id].class, "loc", "Finding first entity");
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9'][e2.id].class, "org", "Finding second entity");
    } else if ((testname == "spandeletion")  || (testname == "correction_spandeletion")) {
    } else if ((testname == "tokenannotationdeletion")  ||(testname == "correction_tokenannotationdeletion")) {
    } 

    if (testname == "correction_textchange") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.2']["t/undefined:current"]['incorrection'][0], "untitleddoc.p.3.s.1.w.2.correction.1", "Checking if annotation is in correction");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.2']["untitleddoc.p.3.s.1.w.2.correction.1"].class, "uncertain", "Checking correction and its class");
    } else if (testname == "correction_textmerge") {
        id = findcorrectionbytext("wegreden")
        globalassert.equal(annotations[id]["t/undefined:current"]['incorrection'].length,1, "Checking if annotation is in correction");
        corr_id = annotations[id]["t/undefined:current"]['incorrection'][0];
        globalassert.equal(annotations['untitleddoc.p.3.s.1'][corr_id].class, "uncertain", "Checking correction and its class");
    } else if ((testname == "correction_tokenannotationchange") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"].class, "LID(onbep,stan,rest)", "Testing POS class");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn-nonexistant"]['incorrection'][0] , "untitleddoc.p.3.s.6.w.8.correction.1", "Checking if annotation is in correction");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["untitleddoc.p.3.s.6.w.8.correction.1"].class, "uncertain", "Checking correction and its class");
    } else if ((testname == "correction_spanchange") ) {
        var e = null;
        for (var key in annotations['untitleddoc.p.3.s.9.w.9']) {
            if (annotations['untitleddoc.p.3.s.9.w.9'][key].type == "entity") {
                e = annotations['untitleddoc.p.3.s.9.w.9'][key];
                break;
            }
        }
        if (e) {
            globalassert.ok("Finding named entity on original word");
            globalassert.equal(e.class, "loc", "Checking class of named entity on original word");
        } else {
            globalassert.ok(false, "Finding named entity on original word");
        }

        var e = null;
        for (var key in annotations['untitleddoc.p.3.s.9.w.7']) {
            if (annotations['untitleddoc.p.3.s.9.w.7'][key].type == "entity") {
                e = annotations['untitleddoc.p.3.s.9.w.7'][key];
                break;
            }
        }
        if (e) {
            globalassert.ok("Finding named entity on new word");
            globalassert.equal(e.class, "loc", "Checking class of named entity on new word");
        } else {
            globalassert.ok(false, "Finding named entity on new word");
        }
    } else if ((testname == "comment_span") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children.length, 1);
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children[0].type, "comment");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].children[0].value, "This is a comment");
    } else if ((testname == "confidence_set") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].confidence, 0.88);
    } else if ((testname == "confidence_edit") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].confidence, 0.88);
    } else if ((testname == "confidence_unset") ) {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.3']["untitleddoc.p.3.s.1.chunking.1.chunk.2"].confidence, undefined);
    }
    
    console.log("(testeval) (qunit.start)");
    QUnit.start(); //continue (for asynchronous tests)
}
