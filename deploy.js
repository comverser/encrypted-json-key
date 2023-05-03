const ethers = require("ethers");
const fse = require("fs-extra");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const encryptedJsonKey = fse.readFileSync(
        "./.encryptedJsonKey.json",
        "utf8"
    );
    let wallet = new ethers.Wallet.fromEncryptedJsonSync(
        encryptedJsonKey,
        process.env.PRIVATE_KEY_PASSWORD
    );
    wallet = await wallet.connect(provider);

    const abi = fse.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.abi",
        "utf8"
    );
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
