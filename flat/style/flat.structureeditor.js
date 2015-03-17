
function structureeditor_oninit() {
    $('div.F span.lbl').hide();
    /*
    $('div.F').prepend(function(){
      if (!$(this).hasClass('w')) {
       return "<div class=\"slot\" onclick=\"structureeditor('" + $(this).id + "', null)\">+</div>"
      } 
    })
    */
    $('div.F').prepend("<span class=\"sinfo\"></span>" )
    /*
    $('div.F').after(function(){
      if (!$(this).hasClass('text')) {
       //return "<div class=\"slot\" onclick=\"structureeditor('" + $(this).parent().id + "','" + this.id + "')\">+</div>"
       
      } else {
       return "";
      } 
    });
    */
    //set headerbar text
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

    $('div.F').each(function(){
        if (this.id) {
            $(">.sinfo",this).append(" <span class=\"id\">" + this.id + "</span>");
        }
    });
    $('div.deepest>span.lbl').show();
}
