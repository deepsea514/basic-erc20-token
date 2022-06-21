// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./BRIGHTTOKEN.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PresaleFactory is Ownable {
    using SafeMath for uint256;

    uint256 private _presaleDate;
    uint256 private _presalePrice;
    BRIGHTTOKEN private immutable _presaleToken;
    ERC20 private immutable _payToken;
    uint256 private constant PRESALE_UNIT = 10_000_000;

    modifier presaleAvailable(uint256 amount_) {
        require(block.timestamp > _presaleDate, "Presale is not started yet.");
        require(amount_ > 0, "Amount should be greater than 0.");

        uint256 payAmount = amount_ * _presalePrice;
        uint256 buyAmount = amount_ * PRESALE_UNIT;
        require(
            _payToken.balanceOf(_msgSender()) >= payAmount,
            "Insufficent USDC balance."
        );
        require(
            _payToken.allowance(_msgSender(), address(this)) >= payAmount,
            "Should Approve the token."
        );
        require(remainingPresale() >= buyAmount, "Insufficient Token.");
        _;
    }

    /**
     * @dev Constructor
     * Set Initial Price to 5 USDC
     *
     * @param presaleDate_ Start Presale Date.
     * @param presaleToken_ Custom Token to sell.
     * @param payToken_ Token to be paid (USDC).
     */
    constructor(
        uint256 presaleDate_,
        address presaleToken_,
        address payToken_
    ) {
        require(payToken_ != address(0), "Please provide valid token");
        _presaleToken = BRIGHTTOKEN(presaleToken_);
        _payToken = ERC20(payToken_);
        setPresalePrice(5_000_000);
        setPresaleDate(presaleDate_);
    }

    /**
     * @dev Get Remaining presale token
     */
    function remainingPresale() public view returns (uint256) {
        return _presaleToken.balanceOf(address(this));
    }

    function getPresaleDate() external view returns (uint256) {
        return _presaleDate;
    }

    function getPresalePrice() external view returns (uint256) {
        return _presalePrice;
    }

    /**
     * @dev Set Presale Price
     *
     * @param price_ New Price with USD.
     */
    function setPresalePrice(uint256 price_) public onlyOwner {
        _presalePrice = price_;
    }

    function setPresaleDate(uint256 presaleDate_) public onlyOwner {
        _presaleDate = presaleDate_;
    }

    /**
     * @dev Purchase Token.
     *
     * @param amount_ Tick Count to purchase.
     */
    function purchaseToken(uint256 amount_) external presaleAvailable(amount_) {
        uint256 buyAmount = amount_ * PRESALE_UNIT;
        uint256 payAmount = amount_ * _presalePrice;
        _payToken.transferFrom(_msgSender(), address(this), payAmount);
        _presaleToken.transfer(_msgSender(), buyAmount);
    }

    function withdrawUSDCToken() external onlyOwner {
        _payToken.transfer(_msgSender(), _payToken.balanceOf(_msgSender()));
    }
}
