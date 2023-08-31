async function addListeners(){
  const settings = await browser.storage.local.get();

  const vol = document.querySelector("#volume")
  vol.value = settings.volume * 100;
  vol.addEventListener("input", updateVol);

  for (const el of document.querySelectorAll(".check")){
    el.checked = settings[el.id];
    el.addEventListener("input", updateCheck);
  }

  const hostPermStatus = await browser.permissions.contains({origins: ["<all_urls>"]});
  const permissionMessage = document.querySelector("#permissionStatus")
  if (hostPermStatus){
    permissionMessage.textContent = "Permissions Granted";
  } else{
    permissionMessage.textContent = "Permissions Not Granted";
  }
  const permButton = document.querySelector("#hostPerms");
  permButton.dataset.granted = hostPermStatus.toString();
  if (hostPermStatus){
    permButton.style.backgroundColor = "red";
  } else{
    permButton.style.backgroundColor = "green";
  }
  permButton.addEventListener("click", (e) => {togglePerms(e, permissionMessage, permButton)});

}

async function updateCheck(e){
  const settings = await browser.storage.local.get();
  settings[e.target.id] = e.target.checked;
  await browser.storage.local.set(settings);
}

async function updateVol(e){
  const settings = await browser.storage.local.get();
  settings[e.target.id] = e.target.value / 100;
  await browser.storage.local.set(settings);
}

async function togglePerms(e, permissionMessage, permButton){
  if (e.target.dataset.granted === "true"){
    await browser.permissions.remove({origins: ["<all_urls>"]});
    e.target.dataset.granted = "false";
    permissionMessage.textContent = "Permission Revoked";
    permButton.style.backgroundColor = "green";
  } else {
    browser.permissions.request({origins: ["<all_urls>"]});
    window.close();
  }

}

window.addEventListener("load", addListeners);
