var newfields = 0;
var metadatafields = 0;

function metadata_ontimer() {
}

function metadata_addfield(key,i) {
    var s = "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"" + key + "\" /></td><td class=\"value\">";
    if ((configuration.metadataconstraints) && (configuration.metadataconstraints[key])) {
        s = s + metadata_getvalueoptions(key, i);
    } else if (metadata[key] !== undefined) {
        s = s + "<input id=\"metavalue" + i + "\" value=\"" + metadata[key] + "\" />";
    } else if ((configuration.autometadata) && (configuration.autometadata[key] !== undefined)) {
        s = s + "<input id=\"metavalue" + i + "\" value=\"" + configuration.autometadata[key] + "\" />";
    } else {
        s = s + "<input id=\"metavalue" + i + "\" value=\"\" />";
    }
    s = s + "</td></tr>\n";
    return s;
}

function metadata_oninit() {
    var s = "<h2>Metadata</h2>";
    s = s + "<table><tr><th>Metadata Field/Key</th><th>Value</th></tr>\n";

    var i = 0;
    Object.keys(metadata).forEach(function(key){
        s = s + metadata_addfield(key,i);
        i++;
    });

    metadatafields = i;
    newfields = 0;
    if (configuration.autometadata) {
        Object.keys(configuration.autometadata).forEach(function(key){
            if (!(key in metadata)) {
                s = s + metadata_addfield(key,metadatafields+newfields);
                newfields++;
            }
        });
    }
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    s = s + "</table>";
    s = s + "<div class=\"buttons\"><button id=\"metadatasubmit\" onclick=\"metadata_submit()\">Save changes</button> <button onclick=\"metadata_addinput()\">+</button></div>";
    $('#metadata').html(s);
    metadata_addnewemptyfield();
}

function metadata_addnewemptyfield() {
    var i = metadatafields + newfields;
    newfields++;
    var s = "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"\" onchange=\"metadata_changekey(" + i + ")\" /></td><td class=\"value\"><input id=\"metavalue" + i + "\" value=\"\" /></td></tr>\n";
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    $('#metadataplaceholder')[0].outerHTML = s;
    if (configuration.metadataconstraints) {
        var suggestions = [];
        Object.keys(configuration.metadataconstraints).forEach(function(key){
            suggestions.push(key);
        });
        $('#metakey' + i).autocomplete({source: suggestions});
    }
}


function metadata_getvalueoptions(key, i) {
    //get value options from metadata constraints
    var s = "<select id=\"metavalue" + i +"\">";
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
        if ((metadata[key] !== undefined)) {
            //value not in constraints but it has been set anyway, add it to the list
            s = s + "<option value=\"" + metadata[key] + "\" selected=\"selected\">" + metadata[key] + "</option>";
        } else if (configuration.autometadata[key] !== undefined) {
            s = s + "<option value=\"" + configuration.autometadata[key] + "\" selected=\"selected\">" + configuration.autometadata[key] + "</option>";
        }
    }
    s = s + "</select>";
    return s;
}

function metadata_changekey(i) {
    //triggered when a new key has been entered (onChange)
    var key = $('#metakey'+i).val();
    if ((configuration.metadataconstraints) && (configuration.metadataconstraints[key])) {
        var value = $('#metavalue'+i).val();
        if (value === "") {
            $('#metavalue' + i)[0].outerHTML = metadata_getvalueoptions(key, i);
        }
    }
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
            url: base_prefix + "/" + namespace + "/"+ docid + "/query/",
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
