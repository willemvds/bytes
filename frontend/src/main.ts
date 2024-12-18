import './style.css'

import {
  Clipboard,
  Document,
  Events
} from './webapi.ts'

const mainDivId = 'main'
const uploadButtonId = 'upload'

const imageExtensions = ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'tif', 'tiff', 'webp']

function hasImageExtension (filename: string) {
  for (let i = 0; i < imageExtensions.length; i++) {
    if (filename.includes(`.${imageExtensions[i]}`)) {
      return true
    }
  }

  return false
}

function handleDragOver (ev: Event, mainDiv: Element) {
  console.debug('dragOver event = ', ev)
  ev.preventDefault()
  console.debug(mainDiv)
}

// https://gist.github.com/jonleighton/958841
function arrayBufferToBase64 (arrayBuffer: ArrayBuffer) {
  let base64 = ''
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  const bytes = new Uint8Array(arrayBuffer)
  const byteLength = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength = byteLength - byteRemainder

  let a, b, c, d
  let chunk

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63 // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

function showImage (mainDiv: Element, content: ArrayBuffer) {
  const imageBytes = new Uint8Array(content)
  //  const imageBase64 = imageBytes.toBase64()
  //  const dec = new TextDecoder('ascii');
  const imageBase64 = arrayBufferToBase64(imageBytes)
  console.debug('base64 = ', imageBase64)
  const imageDataURL = 'data:image/jpg;base64,' + imageBase64
  const nte = document.createElement('img')
  nte.src = imageDataURL
  nte.className = 'imageview'
  // nte.appendChild(document.createTextNode(contents))
  mainDiv.appendChild(nte)
}

function showText (mainDiv: Element, content: ArrayBuffer) {
  const dec = new TextDecoder()
  const nte = document.createElement('p')
  nte.className = 'textview'
  nte.innerHTML = dec.decode(content).replace('\n', '<br>')
  mainDiv.appendChild(nte)
}

function handleDrop (ev: Event, htmlElements: HtmlElements) {
  const mainDiv = htmlElements[mainDivId]
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

  const isImage = hasImageExtension(dt.files[0].name)
  console.debug('isimage', dt.files[0].name, isImage)

  const fr = new FileReader()
  fr.onloadend = function (ev) {
    console.debug('loadend ev = ', ev)
    if ((ev.target == null) || !ev.target.result) {
    	return
    }

    const contents = ev.target.result
    console.log('so turns out the contents is', contents)

    if (typeof (contents) === 'object') {
      if (!isImage) {
        showText(mainDiv, contents)
      } else {
        showImage(mainDiv, contents)
        const uploadButton: HTMLButtonElement = htmlElements[uploadButtonId] as HTMLButtonElement
        uploadButton.onclick = function (ev: Event) {
	  console.debug('we clicked upload here', ev)
	  console.debug(contents)
	  const uploadXHR = new XMLHttpRequest()
	  uploadXHR.upload.addEventListener('loadend', function (ev: Event) {
	     console.log('upload LOADEVENT event = ', ev)
	  })

	  const uploadForm = new FormData()
	  uploadForm.append('file', dt.files[0])
	  uploadXHR.open('POST', '/upload', true)
	  uploadXHR.send(uploadForm)
        }
      }
    }
  }
  fr.readAsArrayBuffer(dt.files[0])
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

interface HtmlElements {
  [key: string]: Element
}

function initMain () {
  const mainDiv = document.querySelector(`#${mainDivId}`)
  const uploadButton = document.querySelector(`#${uploadButtonId}`)

  if (mainDiv == null || uploadButton == null) {
    console.log('init failed')
    return
  }

  const htmlElements: HtmlElements = {
    [mainDivId]: mainDiv,
    [uploadButtonId]: uploadButton
  }

  window.addEventListener(Events.DRAG_OVER, function (ev: Event) {
    ev.preventDefault()
  }, false)

  window.addEventListener(Events.DROP, function (ev) {
    handleDrop(ev, htmlElements)
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
