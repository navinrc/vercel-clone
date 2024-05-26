import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate, getAllFiles, uploadFile } from "./utils";
import path from "path";
import "dotenv/config"

const app = express();
app.use(cors());
app.use(express.json());

app.put("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/navinrc/react-boilerplate-code
  const id = generate();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  //console.log("repourl", repoUrl);   

  const files = getAllFiles(path.join(__dirname, `output/${id}`));
  console.log(files)
  files.forEach(async file => {
    await uploadFile(file.slice(__dirname.length + 1), file);
})
  res.json({
    id,
  });
});
app.listen(3000);
