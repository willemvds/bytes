import { Document } from './webapi.ts'

const handlePaste = function(ev: ClipboardEvent, mainDiv: Element) {
  ev.preventDefault();
  console.debug("paste event = ", ev);
  if (ev.clipboardData) {
    let pastedText = ev.clipboardData.getData("text");
    let nte = document.createElement("p");
    nte.appendChild(document.createTextNode(pastedText));
    mainDiv.appendChild(nte);
  }
}

function initMain() {
  const mainDiv = document.querySelector("#main");

  if (!mainDiv) {
    console.log("init failed");
    return;
  }

  document.addEventListener('paste', function(ev) {
	  handlePaste(ev, mainDiv);
  });

}

if (document.readyState === Document.STATE_LOADING) {
  // Loading hasn't finished yet
  document.addEventListener(Document.EVENT_DOM_CONTENT_LOADED, initMain);
} else {
  // `DOMContentLoaded` has already fired
  initMain();
}

