
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

// TESTS -- Second stage

function testeval(data) {
    if (data.testmessage  == "") data.testmessage = "ok";
    globalassert.ok(data.testresult, "Backend test: " + data.testmessage ) 

    if (testname == "textchange") {
        testtext('#untitleddoc.p.3.s.1.w.2', "mijn");
    } else if (testname == "textmerge") {
        testtext('#untitleddoc.p.3.s.1.w.14', "wegreden");
    } else if (testname == "multiannotchange") {
        testtext('#untitleddoc.p.3.s.6.w.8', "het");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["pos/http://ilk.uvt.nl/folia/sets/frog-mbpos-cgn"].class, "LID(onbep,stan,rest)", "Testing POS class");
        globalassert.equal(annotations['untitleddoc.p.3.s.6.w.8']["lemma/http://ilk.uvt.nl/folia/sets/frog-mblem-nl"].class, "het", "Testing lemma class");
    } else if (testname == "addentity") {
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12']["untitleddoc.p.3.s.1.entity.1"].class, "per", "Finding named entity on first word");
        globalassert.equal(annotations['untitleddoc.p.3.s.1.w.12b']["untitleddoc.p.3.s.1.entity.1"].class, "per", "Finding named entity on second word");
    } else if (testname == "worddelete") {
        globalassert.equal($(valid('#untitleddoc.p.3.s.8.w.10')).length, 0, "Test if word is removed from interface");
    } else if (testname == "wordsplit") {
        globalassert.equal($(valid('#untitleddoc.p.3.s.12.w.5')).length, 0, "Test if original word is removed from interface");

    }

    QUnit.start(); //continue (for asynchronous tests)
}
