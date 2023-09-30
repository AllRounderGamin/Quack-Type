async function queueQuack(e) {
  let code;
  if (e.key.length === 1) {
    code = e.key.charCodeAt(0);
  } else if (KEYDICT[e.key]) {
    code = KEYDICT[e.key];
  } else {
    code = "human";
  }
  await browser.runtime.sendMessage({type: "quack", mes: code});
}

async function queueClickedQuack() {
  await browser.runtime.sendMessage({type: "quack", mes: "click"})
}


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
  "Alt": 18,
  "AltGraph": 18
}

window.addEventListener("keyup", queueQuack);
window.addEventListener("click", queueClickedQuack);
