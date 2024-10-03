const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./digitalOcean");

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP formats are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 100 }, // Limit file size to 20MB
  fileFilter: fileFilter,
});

module.exports = upload;
