import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import axios from "axios";

const MAX_LEN = 5;

export const generate = () => {
  let ans = "";
  const source = "0123456789qwertyuiopasdfghjklzxcvbnm";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += source[Math.floor(Math.random() * source.length)];
  }
  return ans;
};

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  // console.log("inside upload file service", fileName, process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
  const fileContent = fs.readFileSync(localFilePath);

  // Set the parameters for the presigned URL
  const params = {
    Bucket: "vercel-navinrc",
    Key: fileName, // The key (name) of the object in the bucket
    ContentType: "application/octet-stream", // Content type of the object
    Expires: 3600, // The URL will expire in 3600 seconds (1 hour)
  };

  // Generate the presigned URL
  const url = s3.getSignedUrl("putObject", params);

  // console.log("Presigned URL:", url);

  // Make a PUT request to the presigned URL
  axios
    .put(url, fileContent, {
      headers: {
        "Content-Type": "application/octet-stream", // Set the content type of the file
      },
    })
    .then((_response: any) => {
      console.info("File uploaded successfully", fileName);
    })
    .catch((error: any) => {
      console.error("Error uploading file:", fileName, error);
    });
};
