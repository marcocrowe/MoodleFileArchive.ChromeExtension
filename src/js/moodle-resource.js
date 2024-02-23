/**
 * Represents a Moodle Resource.
 */
class MoodleResource {
	/**
	 * Creates a new MoodleResource instance.
	 * @param {number} number - The number of the resource.
	 * @param {string} title - The title of the resource.
	 * @param {string} url - The URL of the resource.
	 */
	constructor(number, title, url) {
		this.number = number;
		this.title = title;
		this.url = url;
	}

	/**
	 * Build the filename for the resource.
	 * @returns {string} The built filename.
	 */
	getFileName() {
		return `${String(this.number).padStart(2, '0')} - ${this.title.trim()}`;
	}
}
