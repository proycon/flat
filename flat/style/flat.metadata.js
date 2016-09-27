var newfields = 0;
var metadatafields = 0;

function metadata_ontimer() {
}

function metadata_oninit() {
    var s = "<h2>Metadata</h2>";
    s = s + "<table><tr><th>Metadata Field/Key</th><th>Value</th></tr>\n";

    var i = 0;
    Object.keys(metadata).forEach(function(key){
        s = s + "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"" + key + "\" /></td><td class=\"value\">";
        if ((configuration.metadataconstraints) && (configuration.metadataconstraints[key])) {
            s = s + "<select id=\"metavalue" + i +"\">";
            var found = false;
            for (j = 0; j < configuration.metadataconstraints[key].length; j++) {
                if (configuration.metadataconstraints[key][j] == metadata[key]) {
                    s = s + "<option value=\"" + configuration.metadataconstraints[key][j] + "\" selected=\"selected\">" + configuration.metadataconstraints[key][j] + "</option>";
                    found = true;
                } else {
                    s = s + "<option value=\"" + configuration.metadataconstraints[key][j] + "\">" + configuration.metadataconstraints[key][j] + "</option>";
                }
            }
            if (!found) {
                //value not in constraints but it has been set anyway, add it to the list
                s = s + "<option value=\"" + metadata[key] + "\" selected=\"selected\">" + metadata[key] + "</option>";
            }
            s = s + "</select>";
        } else {
            s = s + "<input id=\"metavalue" + i + "\" value=\"" + metadata[key] + "\" />";
        }
        s = s + "</td></tr>\n";
        i++;
    });
    metadatafields = i;
    newfields = 0;
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    s = s + "</table>";
    s = s + "<div class=\"buttons\"><button id=\"metadatasubmit\" onclick=\"metadata_submit()\">Save changes</button> <button onclick=\"metadata_addinput()\">+</button></div>";
    $('#metadata').html(s);
    metadata_addinput();
}

function metadata_addinput() {
    var i = metadatafields + newfields;
    newfields++; 
    var s = "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"\" /></td><td class=\"value\"><input id=\"metavalue" + i + "\" value=\"\" /></td></tr>\n";
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    $('#metadataplaceholder')[0].outerHTML = s;
}

function metadata_submit() {
    var queries = [];
    var i = 0;
    Object.keys(metadata).forEach(function(key){
        var newkey = $('#metakey' + i).val();
        var newvalue = $('#metavalue' + i).val();
        if (newkey != key) {
            //key changed, delete this one
            queries.push("USE " + namespace + "/" + docid + " META " + key + "=NONE");
            //add a new one
            if (newkey !== "") {
                queries.push("USE " + namespace + "/" + docid + " META " + newkey + "=" + newvalue);
            }
        } else if (newvalue != metadata[key]) {
            queries.push("USE " + namespace + "/" + docid + " META " + key + "=" + newvalue);
        }
        i++;
    });
    //add new fields
    for (j = i; j < i+newfields; j++) {
        var newkey = $('#metakey' + j).val();
        var newvalue = $('#metavalue' + j).val();
        if (newkey) {
            queries.push("USE " + namespace + "/" + docid + " META " + newkey + "=" + newvalue);
        }
    }
    if (queries.length > 0) {
        $('#wait span.msg').val("Submitting changes");
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
                    location.reload(true); //refresh the page, the reload will also update the metadata index if used
                }
            },
            error: function(req,err,exception) {
                $('#wait').hide();
                alert("Editor submission failed: " + req.responseText);
            },
            dataType: "json"
        });
    } else {
        alert("No changes to submit");
    }
}
