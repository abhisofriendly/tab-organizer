chrome.commands.onCommand.addListener((command) => {
  if (command === "open_tab_viewer") {
    chrome.action.openPopup();
  }
});
