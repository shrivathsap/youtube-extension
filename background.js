/*Ok, so here's how it works. On manifest.json there are three things as far as I see : background scripts, content scripts and
browser_actions. This is the script that runs in the background, yt.js is the script that looks at the content or something
not sure how to use browser_actions yet.*/

chrome.tabs.onUpdated.addListener(//on updating the tab, i.e., url change or something
  function(tabId, changeInfo, tab) {//execute this function
    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    if (changeInfo.url) {//if changeInfo.url will see if the url in the tab changed
      chrome.tabs.sendMessage( tabId, {//in which case, we send a message to content scripts, and that message is
        message: 'hello!',//these two things
        url: changeInfo.url
      })
    }
  }
);

//code copied from https://stackoverflow.com/questions/34957319/how-to-listen-for-url-change-with-chrome-extension
//it is amazing, i got such a quick solution

chrome.runtime.onInstalled.addListener((details) => {
	alert("Extension loaded successfully :D\nShift+A to add a channel\nShift+R to remove\nShift+V to view channels in console");
	}
);
