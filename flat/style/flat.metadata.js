
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
    s = s + "</table>";
    $('#metadata').html(s);
}
