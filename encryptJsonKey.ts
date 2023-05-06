import { ethers } from "ethers";
import fse from "fs-extra";
import "dotenv/config";

async function main() {
  if (process.env.PRIVATE_KEY === undefined) {
    throw new Error("PRIVATE_KEY is not defined");
  } else if (process.env.PRIVATE_KEY_PASSWORD === undefined) {
    throw new Error("PRIVATE_KEY_PASSWORD is not defined");
  }

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const encryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
    process.env.PRIVATE_KEY
  );

  fse.writeFileSync("./.encryptedJsonKey.json", encryptedJsonKey);
  console.log(encryptedJsonKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
