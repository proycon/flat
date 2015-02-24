
function structureeditor_oninit() {
    $('div.F span.lbl').hide();
    $('div.F').prepend(function(){
      if (!$(this).hasClass('w')) {
       return "<div class=\"slot\" onclick=\"structureeditor('" + $(this).id + "', null)\">+</div>"
      } 
    })
    $('div.F').prepend("<span class=\"hb\"></span>" )
    $('div.F').after(function(){
      if (!$(this).hasClass('text')) {
       return "<div class=\"slot\" onclick=\"structureeditor('" + $(this).parent().id + "','" + this.id + "')\">+</div>"
      } else {
       return "";
      } 
    });
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
    $("div.text>.hb").html("text")

    $('div.F').each(function(){
        if (this.id) {
            $(">.hb",this).append(" <span class=\"id\">" + this.id + "</span>");
        }
    });
    $('div.deepest>span.lbl').show();
}
