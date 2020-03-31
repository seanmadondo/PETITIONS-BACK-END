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
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            return null;
    }
};