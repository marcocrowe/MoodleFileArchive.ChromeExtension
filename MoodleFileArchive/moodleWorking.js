//working

function DownloadResourceFile(resourceFileName, resourceUrl) {
    window.URL = window.URL || window.webkitURL;

    var xhr = new XMLHttpRequest();
    var a = document.createElement('a');


    xhr.open('GET', resourceUrl, true);
    xhr.responseType = 'blob';


    xhr.onload = function() {
        let file = new Blob([xhr.response], { type: 'application/octet-stream' });

        a.href = window.URL.createObjectURL(file);
        a.download = resourceFileName + "." + (GetFileExtension(xhr)); // Set to whatever file name you want
        // Now just click the link you created
        // Note that you may have to append the a element to the body somewhere
        // for this to work in Firefox
        a.click();
    };
    xhr.send();
}

function GetFileExtension(xhr) {
    var filename = GetFileName(xhr);
    console.log(filename);

    return filename.split('.').pop();
}

function GetFileName(xhr) {
    var contentDisposition = xhr.getResponseHeader('Content-Disposition');
    return contentDisposition.split('filename=').pop().slice(0, -1);
}

function pad(number) {
    if (number < 10)
        return "0" + number;
    return number;
}

function GetResourceLinks(documentlinks) {
    let resourceLinks = new Array();
    for (var index = 0; index < documentlinks.length; index++) {
        var documentlink = documentlinks[index];
        if (documentlink.href.indexOf("mod/resource") != -1 || documentlink.href.indexOf("pluginfile.php") != -1) {
            resourceLinks.push(new MoodleResource(documentlink.text, documentlink.href));
        }
    }
    return resourceLinks;
}


class MoodleResource {

    constructor(title, url) {
        this.Title = title;
        this.Url = url;
    }
}

function ProcessDocument() {
    var documentlinks = document.getElementsByTagName("a");
    var resourceLinks = GetResourceLinks(documentlinks);

    let output = "";
    for (var index = 0, fileNumber = 1; index < resourceLinks.length; index++, fileNumber++) {
        let moodleResource = resourceLinks[index];
        let resourceFileName = pad(fileNumber) + " - " + moodleResource.Title;
        let resourceUrl = moodleResource.Url;
        console.log(resourceFileName);
        console.log(resourceUrl);

        output += resourceFileName + "\n";
        DownloadResourceFile(resourceFileName, resourceUrl);
    }
    console.log(output);
}

ProcessDocument();