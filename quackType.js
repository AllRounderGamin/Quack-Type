async function queueQuack(e) {
  let code;
  // charCodeAt only works on single characters, if not a single character refer to the dictionary below
  if (e.key.length === 1) {
    code = e.key.charCodeAt(0);
  } else if (KEYDICT[e.key]) {
    code = KEYDICT[e.key];
  } else {
    code = "unknown";
  }
  if (e.key === "AltGraph") {
    return;
    // AltGraph is calling both Control and AltGraph at the same time, as this is the only key doing thi disabling it
    // will stop double quacks and just use Control's quack
  }
  await browser.runtime.sendMessage({type: "quack", mes: code});
}

async function queueClickedQuack() {
  await browser.runtime.sendMessage({type: "quack", mes: "click"})
}

// Use of this dictionary avoids the deprecated e.keyCode, which was used to gather the values initially
// In early development the win key returned OS, since at least v.1.1.2 it returns Meta, both values are here as a
// cautionary measure

const KEYDICT = {
  "NumLock": 144,
  "Escape": 27,
  "F1": 112,
  "F2": 113,
  "F3": 114,
  "F4": 115,
  "F5": 116,
  "F6": 117,
  "F7": 118,
  "F8": 119,
  "F9": 120,
  "F10": 121,
  "F11": 122,
  "F12": 123,
  "PrintScreen": 44,
  "Insert": 45,
  "Delete": 46,
  "Home": 36,
  "End": 35,
  "PageUp": 33,
  "PageDown": 34,
  "Backspace": 8,
  "Tab": 9,
  "Enter": 13,
  "ArrowUp": 38,
  "CapsLock": 20,
  "ArrowLeft": 37,
  "Clear": 12,
  "ArrowRight": 39,
  "Shift": 16,
  "ArrowDown": 40,
  "Control": 17,
  "OS": 91,
  "Meta": 91,
  "Alt": 18,
}

window.addEventListener("keyup", queueQuack);
window.addEventListener("click", queueClickedQuack);
