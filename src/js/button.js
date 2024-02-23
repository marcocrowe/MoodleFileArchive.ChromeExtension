/**
 * 
 * @param {JSON} messageObject 
 */
function mainEventHandler(messageObject)
{
	// If the received message has the expected format...
	if(messageObject.text === "report_back")
	{
		MoodleDownloader.downloadAllResourcesFromDocument();
	}
}
chrome.runtime.onMessage.addListener(mainEventHandler);
