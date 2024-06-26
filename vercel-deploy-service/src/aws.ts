import AWS from "aws-sdk";
import "dotenv/config";
import fs from "fs";
import path from "path";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

export const downloadS3Folder = async (prefix: string) => {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "vercel-navinrc",
      Prefix: prefix,
    })
    .promise();

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel-navinrc",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
};

// export async function copyFinalDist(id: string) {
//   const folderPath = path.join(__dirname, `output/${id}/dist`);
//   const allFiles = await getAllFiles(folderPath);
//   allFiles.forEach(async (file) => {
//     await uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
//   });
// }

// const getAllFiles = async (folderPath: string) => {
//   let response: string[] = [];

//   const allFilesAndFolders = fs.readdirSync(folderPath);
//   allFilesAndFolders.forEach(async (file) => {
//     const fullFilePath = path.join(folderPath, file);
//     if (fs.statSync(fullFilePath).isDirectory()) {
//       response = response.concat(await getAllFiles(fullFilePath));
//     } else {
//       response.push(fullFilePath);
//     }
//   });
//   return response;
// };

// const uploadFile = async (fileName: string, localFilePath: string) => {
//   const fileContent = fs.readFileSync(localFilePath);
//   const response = await s3
//     .upload({
//       Body: fileContent,
//       Bucket: "vercel-navinrc",
//       Key: fileName,
//     })
//     .promise();
//   console.log(response);
// };

export async function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(async file => {
      await uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  })
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
      const fullFilePath = path.join(folderPath, file);
      if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath))
      } else {
          response.push(fullFilePath);
      }
  });
  return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
      Body: fileContent,
      Bucket: "vercel-navinrc",
      Key: fileName,
  }).promise();
  console.log(response);
}