import { createClient, commandOptions } from "redis";
import { downloadS3Folder, copyFinalDist } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect();

const main = async () => {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    // @ts-ignore
    const id = response.element;
    await downloadS3Folder(`output/${id}`);
    console.log("downloaded..");
    await buildProject(id);
    await copyFinalDist(id);
  }
};
main();
