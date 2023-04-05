const sharp = require('sharp');
const maxSize = 30000;

// Process the image using Sharp
const processImageToThumbnail = async (buffer) => {
    try {

        //Processing once to change aspect ratio
        let thumbnailImage = await sharp(buffer)
            .resize({
                width: 1000, // set the width to 1000 pixels
                height: 500, // set the height to half of the width (1:2 aspect ratio)
                fit: 'fill', // specify how to fit the image in case it doesn't have the exact aspect ratio
                position: 'center' // specify where to position the image if there's any whitespace
            })
            .toFormat("jpeg", { mozjpeg: true })
            .toBuffer();

        // Reduce the quality setting until the output buffer is below 10KB
        let outputQuality = 90;
        while (thumbnailImage.length > maxSize && outputQuality >= 10) {
            thumbnailImage = await sharp(buffer)
                .toFormat("jpeg", { mozjpeg: true })
                .jpeg({ quality: outputQuality })
                .toBuffer();
            outputQuality -= 10;
        }

        return thumbnailImage;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { processImageToThumbnail };