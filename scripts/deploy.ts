import { ethers } from "hardhat";

async function main() {
    const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
    const token = await BRIGHTTOKEN.deploy();
    const singers = await ethers.getSigners();

    await token.deployed();

    console.log("Token deployed to:", token.address);
    await token.mint(1000000);
    await token.burn(500000);
    await token.transfer(singers[1].address, 500000);
    await token.lock(singers[1].address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
