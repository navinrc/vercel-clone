import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate, getAllFiles, uploadFile } from "./utils";
import path from "path";
import "dotenv/config";
const redis = require("redis");
const publisher = redis.createClient();
publisher.connect();

const subscriber = redis.createClient();
subscriber.connect();

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
  await new Promise(resolve => setTimeout(resolve, 7000));
  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");
  res.json({
    id,
  });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const status = await subscriber.hGet("status", id);
  res.json({
    status,
  });
});
app.listen(3000);
