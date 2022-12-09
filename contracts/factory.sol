
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./poolV1.sol";

pragma solidity 0.8.8;

/**
 * This is pool v1, v1 pools only support ETH-Token pairs
 * Liquidity providers get their minted tokens after providign liquidity (proportional to total ETH resereves)
 */

contract Factory is Ownable{

    mapping(address=>address) pools;

    function createPool(address _token) public {
        require(_token != address(0), "Invalid Token");
        require(pools[_token] == address(0), "Pool is already created!");

        PoolV1 _newPool = new PoolV1(_token);
        pools[_token] = address(_newPool); 
    }

    function getPool(address _token) public view returns(address){
        return pools[_token];
    }
}