const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const result = await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "assettrack",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      }
    );

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Upload failed",
    });
  }
};