//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity 0.8.8;

interface PoolV1Interface{
    function addLiquidity(uint256 tokensAmount) external payable;
    function removeLiquidity(uint256 lpTokens) external payable ; 
    function getTokenReserves() external view  returns(uint256); 
    function getEtherReserves() external view  returns(uint256);
    function etherToTokenSwap(uint256 minOut, address _to) external payable;
    function TokenToEtherSwap(uint256 tokensIn, uint256 minOut, address _to) external payable;
    function TokenToTokenSwap(address _token, uint256 _tokenIn, uint256 minTokenOut) external payable;
    function getAmountsOut(uint256 tokensIn, uint256 InRes, uint256 outRes) external view  returns(uint256);
}
