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
    uint256 private constant PRESALE_UNIT = 10;

    modifier presaleAvailable(uint256 amount_) {
        require(block.timestamp < _presaleDate, "Presale is not started yet.");
        require(remainingPresale() <= amount_, "Insufficient Token.");
        require(amount_ > 0, "Amount should be greater than 0.");
        require(
            amount_ % (PRESALE_UNIT * _presaleToken.decimals()) == 0,
            "Token is sold with the unit of 10."
        );
        _;
    }

    /**
     * @dev Constructor
     * Set Initial Price to 5 USDT
     *
     * @param presaleDate_ Start Presale Date.
     * @param presaleToken_ Custom Token to sell.
     * @param payToken_ Token to be paid (USDT).
     */
    constructor(
        uint256 presaleDate_,
        address presaleToken_,
        address payToken_
    ) {
        _presaleToken = BRIGHTTOKEN(presaleToken_);
        _payToken = ERC20(payToken_);
        setPresalePrice(5);
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
        return _presalePrice / _payToken.decimals();
    }

    function getPresaleUnit() external view returns (uint256) {
        return PRESALE_UNIT * _presaleToken.decimals();
    }

    /**
     * @dev Set Presale Price
     *
     * @param price_ New Price.
     */
    function setPresalePrice(uint256 price_) public onlyOwner {
        _presalePrice = price_ * _payToken.decimals();
    }

    function setPresaleDate(uint256 presaleDate_) public onlyOwner {
        _presaleDate = presaleDate_;
    }

    function purchaseToken(uint256 amount_) external presaleAvailable(amount_) {
        uint256 buyAmount = amount_ * _presaleToken.decimals();
        uint256 payAmount = buyAmount * _presalePrice;
        _payToken.transferFrom(_msgSender(), address(this), payAmount);
        _presaleToken.transferFrom(address(this), _msgSender(), buyAmount);
    }
}
