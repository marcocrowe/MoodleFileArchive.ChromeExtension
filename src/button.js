/**
 * 
 * @param {JSON} messageObject 
 */
function mainEventHandler(messageObject)
{
	// If the received message has the expected format...
	if(messageObject.text === "report_back")
	{
		processDocument();
	}
}
chrome.runtime.onMessage.addListener(mainEventHandler);