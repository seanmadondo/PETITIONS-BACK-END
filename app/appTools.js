// Convert between mimetypes/file extensions
exports.getImageMimetype = function (filename) {
    if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.gif')) return 'image/gif';
    return 'application/octet-stream';
};

exports.getImageExtension = function (mimeType) {
    switch (mimeType) {
        case 'image/jpeg':
            return '.jpeg';
        case 'image/jpg':
            return '.jpeg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            return null;
    }
};

exports.getDateTimeToday = function () {
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    return dateTime;
};