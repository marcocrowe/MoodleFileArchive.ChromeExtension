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

			const extension = MoodleDownloader.getFileExtensionFromResponse(response);

			const hyperlinkElement = document.createElement('a');
			hyperlinkElement.href = URL.createObjectURL(blob);
			hyperlinkElement.download = extension ? `${moodleResource.getFileName()}.${extension}` : moodleResource.getFileName();
			hyperlinkElement.click(); /* Trigger the click event to start the download */
		} catch (error) {
			console.error(`Error downloading resource file: ${moodleResource.getFileName()}`, error);
		}
	}

	/**
	 * Extracts the file extension from the Content-Disposition header.
	 * @param {string} contentDisposition - The Content-Disposition header.
	 * @returns {string} The file extension if found, otherwise an empty string.
	 */
	static getFileExtensionFromContentDisposition(contentDisposition) {
		const regex = /filename="(.+?)"/;
		const match = regex.exec(contentDisposition);
		if (match) {
			const fileName = match[1];
			const extensionIndex = fileName.lastIndexOf('.');
			if (extensionIndex !== -1)
				return fileName.slice(extensionIndex + 1);
		}
		return null;
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
			'application/vnd.ms-powerpoint': 'ppt',
			'application/vnd.ms-powerpoint.presentation.macroenabled.12': 'pptm',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
			'application/vnd.visio': 'vsdx',
			'application/msaccess': 'mdb',
			'application/msexcel': 'xls',
			'application/msword': 'doc',
			'application/pdf': 'pdf',
			'audio/mpeg': 'mp3',
			'image/gif': 'gif',
			'image/jpeg': 'jpg',
			'image/png': 'png',
			'text/plain': 'txt',
			'text/html': 'html',
			'text/html;charset=utf-8': 'html',
			'text/html; charset=utf-8': 'html',
			'video/mp4': 'mp4',
			// Add more MIME types to file extension mappings as needed
		};

		const extension = mimeTypeToExtensionMap[contentType.toLowerCase()];
		if (extension)
			return extension;

		const mimeTypeParts = contentType.split('/');
		if (mimeTypeParts.length === 2) {
			return mimeTypeParts[1];
		}
		return null;
	}

	/**
	 * Get the file extension from the response object.
	 * Tries to extract the extension from Content-Disposition header first,
	 * then from the response URL, and finally from Content-Type header.
	 * @param {Response} response - The response object.
	 * @returns {string} The file extension if found, otherwise an empty string.
	 */
	static getFileExtensionFromResponse(response) {
		const contentDisposition = response.headers.get('Content-Disposition');
		if (contentDisposition) {
			const extension = MoodleDownloader.getFileExtensionFromContentDisposition(contentDisposition);
			if (extension)
				return extension;
		}

		const url = response.url;
		if (url) {
			const extension = MoodleDownloader.getFileExtensionFromUrlQueryString(url);
			if (extension)
				return extension;
		}

		const contentType = response.headers.get('Content-Type');
		return this.getFileExtensionFromContentType(contentType);
	}

	/**
	 * Extracts the file extension from the 'response-content-disposition' parameter in a URL.
	 * @param {string} url - The URL containing the 'response-content-disposition' parameter.
	 * @returns {string|null} The file extension extracted from the URL, or null if not found or if the URL format is invalid.
	 */
	static getFileExtensionFromUrlQueryString(url) {
		const dispositionStartIndex = url.indexOf('response-content-disposition=');

		if (dispositionStartIndex !== -1) {
			// Extract the substring containing the 'response-content-disposition' parameter and its value
			const queryString = url.substring(dispositionStartIndex);

			const filenameStartIndex = queryString.indexOf('filename%3D%22');

			if (filenameStartIndex !== -1) {
				const filenameSubstring = queryString.substring(filenameStartIndex + 'filename%3D'.length);

				const filenameEndIndex = filenameSubstring.indexOf('%22&');

				// Extract the filename part before any query parameters
				const filenameEncoded = filenameEndIndex !== -1 ? filenameSubstring.substring(0, filenameEndIndex) : filenameSubstring;

				const filename = decodeURIComponent(filenameEncoded.replace(/\+/g, ' '));

				const dotIndex = filename.lastIndexOf('.');

				// If a dot is found and it's not the last character in the filename
				if (dotIndex !== -1 && dotIndex !== filename.length - 1) {
					return filename.substring(dotIndex + 1);
				}
			}
		}
		return null;
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
