
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



QUnit.asyncTest("textchange", function(assert){
    testinit("textchange",assert);
    $(valid('#untitleddoc.p.3.s.1.w.2')).trigger('click');
    $('#editfield1text').val("mijn"); 
    $('#editform1direct').trigger('click'); 
    $('#editorsubmit').trigger('click'); 
});


// TESTS -- Second stage

function testeval(data) {
    if (data.testmessage  == "") data.testmessage = "ok";
    globalassert.ok(data.testresult, "Backend test: " + data.testmessage ) 

    if (testname == "textchange") {
        testtext('#untitleddoc.p.3.s.1.w.2', "mijn");
    }

    QUnit.start(); //continue (for asynchronous tests)
}
