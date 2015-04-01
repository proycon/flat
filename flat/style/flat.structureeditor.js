function structureeditor_onupdate() {
    $('div.deepest>span.lbl').show();
}
function structureeditor_contentloaded() {
    $('div.F').prepend("<span class=\"sinfo\"></span>" )
    $('div.F').each(function(){
        if (this.id) {
            $(">.sinfo",this).append(" <span class=\"id\">" + this.id + "</span>");
        }
    });
    $("div.div>.sinfo").html("division")
    $("div.p>.sinfo").html("paragraph")
    $("div.s>.sinfo").html("sentence")
    $("div.quote>.sinfo").html("quote")
    $("div.list>.sinfo").html("list")
    $("div.listitem>.sinfo").html("listitem")
    $("div.figure>.sinfo").html("figure")
    $("div.w>.sinfo").html("w")
    $("div.head>.sinfo").html("head")
    $("div.br>.sinfo").html("br")
    $("div.whitespace>.sinfo").html("whitespace")
    $("div.caption>.sinfo").html("caption")
    $("div.event>.sinfo").html("event")
    $("div.table>.sinfo").html("table")
    $("div.tablehead>.sinfo").html("tablehead")
    $("div.row>.sinfo").html("row")
    $("div.cell>.sinfo").html("cell")
    $("div.text>.sinfo").html("text")
    $('div.s').css('display', 'inline');
}

function structureeditor_ontimer() {

}

function structureeditor_oninit() {
    loadperspectivemenu();

    $('#document').mouseleave( function() {
        $('#leftpane').show();
    });  
    $('#document').mouseenter( function() {
        $('#leftpane').hide();
    });  
}
