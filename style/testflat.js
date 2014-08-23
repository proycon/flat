
//will be invoked by editor submit
function testbackend(testname,username,sid,queries) {
    $.ajax({
        type: 'POST',
        url: "/editor/testflat/"+ testname + "/annotate/",
        contentType: "application/json",
        //processData: false,
        data: JSON.stringify( { 'annotator': username, 'sid': sid, 'queries': queries}), 
        success: function(data) {
            if (data.error) {
                $('#wait').hide();
                testeval({'testresult': false, 'testmessage': data.error});
            } else {
                editfields = 0;
                closeeditor();
                update(data);
                testeval(data);
            }
        },
        error: function(req,err,exception) { 
            $('#wait').hide();
            testeval({'testresult': false, 'testmessage': "Editor submission failed: " + req + " " + err + " " + exception});
        },
        dataType: "json"
    });
}

function testinit(name, assert) {
    testname = name;
    globalassert = assert;
}


function testtext(elementselector, reference, message="") {
    if (message == "") message = "Testing whether text of " + elementselector + " is \"" + reference + "\"";
    globalassert.equal($(valid(elementselector)).text().trim(), reference, message);
}

//we want tests in the order defined here
//our tests are run sequentially
QUnit.config.reorder = false;
testname = ""; //global variable
globalassert = "";;

//Tests - First stage



QUnit.asyncTest("Text Change", function(assert){
    testinit("textchange",assert);
    $(valid('#untitleddoc.p.3.s.1.w.2')).trigger('click');
    $('#editfield1text').val("mijn"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});


QUnit.asyncTest("Text Change (Merging multiple words)", function(assert){
    testinit("textmerge",assert);
    $(valid('#untitleddoc.p.3.s.1.w.5')).trigger('click');
    $('#spanselector1').trigger('click');
    $(valid('#untitleddoc.p.3.s.1.w.4')).trigger('click');
    $('#spanselector1').trigger('click');
    $('#editfield1text').val("wegreden"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Changing Text and multiple token annotations at once", function(assert){
    testinit("multiannotchange",assert);
    $(valid('#untitleddoc.p.3.s.6.w.8')).trigger('click');
    $('#editfield1text').val("het"); 
    $('#editform1direct').trigger('click'); 
    $('#editfield2').val("LID(onbep,stan,rest)");  //pos
    $('#editform2direct').trigger('click'); 
    $('#editfield3').val("het");  //lemma
    $('#editform3direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Adding a new span annotation, out of order selection", function(assert){
    //tests adding new fields
    //tests span selection (deliberately selected out of order)

    testinit("addentity",assert);
    $(valid('#untitleddoc.p.3.s.1.w.12b')).trigger('click');
    //selected named entity to add
    $('#editoraddablefields').prop('selectedIndex',4); //corresponds to NER as long as teh declarations don't change
    $('#editoraddablefields').trigger('change');
    $('#editoraddfield').trigger('click'); //click add button

    //fill new field:
    $('#editfield2').prop('selectedIndex',5); //corresponds to person as long as the set definition doesn't change
    $('#editfield2').trigger('change'); 

    //select span
    $('#spanselector2').trigger('click'); 
    $(valid('#untitleddoc.p.3.s.1.w.12')).trigger('click');
    $('#spanselector2').trigger('click'); 
    

    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Adding new overlapping span", function(assert){
    testinit("newoverlapspan",assert);
    $(valid('#untitleddoc.p.3.s.9.w.8')).trigger('click');
    $('#editfield6').prop('selectedIndex',4); //corresponds to organisation as long as the set definition doesn't change
    $('#editfield6').trigger('change'); 
    $('#spanselector6').trigger('click'); 
    $(valid('#untitleddoc.p.3.s.9.w.7')).trigger('click');
    //8 and 9 are already selected!
    $('#spanselector6').trigger('click'); 
    $('#editform6new').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Word deletion", function(assert){
    testinit("worddelete",assert);
    $(valid('#untitleddoc.p.3.s.8.w.10')).trigger('click');
    $('#editfield1text').val(""); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Word split", function(assert){
    testinit("wordsplit",assert);
    $(valid('#untitleddoc.p.3.s.12.w.5')).trigger('click');
    $('#editfield1text').val("4 uur"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Word insertion to the right", function(assert){
    testinit("wordinsertionright",assert);
    $(valid('#untitleddoc.p.3.s.12.w.1')).trigger('click');
    $('#editfield1text').val("en we"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});


QUnit.asyncTest("Word insertion to the left", function(assert){
    testinit("wordinsertionleft",assert);
    $(valid('#untitleddoc.p.3.s.13.w.12')).trigger('click');
    $('#editfield1text').val("we hoorden"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Span change", function(assert){
    testinit("spanchange",assert);
    $(valid('#untitleddoc.p.3.s.9.w.9')).trigger('click');
    $('#spanselector8').trigger('click'); 
    $(valid('#untitleddoc.p.3.s.9.w.7')).trigger('click');
    $('#spanselector8').trigger('click'); 
    $('#editform8direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Deletion of token annotation", function(assert){
    testinit("tokenannotationdeletion",assert);
    $(valid('#untitleddoc.p.3.s.8.w.4')).trigger('click');
    $('#editfield3').val(""); 
    $('#editform3direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});

QUnit.asyncTest("Span deletion", function(assert){
    testinit("spandeletion",assert);
    $(valid('#untitleddoc.p.3.s.9.w.9')).trigger('click');
    $('#editfield8').prop('selectedIndex',0); //corresponds to empty class, implies deletion
    $('#editfield8').trigger('change'); 
    $('#editform8direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});


QUnit.asyncTest("[As correction] Text Change", function(assert){
    testinit("correction_textchange",assert);
    $(valid('#untitleddoc.p.3.s.1.w.2')).trigger('click');
    $('#editfield1text').val("mijn"); 
    $('#editform1correction').trigger('click'); 
    $('#editform1correctionclass').prop('selectedIndex',2); 
    $('#editform1correctionclass').trigger('change'); 
    $('#editorsubmit').trigger('click'); 
});


QUnit.asyncTest("[As correction] Text Change (Merging multiple words)", function(assert){
    testinit("correction_textmerge",assert);
    $(valid('#untitleddoc.p.3.s.1.w.5')).trigger('click');
    $('#spanselector1').trigger('click');
    $(valid('#untitleddoc.p.3.s.1.w.4')).trigger('click');
    $('#spanselector1').trigger('click');
    $('#editfield1text').val("wegreden"); 
    $('#editform1correction').trigger('click'); 
    $('#editform1correctionclass').prop('selectedIndex',2); 
    $('#editform1correctionclass').trigger('change'); 
    $('#editorsubmit').trigger('click'); 
});
// TESTS -- Second stage

function testeval(data) {
    if (data.testmessage  == "") data.testmessage = "ok";

    if (data.queries) {
        globalassert.ok(data.testresult, "Backend Queries: " + data.queries.join(" -- ") );
    } else {
        globalassert.ok(false, "Backend did not return queries! This probably means an exception occurred in the backend!");
    }
    globalassert.ok(data.testresult, "Backend Test: " + data.testmessage.replace("\n"," -- " ) );

    if ((testname == "textchange") || (testname == "correction_textchange")) {
        testtext('#untitleddoc.p.3.s.1.w.2', "mijn");
    } else if ((testname == "textmerge")|| (testname == "correction_textmerge")) {
        testtext('#untitleddoc.p.3.s.1.w.14', "wegreden");
    } else if ((testname == "multiannotchange") || (testname == "correction_multiannotchange")) {
        testtext('#untitleddoc.p.3.s.6.w.8', "het");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn"].class, "LID(onbep,stan,rest)", "Testing POS class");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "het", "Testing lemma class");
    } else if ((testname == "addentity") || (testname == "correction_addentity")) {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12']["untitleddoc.p.3.s.1.entity.1"].class, "per", "Finding named entity on first word");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12b']["untitleddoc.p.3.s.1.entity.1"].class, "per", "Finding named entity on second word");
    } else if ((testname == "worddelete") ||  (testname == "correction_worddelete")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.8.w.10')).length, 0, "Test if word is removed from interface");
    } else if ((testname == "wordsplit") ||(testname == "correction_wordsplit")) {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.17')).length, 1, "Checking presence of new words (1/2)");
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.18')).length, 1, "Checking presence of new words (1/2)");
    } else if ((testname == "wordinsertionright") || (testname == "correction_wordinsertionright"))  {
        testtext('#untitleddoc.p.3.s.12.w.1',"en")
        testtext('#untitleddoc.p.3.s.12.w.17',"we")
    } else if ((testname == "wordinsertionleft") || (testname == "correction_wordinsertionleft")) {
        testtext('#untitleddoc.p.3.s.13.w.12',"hoorden")
        testtext('#untitleddoc.p.3.s.13.w.16',"we")
    } else if ((testname == "spanchange") || (testname == "correction_spanchange")) {
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9']["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Finding named entity on original word");
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.7']["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Finding named entity on new word");
    } else if ((testname == "newoverlapspan") || (testname == "correction_newoverlapspan")) {
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9']["untitleddoc.p.3.s.9.entity.1"].class, "loc", "Finding first entity");
        globalassert.equal(annotations['untitleddoc.p.3.s.9.w.9']["untitleddoc.p.3.s.9.entity.1.entity.2"].class, "org", "Finding second entity");
    } else if ((testname == "spandeletion")  || (testname == "correction_spandeletion")) {
    } else if ((testname == "tokenannotationdeletion")  ||(testname == "correction_tokenannotationdeletion")) {
    } 

    if (testname == "correction_textchange") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.2']["t/undefined"]['incorrection'][0], "untitleddoc.p.3.s.1.w.2.correction.1", "Checking if annotation is in correction");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.2']["untitleddoc.p.3.s.1.w.2.correction.1"].class, "uncertain", "Checking correction and its class");
    }
    if (testname == "correction_textmerge") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.14']["t/undefined"]['incorrection'][0], "untitleddoc.p.3.s.1.correction.1", "Checking if annotation is in correction");
        globalassert.equal(annotations['untitleddoc.p.3.s.1']["untitleddoc.p.3.s.1.correction.1"].class, "uncertain", "Checking correction and its class");
    }

    QUnit.start(); //continue (for asynchronous tests)
}
