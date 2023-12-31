async function setup() {
  // Sets up event listeners for all buttons and options as document.querySelector doesnt work after initial setup
  // - is there a better way to do this?

  // Navigation buttons allowing popup to act like a single page application
  document.querySelector("#QuackButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#QuackMenu"));
  });
  document.querySelector("#PermissionButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PermissionMenu"));
  });
  document.querySelector("#SpecialButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#SpecialMenu"));
  });
  document.querySelector("#UrlButton").addEventListener("click", () => {
    loadPage(document.querySelector("#SpecialMenu"), document.querySelector("#urlFilterPage"));
  });
  document.querySelector("#UrlButton").addEventListener("click", () => {
    populateUrlPage(document.querySelector("#dataEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#MapButton").addEventListener("click", () => {
    loadPage(document.querySelector("#SpecialMenu"), document.querySelector("#MappingMenu"));
  });
  document.querySelector("#MapButton").addEventListener("click", () => {
    populateMappingPage(document.querySelector("#dataEntry"), document.querySelector("#MappingArea"));
  });
  document.querySelector("#QuackBack").addEventListener("click", () => {
    loadPage(document.querySelector("#QuackMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#PermissionBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PermissionMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#SpecialBack").addEventListener("click", () => {
    loadPage(document.querySelector("#SpecialMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#FilterBack").addEventListener("click", () => {
    loadPage(document.querySelector("#urlFilterPage"), document.querySelector("#SpecialMenu"));
  });
  document.querySelector("#MapBack").addEventListener("click", () => {
    loadPage(document.querySelector("#MappingMenu"), document.querySelector("#SpecialMenu"));
  });
  // Volume related buttons
  document.querySelector("#downVol").addEventListener("click", () => {
    decreaseVol(document.querySelector("#volume"), document.querySelector("#VolLabel"));
  });
  document.querySelector("#upVol").addEventListener("click", () => {
    increaseVol(document.querySelector("#volume"), document.querySelector("#VolLabel"));
  });
  document.querySelector("#volume").addEventListener("change", async (e) => {
    await dragVol(e, document.querySelector("#VolLabel"));
  });
  // Option buttons, string is used instead of id as clicking the indicator returns the indicators id
  document.querySelector("#letters").addEventListener("click", async () => {
    await updateOption("letters", document.querySelector("#LettersIndicator"));
  });
  document.querySelector("#numbers").addEventListener("click", async () => {
    await updateOption("numbers", document.querySelector("#NumbersIndicator"));
  });
  document.querySelector("#punctuation").addEventListener("click", async () => {
    await updateOption("punctuation", document.querySelector("#PunctuationIndicator"));
  });
  document.querySelector("#mouse").addEventListener("click", async () => {
    await updateOption("mouse", document.querySelector("#MouseIndicator"));
  });
  document.querySelector("#random").addEventListener("click", async () => {
    await updateOption("random", document.querySelector("#RandomIndicator"));
  });
  // filter options
  document.querySelector("#addUrl").addEventListener("click", async () => {
    await addFilter(document.querySelector("#urlInput"), document.querySelector("#sitewideCheck"),
      document.querySelector("#dataEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#addPage").addEventListener("click", async () => {
    await autoAddFilter("page", document.querySelector("#dataEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#addSite").addEventListener("click", async () => {
    await autoAddFilter("site", document.querySelector("#dataEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#deleteUrl").addEventListener("click", async () => {
    await deleteUrls(document.querySelector("#deleteUrl"), document.querySelector("#urlArea"));
  });
  document.querySelector("#deleteMapping").addEventListener("click", async () => {
    await deleteMappings(document.querySelector("#deleteMapping"), document.querySelector("#MappingArea"));
  });
  document.querySelector("#changeMode").addEventListener("click", changeListMode);
  document.querySelector("#mapAdd").addEventListener("click", addMapping);

  document.querySelector("#escAdd").addEventListener("click", async () => {
    await updateMapping({key: "Escape"});
  });
  document.querySelector("#prtScAdd").addEventListener("click", async () => {
    await updateMapping({key: "PrintScreen"});
  });
  document.querySelector("#altAdd").addEventListener("click", async () => {
    await updateMapping({key: "Alt"});
  });


  const settings = await browser.storage.local.get();
  const buttons = document.querySelectorAll(".quackButton");
  for (let button of buttons) {
    if (settings[button.id]) {
      button.querySelector(".indicator").classList.add("on");
    }
  }

  document.querySelector("#volume").value = settings["volume"] * 100;
  document.querySelector("#VolLabel").textContent = "Volume: " + Math.trunc(parseFloat(settings["volume"]) * 100) + "%";

  // Permission toggle button
  document.querySelector("#togglePerms").addEventListener("click", async () => {
    await togglePerms(document.querySelector("#togglePerms").querySelector(".indicator"))
  });
  if (await browser.permissions.contains({origins: ["<all_urls>"]})) {
    document.querySelector("#togglePerms").querySelector(".indicator").classList.add("on");
  }
}

function loadPage(start, destination) {
  start.style.display = "none";
  destination.style.display = "block";
}

async function updateOption(id, indicator) {
  const settings = await browser.storage.local.get();
  const status = indicator.classList.contains("on");
  settings[id] = !status;
  if (status) {
    indicator.classList.remove("on");
  } else {
    indicator.classList.add("on");
    await playQuack(settings.volume);
  }
  await browser.storage.local.set(settings);
}

async function updateVol(num, label) {
  const settings = await browser.storage.local.get();
  // Extra formatting to prevent classic JS "Volume: 35.000000000001%"
  label.textContent = "Volume: " + Math.trunc(num).toString() + "%";
  settings["volume"] = (num / 100).toFixed(2).toString();
  await browser.storage.local.set(settings);
  await playQuack(settings.volume);
}

async function dragVol(e, label) {
  await updateVol(e.target.value, label);
}

async function decreaseVol(slider, label) {
  const num = parseInt(slider.value) - 1;
  if (num < 0) {
    return;
  }
  slider.value = num;
  await updateVol(num, label);
}

async function increaseVol(slider, label) {
  const num = parseInt(slider.value) + 1;
  if (num > 100) {
    return;
  }
  slider.value = num;
  await updateVol(num, label);
}

async function togglePerms(indicator) {
  if (indicator.classList.contains("on")) {
    await browser.permissions.remove({origins: ["<all_urls>"]});
    indicator.classList.remove("on");
  } else {
    indicator.classList.add("on");
    browser.permissions.request({origins: ["<all_urls>"]});
    window.close();
  }
}

async function populateUrlPage(template, inputArea) {
  const urlList = [];
  const settings = await browser.storage.local.get();
  urlList.push.apply(urlList, settings.filters.pages)
  urlList.push.apply(urlList, settings.filters.sites);
  urlList.sort();
  while (inputArea.hasChildNodes()) {
    inputArea.removeChild(inputArea.firstChild);
  }
  for (let url of urlList) {
    makeDataEntry(url, template, inputArea, "urlArea", document.querySelector("#deleteUrl"));
  }
}

async function addFilter(input, checkbox, template, inputArea) {
  const settings = await browser.storage.local.get();
  if (input.value === "" || settings.filters.pages.includes(input.value) || settings.filters.sites.includes(input.value)){
    return;
  }
  if (checkbox.checked) {
    settings.filters.sites.push(input.value);
  } else {
    settings.filters.pages.push(input.value);
  }
  makeDataEntry(input.value, template, inputArea, "urlArea", document.querySelector("#deleteUrl"));
  await browser.storage.local.set(settings);
  await playQuack(settings.volume);
}

async function autoAddFilter(filterType, template, inputArea) {
  const settings = await browser.storage.local.get();
  let activeTab = await browser.tabs.query({active: true});
  activeTab = activeTab[0];
  let url = activeTab.url.split("/");
  url = url[0] + "//" + url[2];
  if (filterType === "site") {
    if (settings.filters.sites.includes(url) || settings.filters.pages.includes(url)) {
      return;
    }
    settings.filters.sites.push(url);
    makeDataEntry(url, template, inputArea, "urlArea", document.querySelector("#deleteUrl"));
  } else {
    if (settings.filters.sites.includes(activeTab.url) || settings.filters.pages.includes(activeTab.url)) {
      return;
    }
    settings.filters.pages.push(activeTab.url);
    makeDataEntry(activeTab.url, template, inputArea, "urlArea", document.querySelector("#deleteUrl"));
  }
  await browser.storage.local.set(settings);
  await playQuack(settings.volume);
}

function makeDataEntry(name, template, inputArea, target, delButton) {
  const entry = template.content.cloneNode(true);
  entry.querySelector(".dataName").textContent = name;
  entry.querySelector(".dataType").addEventListener("click", (e) => {
    selectDataEntry(e, delButton, document.querySelector(`#${target}`))
  });
  inputArea.prepend(entry);
}

function selectDataEntry(e, delButton, inputArea) {
  let target;
  if (e.target.classList.contains("dataName")) {
    target = e.target.parentElement;
  } else {
    target = e.target;
  }
  let list = JSON.parse(delButton.dataset["entries"]);
  if (target.classList.contains("selected")) {
    target.classList.remove("selected");
    list.splice(list.indexOf(target), 1);
  } else {
    if (e.ctrlKey) {
      target.classList.add("selected");
      list.push(target.querySelector(".dataName").textContent);
    } else {
      if (list.length > 0){
        for (let node of inputArea.querySelectorAll("div")){
          if (node.classList.contains("selected")){
            node.classList.remove("selected");
          }
        }
      }
      target.classList.add("selected");
      list = [target.querySelector(".dataName").textContent];
    }
  }
  delButton.dataset["entries"] = JSON.stringify(list);
}

async function deleteUrls(delButton, inputArea) {
  const settings = await browser.storage.local.get();
  const urls = await JSON.parse(delButton.dataset["entries"]);
  if (urls.length === 0){
    return;
  }
  for (let url of urls) {
    if (settings.filters.pages.includes(url)){
      settings.filters.pages.splice(settings.filters.pages.indexOf(url), 1);
    } else{
      settings.filters.sites.splice(settings.filters.sites.indexOf(url), 1);
    }
  }
  for (let node of inputArea.querySelectorAll("div")) {
    if (node.classList.contains("selected")) {
      inputArea.removeChild(node);
    }
  }
  delButton.dataset["entries"] = "[]";
  await browser.storage.local.set(settings);
}

async function deleteMappings(delButton, inputArea) {
  const settings = await browser.storage.local.get();
  const mappings = await JSON.parse(delButton.dataset["entries"]);
  if (mappings.length === 0){
    return;
  }
  for (let mapping of mappings) {
    for (let filter of settings.mappings) {
      if (filter.key === mapping) {
        settings.mappings.splice(settings.mappings.indexOf(filter), 1);
      }
    }
  }
  for (let node of inputArea.querySelectorAll("div")) {
    if (node.classList.contains("selected")) {
      inputArea.removeChild(node);
    }
  }
  delButton.dataset["entries"] = "[]";
  await browser.storage.local.set(settings);
}

async function populateMappingPage(template, inputArea) {
  const settings = await browser.storage.local.get();
  while (inputArea.hasChildNodes()) {
    inputArea.removeChild(inputArea.firstChild);
  }
  for (let mapping of settings.mappings) {
    makeDataEntry(mapping.key, template, inputArea, "MappingArea", document.querySelector("#deleteMapping"));
  }
  if (settings.whitelist){
    document.querySelector("#listMode").textContent = "Current Mode: Whitelist";
  } else {
    document.querySelector("#listMode").textContent = "Current Mode: Blacklist";
  }
}

async function addMapping(){
  document.querySelector("#mappingMes").hidden = false;
  document.addEventListener("keydown", updateMapping);
}

async function updateMapping(e){
  const template = document.querySelector("#dataEntry");
  const mapArea = document.querySelector("#MappingArea");
  const settings = await browser.storage.local.get();
  if (!settings.mappings.includes(e.key)) {
    makeDataEntry(e.key, template, mapArea, "MappingArea", document.querySelector("#deleteMapping"));
    const code = convertKey(e.key);
    settings.mappings.push({key: e.key, code: code});
    await browser.storage.local.set(settings);
  }
  document.removeEventListener("keydown", updateMapping);
  document.querySelector("#mappingMes").hidden = true;
}

async function changeListMode(){
  const settings = await browser.storage.local.get();
  if (settings.whitelist){
    document.querySelector("#listMode").textContent = "Current Mode: Blacklist"
  } else {
    document.querySelector("#listMode").textContent = "Current Mode: Whitelist";
  }
  settings.whitelist = !settings.whitelist;
  await browser.storage.local.set(settings);
}

async function playQuack(vol) {
  const url = browser.runtime.getURL("./Assets/Quacks/1.ogg");
  const quack = new Audio(url);
  quack.volume = vol;
  await quack.play();
}

function convertKey(key) {
  let code;
  if (key.length === 1) {
    code = key.charCodeAt(0);
  } else if (KEYDICT[key]) {
    code = KEYDICT[key];
  }
  return code;
}

window.addEventListener("load", setup);

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
