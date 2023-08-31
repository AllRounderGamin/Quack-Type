async function playQuack(mes) {
  if (mes.type !== "quack"){
    return;
  }
  const settings = await browser.storage.local.get();
  let checked = false;
  let quackCode;
  if (mes.mes === "human") {
    quackCode = "human";
    checked = true;
  }
  if ((mes.mes >= 65 && mes.mes <= 90) || (mes.mes >= 97 && mes.mes <= 122) && !checked) {
    checked = true;
    if (!settings.letters) {
      return;
    } else {
      quackCode = mes.mes % 8 + 1;
    }
  }
  if ((mes.mes >= 48 && mes.mes <= 57) && !checked) {
    checked = true;
    if (!settings.numbers) {
      return;
    } else {
      quackCode = mes.mes % 8 + 1;
    }
  }
  if (!checked) {
    if (!settings.punctuation) {
      return;
    } else if (mes.mes !== "human") {
      quackCode = mes.mes % 8 + 1;
    }
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
  if (command === "activate-quack"){
    let activeTab = await browser.tabs.query({active:true})
    activeTab = activeTab[0];
    await browser.scripting.executeScript({files: ["quackType.js"], target: {tabId: activeTab.id}});
  } else if (command === "deactivate-quack"){
    let activeTab = await browser.tabs.query({active:true})
    activeTab = activeTab[0];
    await browser.scripting.executeScript({func: removeQuacks, target: {tabId: activeTab.id}});
  }

}

function removeQuacks(){
  window.removeEventListener("keyup", queueQuack);
}

async function setUp() {
  const storage = await browser.storage.local.get()
  if (!(storage.hasOwnProperty("volume") && storage.hasOwnProperty("letters") && storage.hasOwnProperty("numbers")
    && storage.hasOwnProperty("punctuation"))){
    const settings = {volume: 0.5, letters: true, numbers: true, punctuation: true}
    await browser.storage.local.set(settings);
  }
}


browser.runtime.onInstalled.addListener(setUp);
browser.runtime.onStartup.addListener(setUp);
browser.runtime.onMessage.addListener(playQuack);
browser.tabs.onUpdated.addListener(async (tabId) => {await injectScript(tabId)});
browser.commands.onCommand.addListener(async (command) => {await injectActiveTab(command)});
