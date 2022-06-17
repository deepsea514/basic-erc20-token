import { assert, expect } from "chai";
import { ethers } from "hardhat";

const INITAIL_SUPPLY = 1000000;
const TRANSFER_AMOUNT = 500000;
describe("BRIGHT TOKEN", function () {
    it("Initial Supply is 1000,000", async function () {
        const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
        const token = await BRIGHTTOKEN.deploy();
        await token.deployed();

        const totalSupply = await token.totalSupply();
        assert(INITAIL_SUPPLY == totalSupply.toNumber(), "Initial Supply is not matching.");
    });

    it("Mint Token", async function () {
        const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
        const token = await BRIGHTTOKEN.deploy();
        await token.deployed();

        await token.mint(INITAIL_SUPPLY);

        const totalSupply = await token.totalSupply();
        assert(INITAIL_SUPPLY * 2 == totalSupply.toNumber(), "After Mint Supply is not matching.");
    });

    it("Transfer Token", async function () {
        const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
        const token = await BRIGHTTOKEN.deploy();
        await token.deployed();
        const singers = await ethers.getSigners();

        await token.transfer(singers[1].address, TRANSFER_AMOUNT);
        const balance = await token.balanceOf(singers[1].address);
        assert(balance.toNumber() == TRANSFER_AMOUNT, "Transfer amount is not matching.");
    });

    it("Burn Token", async function () {
        const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
        const token = await BRIGHTTOKEN.deploy();
        await token.deployed();
        const singers = await ethers.getSigners();

        const beforeBalance = await token.balanceOf(singers[0].address);
        await token.burn(TRANSFER_AMOUNT);
        const afterBalance = await token.balanceOf(singers[0].address);
        assert(beforeBalance.sub(afterBalance).toNumber() == TRANSFER_AMOUNT, "Transfer amount is not matching.");
    })

    it("Lock Token", async function () {
        const BRIGHTTOKEN = await ethers.getContractFactory("BRIGHTTOKEN");
        const token = await BRIGHTTOKEN.deploy();
        await token.deployed();
        const singers = await ethers.getSigners();

        await token.lock(singers[1].address);

        expect(token.connect(singers[1]).transfer(singers[0].address, 40000)).to.be.revertedWith("Transfer from the locked address");
    })
});
