//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity 0.8.8;

/**
 * This is pool v1, v1 pools only support ETH-Token pairs
 * Liquidity providers get their minted tokens after providign liquidity (proportional to total ETH resereves)
 */

contract PoolV1 is Ownable, ERC20{

    IERC20 public token;
    address public factory;

    uint256 public tokenFees;
    uint256 public etherFees;

    constructor(address _token) ERC20("AtomDexV1-LP", "ALP"){
        token = IERC20(_token);
        factory = msg.sender;
    }

    function addLiquidity(uint256 tokensAmount) public payable {
        require(msg.value > 0, "can not send 0 ether");
        require(tokensAmount > 0, "can not send 0 tokens"); 
        uint256 tokensIn;
        if(totalSupply() == 0){
            //minting ether amount to msg.msg.sender
            tokensIn = tokensAmount;
            _mint(msg.sender, msg.value);
        }else{
            tokensIn = getAmountsOut(msg.value, getEtherReserves() - msg.value, getTokenReserves());
            require(tokensIn <= tokensAmount, "Insufficient tokens!");
            _mint(msg.sender, (msg.value * totalSupply()) / getEtherReserves());
        }
        token.transferFrom(msg.sender, address(this), tokensIn);
    }

    //Removing liqudidity using LP tokens    
    //we should calculate the tokens that are backing our LP tokens
    function removeLiquidity(uint256 lpTokens) public payable {
        require(lpTokens > 0, "LP tokens > 0");
        uint256 backingEther = (lpTokens * getEtherReserves()) / totalSupply();
        uint256 backingTokens = lpTokens * getTokenReserves() / totalSupply();
        _burn(msg.sender, lpTokens);

        token.transfer(msg.sender, backingTokens);
        payable(msg.sender).transfer(backingEther);
    }

    function getTokenReserves() public view returns(uint256){
        return token.balanceOf(address(this));
    }

    function getEtherReserves() public view returns(uint256) {
        return address(this).balance;
    }

    function etherToTokenSwap(uint256 minOut) external payable {
        uint256 etherR = getEtherReserves() - msg.value;
        uint256 tokenR = getTokenReserves();
        uint256 tokensOut = getAmountsOut(msg.value, etherR, tokenR);

        require(minOut <= tokenR, "insufficient liquidity");
        require(minOut <= tokensOut, "inssuficient output amount!" );
        
        token.transfer(msg.sender, tokensOut);
    }

    function TokenToEtherSwap(uint256 tokensIn, uint256 minOut) external payable {
        uint256 etherR = getEtherReserves();
        uint256 tokenR = getTokenReserves();

        uint256 ethersOut = getAmountsOut(tokensIn, tokenR, etherR);

        require(minOut <= etherR, "insufficient liquidity!");
        require(minOut <= ethersOut, "inssuficient output amount!" );
        
        token.transferFrom(msg.sender, address(this), tokensIn);
        payable(msg.sender).transfer(ethersOut);
    }

    //Constant prodcut formula, to maintain x * y = k we have to increase or decrease reserves by same % 
    /**
     * LP fee = 0.3% same as uniswap => returning less output amount
     */
    function getAmountsOut(uint256 tokensIn, uint256 InRes, uint256 outRes) public pure returns(uint256){
        require(InRes > 0 && outRes > 0, "Insufficient reserves");
        uint256 tokensWithFee = tokensIn * 997;
        uint256 numerator = tokensWithFee * outRes;
        uint256 denominator = (InRes * 1000 ) + tokensWithFee;
        return numerator / denominator;
    }
}
/**
 * V1:
 * Pairs only possible for Ether and an ERC20 token
 * Providing liquidity => giving LPs lp tokens to backup their tokens
 * Swaps => x * y = k, implementing K formula
 * removing liuqiidty => burning Lps lp tokens and giving their tokens back
 */