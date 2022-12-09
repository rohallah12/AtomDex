//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./poolV1Interface.sol";

pragma solidity 0.8.8;

interface factory {
    function getPool(address _token) external view returns(address);
}

/**
 * This is pool v1, v1 pools only support ETH-Token pairs
 * Liquidity providers get their minted tokens after providign liquidity (proportional to total ETH resereves)
 */

contract PoolV1 is Ownable, ERC20, PoolV1Interface{

    IERC20 public token;
    factory public fac;

    uint256 public tokenFees;
    uint256 public etherFees;

    /**
     * Deploying our pool contract, by setting msg.sender to factory, we can make sure that this pool is registered in the factory
     */
    constructor(address _token) ERC20("AtomDexV1-LP", "ALP"){
        token = IERC20(_token);
        fac = factory(msg.sender);
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

    function etherToTokenSwap(uint256 minOut, address _to) external payable {
        uint256 etherR = getEtherReserves() - msg.value;
        uint256 tokenR = getTokenReserves();
        uint256 tokensOut = getAmountsOut(msg.value, etherR, tokenR);

        require(minOut <= tokenR, "insufficient liquidity");
        require(minOut <= tokensOut, "inssuficient output amount!" );
        
        token.transfer(_to, tokensOut);
    }

    function TokenToEtherSwap(uint256 tokensIn, uint256 minOut, address _to) external payable {
        uint256 etherR = getEtherReserves();
        uint256 tokenR = getTokenReserves();

        uint256 ethersOut = getAmountsOut(tokensIn, tokenR, etherR);

        require(minOut <= etherR, "insufficient liquidity!");
        require(minOut <= ethersOut, "inssuficient output amount!" );
        
        token.transferFrom(msg.sender, address(this), tokensIn);
        payable(_to).transfer(ethersOut);
    }
    
    /**
     * performing chained swaps here (erc20 - erc20 swaps)
     * how this works?
     * ERC20 => Pool => Pool swaps received costume erc20 token for ether => pool swaps received ether for its own erc20 token and sends it to trader
     */
    function TokenToTokenSwap(address _token, uint256 _tokenIn, uint256 minTokenOut) public payable {
        address pair = fac.getPool(_token);
        require(pair != address(0), "pair not found for this token!");
        IERC20(_token).transferFrom(msg.sender, address(this), _tokenIn);
        //trading against costume token's pool
        uint256 beforeBalance = address(this).balance;
        IERC20(_token).approve(pair, _tokenIn);
        PoolV1Interface(pair).TokenToEtherSwap(_tokenIn, 0, address(this));
        uint256 receivedEther = address(this).balance - beforeBalance;
        require(receivedEther > 0, "Received ether is too low");
        uint256 tokensOut = getAmountsOut(receivedEther, getEtherReserves() - receivedEther, getTokenReserves());
        require(tokensOut >= minTokenOut, "Insufficient tokens out");
        token.transfer(msg.sender, tokensOut);
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

    receive() external payable{
        
    }
}
