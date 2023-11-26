async function setup() {
  // Sets up event listeners for all buttons and options as document.querySelector doesnt work after initial setup
  // - is there a better way to do this?

  // Now it suddenly  works, cause fuck me i guess, cant wait to change this all until i find out what the fuck caused the issue

  // Navigation buttons allowing popup to act like a single page application
  document.querySelector("#PlaybackButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PlaybackMenu"));
  });
  document.querySelector("#PermissionButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PermissionMenu"));
  });
  document.querySelector("#UrlButton").addEventListener("click", () => {
    loadPage(document.querySelector("#PlaybackMenu"), document.querySelector("#urlFilterPage"));
  });
  document.querySelector("#UrlButton").addEventListener("click", () => {
    populateUrlPage(document.querySelector("#urlEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#PlaybackBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PlaybackMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#PermissionBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PermissionMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#FilterBack").addEventListener("click", () => {
    loadPage(document.querySelector("#urlFilterPage"), document.querySelector("#PlaybackMenu"));
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
      document.querySelector("#urlEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#addPage").addEventListener("click", async () => {
    await autoAddFilter("page", document.querySelector("#urlEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#addSite").addEventListener("click", async () => {
    await autoAddFilter("site", document.querySelector("#urlEntry"), document.querySelector("#urlArea"));
  });
  document.querySelector("#deleteUrl").addEventListener("click", async () => {
    await deleteUrl(document.querySelector("#deleteUrl"), document.querySelector("#urlArea"))
  })


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
    makeUrlEntry(url, template, inputArea);
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
  makeUrlEntry(input.value, template, inputArea)
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
    makeUrlEntry(url, template, inputArea);
  } else {
    if (settings.filters.sites.includes(activeTab.url) || settings.filters.pages.includes(activeTab.url)) {
      return;
    }
    settings.filters.pages.push(activeTab.url);
    makeUrlEntry(activeTab.url, template, inputArea);
  }
  await browser.storage.local.set(settings);
  await playQuack(settings.volume);
}

function makeUrlEntry(name, template, inputArea) {
  const entry = template.content.cloneNode(true);
  entry.querySelector(".urlName").textContent = name;
  entry.querySelector(".url").addEventListener("click", (e) => {
    selectUrlEntry(e, document.querySelector("#deleteUrl"), document.querySelector("#urlArea"))
  });
  inputArea.prepend(entry);
}

function selectUrlEntry(e, delButton, inputArea) {
  let target;
  if (e.target.classList.contains("urlName")) {
    target = e.target.parentElement;
  } else {
    target = e.target;
  }
  let list = JSON.parse(delButton.dataset["urls"]);
  if (target.classList.contains("selected")) {
    target.classList.remove("selected");
    list.splice(list.indexOf(target), 1);
  } else {
    if (e.ctrlKey) {
      target.classList.add("selected");
      list.push(target.querySelector(".urlName").textContent);
    } else {
      if (list.length > 0){
        for (let node of inputArea.querySelectorAll("div")){
          if (node.classList.contains("selected")){
            node.classList.remove("selected");
          }
        }
      }
      target.classList.add("selected");
      list = [target.querySelector(".urlName").textContent];
    }
  }
  console.log(list);
  delButton.dataset["urls"] = JSON.stringify(list);
}

async function deleteUrl(delButton, inputArea) {
  const settings = await browser.storage.local.get();
  const urls = JSON.parse(delButton.dataset["urls"]);
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
  delButton.dataset["urls"] = "[]";
  await browser.storage.local.set(settings);
}


async function playQuack(vol) {
  const url = browser.runtime.getURL("./Assets/Quacks/1.ogg");
  const quack = new Audio(url);
  quack.volume = vol;
  await quack.play();
}

window.addEventListener("load", setup);
