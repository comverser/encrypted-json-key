import { ethers } from "ethers";
import fse from "fs-extra";
import "dotenv/config";

async function main() {
  if (process.env.PRIVATE_KEY_PASSWORD === undefined) {
    throw new Error("PRIVATE_KEY_PASSWORD is not defined");
  } else if (process.env.RPC_URL === undefined) {
    throw new Error("RPC_URL is not defined");
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  const encryptedJsonKey = fse.readFileSync("./.encryptedJsonKey.json", "utf8");

  if (encryptedJsonKey === undefined) {
    throw new Error("encryptedJsonKey is not defined");
  }

  let wallet = ethers.Wallet.fromEncryptedJsonSync(
    encryptedJsonKey,
    process.env.PRIVATE_KEY_PASSWORD
  );
  wallet = wallet.connect(provider);

  const abi = fse.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fse.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  console.log("Deploying contract...");
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);

  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Result: ${currentFavoriteNumber.toString()}`);

  const transactionResponse = await contract.store("7323423423432423");
  const transactionReceipt = await transactionResponse.wait(1);

  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Result: ${updatedFavoriteNumber.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
