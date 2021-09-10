/**
 * 
 */
function getCurrentTabUrl()
{
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	let queryObject =
	{
		active: true,
		currentWindow: true
	};
	// chrome.tabs.query invokes the callback with a list of tabs that match the
	// query. When the popup is opened, there is certainly a window and at least
	// one tab, so we can safely assume that |tabs| is a non-empty array.
	// A window can only have one active tab at a time, so the array consists of
	// exactly one tab.
	/** @type {chrome} */
	chrome.tabs.query(queryObject, chromeTabsQueryEventHandler);
}
/**
 * 
 * @param {tabs.Tab[]} tabArray 
 */
function chromeTabsQueryEventHandler(tabArray)
{
	// A tab is a plain object that provides information about the tab.
	// See https://developer.chrome.com/extensions/tabs#type-Tab

	/** @type {tabs.Tab} */
	let tab = tabArray[0];
	chrome.tabs.sendMessage(tab.id, { text: 'report_back' });
}
document.addEventListener('DOMContentLoaded', function () { getCurrentTabUrl(); });