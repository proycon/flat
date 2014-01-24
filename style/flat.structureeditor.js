
function structureeditor_oninit() {
    $('div.F span.lbl').hide();
    $('div.F').prepend("<span class=\"hb\"></span>" )
    //set headerbar text
    $("div.div>.hb").html("division")
    $("div.p>.hb").html("paragraph")
    $("div.s>.hb").html("sentence")
    $("div.quote>.hb").html("quote")
    $("div.list>.hb").html("list")
    $("div.listitem>.hb").html("listitem")
    $("div.figure>.hb").html("figure")
    $("div.w>.hb").html("w")
    $("div.head>.hb").html("head")
    $("div.br>.hb").html("br")
    $("div.whitespace>.hb").html("whitespace")
    $("div.caption>.hb").html("caption")
    $("div.event>.hb").html("event")
    $("div.table>.hb").html("table")
    $("div.tablehead>.hb").html("tablehead")
    $("div.row>.hb").html("row")
    $("div.cell>.hb").html("cell")

    $('div.deepest>span.lbl').show();
}
