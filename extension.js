async function playQuack(mes) {
  if (mes.type !== "quack") {
    return;
  }
  const settings = await browser.storage.local.get();
  let quackCode;
  if (mes.mes === "unknown") {
    if (!settings.punctuation) {
      return;
    }
    quackCode = "human";
  } else if (mes.mes === "click") {
    if (!settings.mouse) {
      return;
    }
    quackCode = "1";
  } else if ((mes.mes >= 65 && mes.mes <= 90) || (mes.mes >= 97 && mes.mes <= 122)) {
    if (!settings.letters) {
      return;
    }
  } else if ((mes.mes >= 48 && mes.mes <= 57)) {
    if (!settings.numbers) {
      return;
    }
  } else if (!settings.punctuation) {
    return;
  }
  if (!settings.random) {
    if (mes.mes !== "human" && mes.mes !== "click") {
      quackCode = mes.mes % 8 + 1;
    }
  } else {
    quackCode = (Math.round(Math.random() * 100)) % 8 + 1;
  }
  const url = browser.runtime.getURL("./Assets/Quacks/" + quackCode + ".ogg");
  const quack = new Audio(url);
  quack.volume = settings.volume;
  await quack.play();
}

async function injectScript(Id) {
  if (await browser.permissions.contains({origins: ["<all_urls>"]})) {
    await browser.scripting.executeScript({files: ["quackType.js"], target: {tabId: Id}})
  }
}

async function injectActiveTab(command) {
  if (command === "activate-quack") {
    let activeTab = await browser.tabs.query({active: true})
    activeTab = activeTab[0];
    await browser.scripting.executeScript({files: ["quackType.js"], target: {tabId: activeTab.id}});
  } else if (command === "deactivate-quack") {
    let activeTab = await browser.tabs.query({active: true})
    activeTab = activeTab[0];
    await browser.scripting.executeScript({func: removeQuacks, target: {tabId: activeTab.id}});
  }

}

function removeQuacks() {
  window.removeEventListener("keyup", queueQuack);
  window.removeEventListener("click", queueClickedQuack);
}

async function setUp() {
  const storage = await browser.storage.local.get()
  const settings = {volume: 0.5, letters: true, numbers: true, punctuation: true, mouse: false, random: false}
  const opts = ["volume", "letters", "numbers", "punctuation", "mouse", "random"];
  let updated;
  // On start verifies local storage is up to date and has not been tampered with, if it has sets values to default
  for (let opt of opts) {
    if (!storage.hasOwnProperty(opt)) {
      storage[opt] = settings[opt];
      updated = true;
    } else if (opt === "volume") {
      if (storage[opt] > 1 || storage[opt] < 0) {
        storage[opt] = settings[opt];
        updated = true;
      }
    } else {
      if (storage[opt] !== true && storage[opt] !== false) {
        storage[opt] = settings[opt];
        updated = true;
      }
    }
  }
  if (updated) {
    await browser.storage.local.set(storage);
  }
}


browser.runtime.onInstalled.addListener(setUp);
browser.runtime.onStartup.addListener(setUp);
browser.runtime.onMessage.addListener(playQuack);
browser.tabs.onUpdated.addListener(injectScript);
browser.commands.onCommand.addListener(injectActiveTab);
