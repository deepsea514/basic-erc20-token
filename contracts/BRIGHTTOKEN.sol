// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BRIGHTTOKEN is Ownable, ERC20 {
    mapping(address => bool) private _locked;

    event Lock(address account);
    event Unlock(address account);

    modifier validAddress(address account) {
        require(_msgSender() != account, "Cannot Lock Owner");
        require(address(0) != account, "Cannot Lock Owner");
        _;
    }

    constructor() ERC20("BRIGHT TOKEN", "BGT") {
        _mint(_msgSender(), 1000000);
    }

    function mint(uint256 amount) external onlyOwner {
        _mint(_msgSender(), amount);
    }

    function burn(uint256 amount) external onlyOwner {
        _burn(_msgSender(), amount);
    }

    function lock(address account) public onlyOwner validAddress(account) {
        _locked[account] = true;
        emit Lock(account);
    }

    function unlock(address account) public onlyOwner validAddress(account) {
        _locked[account] = false;
        emit Unlock(account);
    }

    function getLocked(address account) public view returns (bool) {
        return _locked[account];
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(_locked[from] != true, "Transfer from locked account.");
        require(_locked[to] != true, "Transfer to locked account.");
    }
}
