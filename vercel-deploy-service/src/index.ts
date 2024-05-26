import { createClient, commandOptions } from "redis";
const subscriber = createClient();
subscriber.connect();

const main = async () => {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    console.log(response);
  }
};
main();
