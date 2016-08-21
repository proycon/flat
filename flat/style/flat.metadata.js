
function metadata_ontimer() {
}

function metadata_oninit() {
    var s = "<h2>Metadata</h2>";
    s = s + "<table><tr><th>Metadata Field/Key</th><th>Value</th></tr>\n";

    var i = 0;
    Object.keys(metadata).forEach(function(key){
        s = s + "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"" + key + "\" /></td><td class=\"value\"><input id=\"metavalue" + i + "\" value=\"" + metadata[key] + "\" /></td></tr>\n";
        i++;
    });
    newfields = 0;
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    s = s + "</table>";
    s = s + "<div class=\"buttons\"><button id=\"metadatasubmit\" onclick=\"metadata_submit\">Save changes</button> <button onclick=\"metadata_addinput()\">+</button></div>";
    $('#metadata').html(s);
    metadata_addinput();
}

function metadata_addinput() {
    var i = metadata.length + newfields;
    newfields++; 
    var s = "<tr><td class=\"key\"><input id=\"metakey" + i + "\" value=\"\" /></td><td class=\"value\"><input id=\"metavalue" + i + "\" value=\"\" /></td></tr>\n";
    s = s + "<tr id=\"metadataplaceholder\"></tr>";
    $('#metadataplaceholder')[0].outerHTML = s;
}

function metadata_submit() {
}
