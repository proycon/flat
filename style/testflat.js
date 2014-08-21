
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



//we want tests in the order defined here
//our tests are run sequentially
QUnit.config.reorder = false;
testname = ""; //global variable
globalassert = "";;

//Tests - First stage

QUnit.asyncTest("init", function(assert) {
    expect(1);
    testname = "init";
    globalassert = assert;
     

    //no need to POST anything, so no editor submit, we just do a GET
    $.ajax({
        type: 'GET',
        url: "/editor/testflat/"+ testname + "/",
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
    
});


// TESTS -- Second stage

function testeval(data) {
    if (data.testmessage == "") data.testmessage = "ok";
    globalassert.ok(data.testresult, "Backend test: " + data.testmessage ) 

    if (testname == "init") {
        //doesn't do much
        globalassert.ok(annotations.length > 0, "Annotations obtained");
    }
    QUnit.start(); //continue (for asynchronous tests)
}
