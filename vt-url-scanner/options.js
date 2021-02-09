const vtApiKeyText = document.querySelector("#vt-api-key");

// Store the currently selected settings using browser.storage.local.
function storeSettings()
{
    let vtApiKey = vtApiKeyText.value;
    browser.storage.local.set({
        vtApiKey
    });
}

// Update the options UI with the settings values retrieved from storage,
// or the default settings if the stored settings are empty.
function updateUI(restoredSettings)
{
    vtApiKeyText.value = restoredSettings.vtApiKey;
}

function onError(e)
{
    console.error(e);
}

// On opening the options page, fetch stored settings and update the UI with them.
browser.storage.local.get().then(updateUI, onError);

// Whenever the contents of the text changes, save the new values
vtApiKeyText.addEventListener("change", storeSettings);