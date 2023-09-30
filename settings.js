async function setup() {
  // Sets up event listeners for all buttons and options as document.querySelector doesnt work after initial setup
  // Navigation buttons allowing popup to act like a single page application
  document.querySelector("#PlaybackButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PlaybackMenu"));
  });
  document.querySelector("#PermissionButton").addEventListener("click", () => {
    loadPage(document.querySelector("#MainMenu"), document.querySelector("#PermissionMenu"));
  });
  document.querySelector("#PlaybackBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PlaybackMenu"), document.querySelector("#MainMenu"));
  });
  document.querySelector("#PermissionBack").addEventListener("click", () => {
    loadPage(document.querySelector("#PermissionMenu"), document.querySelector("#MainMenu"));
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

  const settings = await browser.storage.local.get();
  const buttons = document.querySelectorAll(".largeButton");
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
    await playQuack(settings.volume)
  }
  await browser.storage.local.set(settings);
}

async function updateVol(num, label) {
  const settings = await browser.storage.local.get();
  // Extra formatting to prevent classic JS "Volume: 35.000000000001%"
  label.textContent = "Volume: " + Math.trunc(num).toString() + "%";
  settings["volume"] = (num / 100).toFixed(2).toString();
  await browser.storage.local.set(settings);
  await playQuack(settings.volume)
}

async function dragVol(e, label) {
  await updateVol(e.target.value, label);
}

// As document.querySelector isn't working post setup have to get new values from storage each time
async function decreaseVol(slider, label) {
  const settings = await browser.storage.local.get();
  const num = parseFloat(settings["volume"]) * 100 - 1;
  if (num < 0) {
    return;
  }
  slider.value = num;
  await updateVol(num, label);
}

async function increaseVol(slider, label) {
  const settings = await browser.storage.local.get();
  const num = parseFloat(settings["volume"]) * 100 + 1;
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

async function playQuack(vol) {
  const url = browser.runtime.getURL("./Assets/Quacks/1.mp3");
  const quack = new Audio(url);
  quack.volume = vol;
  await quack.play();
}

window.addEventListener("load", setup);
