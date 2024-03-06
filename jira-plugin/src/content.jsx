///*global chrome */
import size from 'lodash/size';
import { waitForDocument } from 'src/utils';
import { storageGet } from 'src/chrome';
import {snackBar} from 'src/snack';
import config from 'options/config.js';
import {renderJiraBadges} from 'src/jirabadges.js';

waitForDocument(() => require('src/content.scss'));

const getConfig = async () => (await storageGet(config));

chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.action === 'message') {
    snackBar(msg.message);
  }
});

async function get(url) {
  var type = 'json';
  if (url.endsWith('.html')) {
    type = 'text';
  }
  var response = await chrome.runtime.sendMessage({ action: 'get', type: type, url: url }); //await sendMessage({action: 'get', url: url});
  if (response.result) {
    //console.log('Returning from response = ', response);
    return response.result;
  } else if (response.error) {
    const err = new Error(response.error.statusText);
    err.inner = response.error;
    throw err;
  }
}

async function mainAsyncLocal() {
  //const draggable = require('jquery-ui/ui/widgets/draggable');
  //const clipboard = require('clipboard/dist/clipboard');

  const config = await getConfig();
  const INSTANCE_URL = config.instanceUrl;
  const jiraProjects = await get(INSTANCE_URL + 'rest/api/2/project');
  const jiraProjectKeys = jiraProjects.map(function (project) {
    return project.key;
  });

  if (!size(jiraProjects)) {
    console.log('Couldn\'t find any jira projects in your JIRA instance');
    return;
  }

  // console.log('Will badgify JIRA tickets starting with ', jiraProjectKeys);
  await renderJiraBadges(jiraProjectKeys, INSTANCE_URL, get);
}

if (!window.__JX__script_injected__) {
  waitForDocument(mainAsyncLocal);
}

window.__JX__script_injected__ = true;
