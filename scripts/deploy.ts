import { ethers } from "hardhat";
import { BRIGHTTOKEN } from "../typechain/BRIGHTTOKEN";
import { PresaleFactory } from "../typechain/PresaleFactory";

const PURCHASE_TOKEN_AMOUNT = 100;
const PURCHASE_TOKEN_UNIT = 10;
async function main() {
    const singers = await ethers.getSigners();
    let token: BRIGHTTOKEN | null = null;
    let factory: PresaleFactory | null = null;
    if (process.env.TOKEN_ADDRESS) {
        token = await (await ethers.getContractAt("BRIGHTTOKEN", process.env.TOKEN_ADDRESS!)).deployed();
    } else {
        token = await (await ethers.getContractFactory("BRIGHTTOKEN")).deploy();
        console.log("Token Address: ", token.address);
    }


    if (process.env.FACTORY_ADDRESS) {
        factory = await (await ethers.getContractAt("PresaleFactory", process.env.FACTORY_ADDRESS!)).deployed();
    } else {
        factory = await (await ethers.getContractFactory("PresaleFactory")).deploy(
            parseInt((new Date().getTime() / 1000).toString()),
            token.address,
            process.env.USDC_ADDRESS!
        );
        console.log("Factory Address: ", factory.address);
        const balance = await token.balanceOf(singers[0].address);
        await token.transfer(factory.address, balance);
    }

    if (process.env.FACTORY_ADDRESS) {
        const usdcToken = await (await ethers.getContractAt("ERC20", process.env.USDC_ADDRESS!)).deployed();

        const zeroBalance = await token.balanceOf(singers[0].address);
        console.log("After creating Balance:", zeroBalance.toNumber());

        const price = await factory.getPresalePrice();
        console.log("Token Price:", price.toNumber());
        const totalPrice = price.mul(PURCHASE_TOKEN_AMOUNT / PURCHASE_TOKEN_UNIT);
        console.log("Total Purchase Price:", totalPrice.toNumber());

        await usdcToken.approve(factory.address, totalPrice.toNumber());
        const allowance = await usdcToken.allowance(singers[0].address, factory.address);
        console.log("Allowance:", allowance.toNumber());

        const usdcBalance = await usdcToken.balanceOf(singers[0].address);
        console.log("USDC Balance:", usdcBalance.toNumber());
        try {
            const transaction = await factory.connect(singers[1].address).purchaseToken(PURCHASE_TOKEN_AMOUNT);
            console.log("Transferred: ", transaction.hash);
        } catch (error) {
            console.error(error);
        }

        const newBalance = await token.balanceOf(singers[0].address);
        console.log("Balance after transaction:", newBalance.toNumber());
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
