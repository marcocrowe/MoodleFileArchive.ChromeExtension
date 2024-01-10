/**
 * starts a download of the Resource File
 * @param {String} resourceFileName 
 * @param {String} resourceUrl 
 */
function downloadResourceFile(resourceFileName, resourceUrl) {
	window.URL = window.URL || window.webkitURL;

	let request = new XMLHttpRequest();

	request.open('GET', resourceUrl, true);
	request.responseType = 'blob';
	request.onload = function () {
		let file = new Blob([request.response], { type: 'application/octet-stream' });

		let hyperlink = document.createElement('a');
		hyperlink.href = window.URL.createObjectURL(file);
		hyperlink.download = resourceFileName + "." + getFileExtension(request);

		hyperlink.click(); /* click the link created to launch download*/
	};
	request.send();
}

/**
 * Get the filename extension
 * @param {XMLHttpRequest} request 
 * @returns {String} filename extension
 */
function getFileExtension(request) {
	let filename = getFileName(request);
	return filename.split('.').pop();
}
/**
 * Get the filename from the Request
 * @param {XMLHttpRequest} request 
 * @returns {String} filename
 */
function getFileName(request) {
	let contentDisposition = request.getResponseHeader('Content-Disposition');
	return contentDisposition.split('filename=').pop().slice(0, -1);
}

/**
 * Pad the numbers less than 10 with a leading zero
 * @param {int} number 
 * @returns {String} padded number
 */
function pad(number) {
	if (number < 10)
		return "0" + number;
	return number;
}

/**
 * Get the resource links from the document's Links
 * @param {HTMLCollectionOf<HTMLAnchorElement>} documentLinks 
 * @returns {MoodleResource[]} Array of MoodleResource objects
 */
function getResourceLinks(documentLinks) {
	let resourceLinks = [];
	for (let documentLink of documentLinks) {
		if (documentLink.href.indexOf("mod/resource") != -1 || documentLink.href.indexOf("pluginfile.php") != -1) {
			resourceLinks.push(new MoodleResource(documentLink.text, documentLink.href));
		}
	}
	return resourceLinks;
}

/**
 * MoodleResource class
 */
class MoodleResource {
	/**
	 * Constructs a new MoodleResource object
	 * @param {String} title 
	 * @param {String} url 
	 */
	constructor(title, url) {
		this.Title = title;
		this.Url = url;
	}
}

/**
 * process the webpage document for moodle files
 */
function processDocument() {
	let documentLinks = document.getElementsByTagName("a");
	let resourceLinks = getResourceLinks(documentLinks);

	if (window.confirm(resourceLinks.length + " resources found. Click OK to download "+ resourceLinks.length +" files.")) {
		let output = "";
		for (let index = 0, fileNumber = 1; index < resourceLinks.length; index++, fileNumber++) {
			let moodleResource = resourceLinks[index];
			let resourceFileName = pad(fileNumber) + " - " + moodleResource.Title;
			let resourceUrl = moodleResource.Url;

			output += resourceFileName + "\n";
			downloadResourceFile(resourceFileName, resourceUrl);
		}
		console.log(output);
	}
}