// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PAYTOKEN is ERC20 {
    constructor() ERC20("Tether Token", "USDT") {
        _mint(_msgSender(), 1_000_000_000_000);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
