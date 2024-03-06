///*global chrome */
import defaultConfig from 'options/config.js';
import {storageGet, storageSet, permissionsRequest, promisifyChrome} from 'src/chrome';
import { contentScript, resetDeclarativeMapping } from 'options/declarative';

const executeScript = promisifyChrome(chrome.scripting, 'executeScript');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Got request', request);
  if (request.action === 'get') {
    console.log('Calling fetch');
    const p = fetch(request.url).then(result => {
      console.log('Got result', result);
      // This promises to turn the result into json
      return result;
    }).catch(error => {
      sendResponse({
        error
      });
    });

    if (request.type === 'json') {
      p.then(r => { return r.json(); })
        .then(json => {
          //console.log('Sending json back: ', json);
          sendResponse({
            'result': json
          });
        }); // The promise ends here as sendResponse has sent the final response message.
    } else if (request.type === 'text') {
      p.then(r => { return r.text(); })
        .then(t => {
          //console.log('Sending back plain text: ', t);
          sendResponse({
            'result': t
          });
        });
    }

    return true;
  }
});

async function browserOnClicked (tab) {
  const config = await storageGet(defaultConfig);
  if (!config.instanceUrl) {
    chrome.runtime.openOptionsPage();
    return;
  }
  const origin = new URL(tab.url).origin + '/';
  const granted = await permissionsRequest({origins: [origin]});
  if (granted) {
    const config = await storageGet(defaultConfig);
    if (config.domains.indexOf(origin) !== -1) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'message',
          message: origin + ' is already added.'
        });
      } catch (ex) {
        // extension was just installed and not injected on this tab yet
        await executeScript({ target: {tabId: tab.id}, files:[ contentScript ] });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'message',
          message: 'Jira HotLinker enabled successfully !'
        });
      }
      return;
    }
    config.domains.push(origin);
    await storageSet(config);
    await resetDeclarativeMapping();
    //console.log('Awaiting executeScript on tab ', tab.id);
    await executeScript({ target: { tabId: tab.id }, files: [contentScript] });
    await chrome.tabs.sendMessage(tab.id, {
      action: 'message',
      message: origin + ' added successfully !'
    });
  }
}

(function () {
  chrome.runtime.onInstalled.addListener(async () => {
    const config = await storageGet(defaultConfig);
    if (!config.instanceUrl) {
      chrome.runtime.openOptionsPage();
      return;
    }
    resetDeclarativeMapping();
  });

  chrome.action.onClicked.addListener(tab => {
    browserOnClicked(tab).catch( (err) => {
      console.log('Error: ', err);
    });
  });
})();