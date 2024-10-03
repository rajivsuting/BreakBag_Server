const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const s3 = new S3Client({
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
  region: "us-east-1",
});

module.exports = s3;
