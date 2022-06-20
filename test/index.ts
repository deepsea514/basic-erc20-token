import { assert, expect } from "chai";
import { ethers } from "hardhat";

const DECIMALS = 6;
const INITAIL_SUPPLY = 1000000 * Math.pow(10, DECIMALS);
const TRANSFER_AMOUNT = 500000 * Math.pow(10, DECIMALS);
const PURCHASE_TOKEN_AMOUNT = 10;
const PURCHASE_TOKEN_UNIT = 10;

var tokenAddress: string | null = null;
var payTokenAddress: string | null = null;
var factoryAddress: string | null = null;

describe("BRIGHT TOKEN", function () {
    it("Initial Supply is 1000,000", async function () {
        const token = await (await ethers.getContractFactory("BRIGHTTOKEN")).deploy();
        tokenAddress = token.address;

        const totalSupply = await token.totalSupply();
        assert(INITAIL_SUPPLY == totalSupply.toNumber(), "Initial Supply is not matching.");
    });

    it("Mint Token", async function () {
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        await token.mint(INITAIL_SUPPLY);

        const totalSupply = await token.totalSupply();
        assert(INITAIL_SUPPLY * 2 == totalSupply.toNumber(), "After Mint Supply is not matching.");
    });

    it("Transfer Token", async function () {
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const singers = await ethers.getSigners();

        await token.transfer(singers[1].address, TRANSFER_AMOUNT);
        const balance = await token.balanceOf(singers[1].address);
        assert(balance.toNumber() == TRANSFER_AMOUNT, "Transfer amount is not matching.");
    });

    it("Burn Token", async function () {
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const singers = await ethers.getSigners();

        const beforeBalance = await token.balanceOf(singers[0].address);
        await token.burn(TRANSFER_AMOUNT);
        const afterBalance = await token.balanceOf(singers[0].address);
        assert(beforeBalance.sub(afterBalance).toNumber() == TRANSFER_AMOUNT, "Transfer amount is not matching.");
    })

    it("Prevent to send token from locked account.", async function () {
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const singers = await ethers.getSigners();

        await token.lock(singers[1].address);

        expect(token.connect(singers[1]).transfer(singers[0].address, TRANSFER_AMOUNT)).to.be.revertedWith("Transfer from locked account.");
    })

    it("Prevent to send token to locked account.", async function () {
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const singers = await ethers.getSigners();

        await token.lock(singers[1].address);

        expect(token.connect(singers[0]).transfer(singers[1].address, TRANSFER_AMOUNT)).to.be.revertedWith("Transfer to locked account.");
    })
});

describe("Presale Token", function () {
    it("Create Contract", async function () {
        const singer = await ethers.getSigners();
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const payToken = await (await ethers.getContractFactory("PAYTOKEN")).deploy();
        payTokenAddress = payToken.address;

        const factory = await (await ethers.getContractFactory("PresaleFactory")).deploy(
            parseInt((new Date().getTime() / 1000).toString()),
            token.address,
            payToken.address
        );
        factoryAddress = factory.address;

        const balance = await token.balanceOf(singer[0].address);
        await token.transfer(factory.address, balance);
    });

    it("Purchase Token", async function () {
        const singer = await ethers.getSigners();
        const token = await (await ethers.getContractAt("BRIGHTTOKEN", tokenAddress!)).deployed();
        const payToken = await (await ethers.getContractAt("PAYTOKEN", payTokenAddress!)).deployed();
        const factory = await (await ethers.getContractAt("PresaleFactory", factoryAddress!)).deployed();

        const balance = await token.balanceOf(singer[0].address);
        await token.transfer(factory.address, balance);

        const price = await factory.getPresalePrice();
        await payToken.approve(factory.address, price.mul(PURCHASE_TOKEN_AMOUNT / PURCHASE_TOKEN_UNIT));
        await factory.purchaseToken(PURCHASE_TOKEN_AMOUNT);

        const tokenBalance = await token.balanceOf(singer[0].address);
        const decimals = await token.decimals();
        assert(tokenBalance.toNumber() == PURCHASE_TOKEN_AMOUNT * Math.pow(10, decimals), "Token is not transferred.");
    })

    it("Purchase Token without allowance.", async function () {
        const factory = await (await ethers.getContractAt("PresaleFactory", factoryAddress!)).deployed();

        expect(factory.purchaseToken(PURCHASE_TOKEN_AMOUNT)).to.be.revertedWith("Should Approve the token.");
    })

    it("Purchase Token without balance.", async function () {
        const singer = await ethers.getSigners();
        const factory = await (await ethers.getContractAt("PresaleFactory", factoryAddress!)).deployed();

        expect(factory.connect(singer[1].address).purchaseToken(PURCHASE_TOKEN_AMOUNT)).to.be.revertedWith("Insufficent USDC balance.");
    })
})