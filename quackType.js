async function queueQuack(e) {
  let code;
  if (e.key.length === 1) {
    code = e.key.charCodeAt(0);
  } else if (KEYDICT[e.key]) {
    code = KEYDICT[e.key];
    console.log(code);
  } else {
    code = "human";
  }
  await browser.runtime.sendMessage({type: "quack", mes: code});
}


const KEYDICT = {
  " ": 32,
  "Backspace": 8,
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
  "Insert": 45,
  "Delete": 46,
  "Home": 36,
  "End": 35,
  "PageUp": 33,
  "PageDown": 34,
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
