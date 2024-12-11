window.addEventListener('DOMContentLoaded', function() {
  const mainDiv = document.querySelector("#main");
	
  handlePaste = function(ev) {
    event.preventDefault();
    console.debug("paste event = ", ev);
    let pastedText = (event.clipboardData || window.clipboardData).getData("text");
    let nte = document.createElement("p");
    nte.appendChild(document.createTextNode(pastedText));
    mainDiv.appendChild(nte);
  }
  
  document.addEventListener('paste', handlePaste);
}, true);


