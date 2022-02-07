function modifyPageReceiver(request, sender, sendResponse) {
  document.body.textContent = "";
  let header = document.createElement('div');
  header.textContent = request.replacement;
  document.body.appendChild(header);
}
browser.runtime.onMessage.addListener(modifyPageReceiver);