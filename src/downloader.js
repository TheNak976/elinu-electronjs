const http = require('http');
const fs = require('fs');
const path = require('path');

let lastDownloadedSize = 0;

function getRemoteFile(file, url) {
    let localFile = fs.createWriteStream(path.join(process.cwd(), file));
    const request = http.get(url, function(response) {
        const len = parseInt(response.headers['content-length'], 10);
        let cur = 0;
        const total = len / 1048576; //1048576 - bytes in 1 Megabyte

        response.on('data', function(chunk) {
            cur += chunk.length;
            showProgress(file, cur, len, total);
        });

        response.on('end', function() {
            console.log("Download complete");
        });

        response.pipe(localFile);
    });
}

function showProgress(file, cur, len, total) {

    console.log("Downloading " + file + " - " + (100.0 * cur / len).toFixed(2)
        + "% (" + (cur / 1048576).toFixed(2) + " MB) of total size: "
        + total.toFixed(2) + " MB" );

}

function formatBytes(bytes, decimals = 2) {
    if (bytes <= 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat(bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}
module.exports = { formatBytes};