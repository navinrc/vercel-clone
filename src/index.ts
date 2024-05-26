import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate, getAllFiles, uploadFile } from "./utils";
import path from "path";
import "dotenv/config";
import redis from 'redis';
const publisher = redis.createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.put("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/navinrc/react-boilerplate-code
  const id = generate();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  //console.log("repourl", repoUrl);

  const files = getAllFiles(path.join(__dirname, `output/${id}`));
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  publisher.lPush("build-queue", id);
  res.json({
    id,
  });
});
app.listen(3000);
