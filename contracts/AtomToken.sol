//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity 0.8.8;

contract AtomToken is ERC20, Ownable{
    constructor() ERC20("AtomToken", "AT"){
        _mint(msg.sender, 1e6 * 1e18);
    }
}
