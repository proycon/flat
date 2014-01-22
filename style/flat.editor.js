editoropen = false;


function editor_onclick(element) {
    //open editor
    editoropen = true;
}

function editor_onmouseenter(element) {
    sethover(element);
    if (!editoropen) {
        showinfo(element);
    }
}


function editor_oninit() {
    viewer_oninit();
}
