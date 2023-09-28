async function playQuack(mes) {
  if (mes.type !== "quack") {
    return;
  }
  const settings = await browser.storage.local.get();
  let checked = false;
  let quackCode;
  if (mes.mes === "human") {
    if (!settings.punctuation) {
      return;
    }
    quackCode = "human";
    checked = true;
  }
  if (mes.mes === "click") {
    if (!settings.mouse) {
      return;
    }
    quackCode = "1";
    checked = true;
  }
  if (!checked && (mes.mes >= 65 && mes.mes <= 90) || (mes.mes >= 97 && mes.mes <= 122)) {
    if (!settings.letters) {
      return;
    }
    checked = true;
  }
  if (!checked && (mes.mes >= 48 && mes.mes <= 57)) {
    if (!settings.numbers) {
      return;
    }
    checked = true;
  }
  if (!checked) {
    if (!settings.punctuation) {
      return;
    }
  }
  if (!settings.random) {
    if (mes.mes === "human" || mes.mes === "click") {
      // do nothing
    } else {
      quackCode = mes.mes % 8 + 1;
    }
  } else {
    quackCode = (Math.round(Math.random() * 100)) % 8 + 1;
  }
  const url = browser.runtime.getURL("./Assets/Quacks/" + quackCode + ".mp3");
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
  window.removeEventListener("click", queueQuack);
}

async function setUp() {
  const storage = await browser.storage.local.get()
  const settings = {volume: 0.5, letters: true, numbers: true, punctuation: true, mouse: false, random: false}
  const opts = ["volume", "letters", "numbers", "punctuation", "mouse", "random"];
  let updated;
  for (let opt of opts) {
    if (!storage.hasOwnProperty(opt)) {
      storage[opt] = settings[opt];
      updated = true;
    }
  }
  if (updated) {
    await browser.storage.local.set(storage);
  }
}


browser.runtime.onInstalled.addListener(setUp);
browser.runtime.onStartup.addListener(setUp);
browser.runtime.onMessage.addListener(playQuack);
browser.tabs.onUpdated.addListener(async (tabId) => {
  await injectScript(tabId)
});
browser.commands.onCommand.addListener(async (command) => {
  await injectActiveTab(command)
});
