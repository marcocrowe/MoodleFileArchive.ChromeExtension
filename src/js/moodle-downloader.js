/**
 * Represents a downloader for Moodle resources.
 */
class MoodleDownloader {
	/**
	 * Downloads all Moodle resources from the current document.
	 * Retrieves Moodle resources from the document, prompts the user for confirmation,
	 * and initiates the download process for each resource.
	 * @returns {Promise<void>} A Promise that resolves when all resources have been downloaded.
	 */
	static async downloadAllResourcesFromDocument() {
		let moodleResources = MoodleDownloader.getMoodleResourcesFromDocument();

		if (window.confirm(moodleResources.length + " resources found. Click OK to download " + moodleResources.length + " files.")) {
			for (let moodleResource of moodleResources) {
				console.log(moodleResource.getFileName());
				await MoodleDownloader.downloadResourceFile(moodleResource);
			}
		}
	}

	/**
	 * Downloads the specified Moodle resource.
	 * @param {MoodleResource} moodleResource - The Moodle resource to download.
	 * @returns {Promise<void>} A Promise that resolves when the download is complete.
	 */
	static async downloadResourceFile(moodleResource) {
		try {
			window.URL = window.URL || window.webkitURL;

			const options = {
				method: 'GET',
				responseType: 'blob'
			};

			const response = await fetch(moodleResource.url, options);
			const blob = await response.blob();

			const contentType = response.headers.get('content-type');
			const extension = MoodleDownloader.getFileExtensionFromContentType(contentType);

			const hyperlinkElement = document.createElement('a');
			hyperlinkElement.href = URL.createObjectURL(blob);
			hyperlinkElement.download = extension ? `${moodleResource.getFileName()}.${extension}` : moodleResource.getFileName();
			hyperlinkElement.click(); /* Trigger the click event to start the download */
		} catch (error) {
			console.error(`Error downloading resource file: ${moodleResource.getFileName()}`, error);
		}
	}

	/**
	 * Get the file extension from the Content-Type header.
	 * @param {string} contentType - The content type header.
	 * @returns {string} The file extension if present otherwise returns an empty string if Content-Type is malformed.
	 */
	static getFileExtensionFromContentType(contentType) {
		if (!contentType)
			return '';

		const mimeTypeToExtensionMap = {
			'application/pdf': 'pdf',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
			'application/msaccess': 'mdb',
			'application/vnd.visio': 'vsdx',
			'text/html;charset=UTF-8': 'html',
			// Add more MIME types to file extension mappings as needed
		};

		const extensionFromMapping = mimeTypeToExtensionMap[contentType];
		if (extensionFromMapping)
			return extensionFromMapping;

		const mimeTypeParts = contentType.split('/');
		if (mimeTypeParts.length === 2) {
			return mimeTypeParts[1];
		}
		return '';
	}

	/**
	 * Get the resource links from the document's Links
	 * @returns {MoodleResource[]} Array of MoodleResource objects
	 */
	static getMoodleResourcesFromDocument() {
		/** @param {HTMLCollectionOf<HTMLAnchorElement>} **/
		let documentLinks = document.getElementsByTagName("a");

		let moodleResources = [];
		for (let documentLink of documentLinks) {
			if (documentLink.href.indexOf("mod/resource") != -1 || documentLink.href.indexOf("pluginfile.php") != -1) {
				moodleResources.push(new MoodleResource(moodleResources.length + 1, documentLink.text, documentLink.href));
			}
		}
		return moodleResources;
	}
}
