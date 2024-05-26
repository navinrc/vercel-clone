import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/navinrc/react-boilerplate-code
  const id = generate();
  await simpleGit().clone(repoUrl, `output/${id}`);
  console.log("repourl", repoUrl);
  res.json({
    id
  });
});
app.listen(3000);
