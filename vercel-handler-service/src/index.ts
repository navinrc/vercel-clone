import express from "express";
import AWS from "aws-sdk";
import "dotenv/config";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});
const app = express();

app.get("/*", async (req, res) => {
  // extract the id from the request
  const host = req.hostname;
  const id = host.split(".")[0];
  const filePath = req.path;
  const contents = await s3
    .getObject({
      Bucket: "vercel-navinrc",
      Key: `dist/${id}${filePath}`,
    })
    .promise();
  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";
  res.set("Content-type", type);
  res.send(contents.Body);
});

app.listen(3001);
