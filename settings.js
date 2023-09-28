async function setup() {
  document.querySelector("#PlaybackButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PlaybackMenu"));
  });
  document.querySelector("#PermissionButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PermissionMenu"));
  });
  document.querySelector("#PlaybackBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PlaybackMenu"), document.querySelector("#MainMenu"))
  });
  document.querySelector("#PermissionBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PermissionMenu"), document.querySelector("#MainMenu"))
  });
  document.querySelector("#downVol").addEventListener("click", () => {
    decreaseVol(document.querySelector("#volume"), document.querySelector("#VolLabel"))
  });
  document.querySelector("#upVol").addEventListener("click", () => {
    increaseVol(document.querySelector("#volume"), document.querySelector("#VolLabel"))
  });
  document.querySelector("#volume").addEventListener("change", async (e) => {
    await dragVol(e, document.querySelector("#VolLabel"))
  });
  document.querySelector("#letters").addEventListener("click", async () => {
    await updateOption("letters", document.querySelector("#letters").querySelector(".indicator"))
  });
  document.querySelector("#numbers").addEventListener("click", async () => {
    await updateOption("numbers", document.querySelector("#numbers").querySelector(".indicator"))
  });
  document.querySelector("#punctuation").addEventListener("click", async () => {
    await updateOption("punctuation", document.querySelector("#punctuation").querySelector(".indicator"))
  });


  const settings = await browser.storage.local.get();
  const buttons = document.querySelectorAll(".largeButton");
  for (let button of buttons) {
    if (settings[button.id]) {
      button.querySelector(".indicator").classList.add("on");
    }
  }

  document.querySelector("#volume").value = settings["volume"] * 100;
  document.querySelector("#VolLabel"). textContent = "Volume: " + Math.trunc(parseFloat(settings["volume"]) * 100) +"%";

  document.querySelector("#togglePerms").addEventListener("click", async () => {await togglePerms(document.querySelector("#togglePerms").querySelector(".indicator"))});
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
    const url = browser.runtime.getURL("./Assets/Quacks/1.mp3");
    const quack = new Audio(url);
    quack.volume = settings.volume;
    await quack.play();
  }
  await browser.storage.local.set(settings);
}

async function updateVol(num, label) {
  const settings = await browser.storage.local.get();
  label.textContent = "Volume: " + Math.trunc(num).toString() + "%";
  settings["volume"] = (num / 100).toFixed(2).toString();
  await browser.storage.local.set(settings);
  const url = browser.runtime.getURL("./Assets/Quacks/1.mp3");
  const quack = new Audio(url);
  quack.volume = settings.volume;
  await quack.play();
}

async function dragVol(e, label){
  await updateVol(e.target.value, label);
}

async function decreaseVol(slider, label) {
  const settings = await browser.storage.local.get();
  const num = parseFloat(settings["volume"]) * 100 - 1;
  if (num < 0){
    return;
  }
  slider.value = num;
  await updateVol(num, label);
}

async function increaseVol(slider, label) {
  const settings = await browser.storage.local.get();
  const num = parseFloat(settings["volume"]) *100  + 1;
  if (num > 100){
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

window.addEventListener("load", async () => {await(setup())});
