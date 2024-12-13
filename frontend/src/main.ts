import {
  Clipboard,
  Document,
  Events
} from './webapi.ts'

const mainDivId = 'main'

function handleDragOver (ev: Event, mainDiv: Element) {
  console.debug('dragOver event = ', ev)
  ev.preventDefault()
  console.debug(mainDiv)
}

function handleDrop (ev: Event, mainDiv: Element) {
  console.debug('drop event = ', ev)
  ev.preventDefault()
  const de = ev as DragEvent
  const dt = de.dataTransfer
  if (dt == null) {
    return
  }
  console.debug(mainDiv)
  console.debug('data transfer = ', dt)
  console.debug('files = ', dt.files)

  const fr = new FileReader()
  fr.onloadend = function (ev) {
    console.debug('loadend ev = ', ev)
    if ((ev.target == null) || !ev.target.result) {
    	return
    }

    const contents = ev.target.result
    if (typeof (contents) === 'string') {
      // const contentsText = new TextDecoder().decode(contents);
      const nte = document.createElement('p')
      nte.appendChild(document.createTextNode(contents))
      mainDiv.appendChild(nte)
    }
  }
  fr.readAsText(dt.files[0])
}

function handlePaste (ev: ClipboardEvent, mainDiv: Element) {
  ev.preventDefault()
  console.debug('paste event = ', ev)
  if (ev.clipboardData != null) {
    const pastedText = ev.clipboardData.getData(Clipboard.DATA_TEXT)
    const nte = document.createElement('p')
    nte.appendChild(document.createTextNode(pastedText))
    mainDiv.appendChild(nte)
  }
}

function initMain () {
  const mainDiv = document.querySelector(`#${mainDivId}`)

  if (mainDiv == null) {
    console.log('init failed')
    return
  }

  window.addEventListener(Events.DRAG_OVER, function (ev: Event) {
    ev.preventDefault()
  }, false)

  window.addEventListener(Events.DROP, function (ev) {
    handleDrop(ev, mainDiv)
  }, false)

  mainDiv.addEventListener(Events.DRAG_OVER, function (ev: Event) {
    handleDragOver(ev, mainDiv)
    return false
  })

  document.addEventListener(Events.PASTE, function (ev) {
    handlePaste(ev, mainDiv)
  })
}

if (document.readyState === Document.STATE_LOADING) {
  // Loading hasn't finished yet
  document.addEventListener(Events.DOM_CONTENT_LOADED, initMain)
} else {
  // `DOMContentLoaded` has already fired
  initMain()
}
