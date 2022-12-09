const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai")


//AtomDex Staking Tests
if(false) {
describe("AtomDex V1 - Test Cases", function(){
    let pool, token, deployer, lp_token, lp_ether, cerc20, factory;
    beforeEach(async ()=>{
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['all'])
        pool = await ethers.getContract("PoolV1", deployer)
        token = await ethers.getContract("AtomToken", deployer)
        cerc20 = await ethers.getContract("CostumeERC20", deployer)
        factory = await ethers.getContract("")
        lp_token = (await token.totalSupply()).div(3); // 500, 000
        lp_ether = ethers.utils.parseEther("100"); // 100
        // ether per token = 100 / 500, 000
        // token per ether = 500, 000 / 100
    })

   it("Adding liquidity\n", async ()=>{
        await token.approve(pool.address, ethers.constants.MaxUint256);
        await pool.addLiquidity(lp_token, { value : lp_ether });
        let tokenReserves = await pool.getTokenReserves();
        let etherReserves = await pool.getEtherReserves();
        console.log(`Adding Liquidity : ${ethers.utils.formatEther(lp_ether)} Ether + : ${ethers.utils.formatEther(lp_token)} Tokens`) 
        console.log(`ether reserves ${ethers.utils.formatEther(etherReserves)}`)
        console.log(`tokens reseves ${ethers.utils.formatEther(tokenReserves)}`)
        console.log("Tokens Per Ether : " + ethers.utils.formatEther(tokenReserves.mul(ethers.utils.parseEther("1")).div(etherReserves)));
        console.log("Ethers Per Token : " + ethers.utils.formatEther(etherReserves.mul(ethers.utils.parseEther("1")).div(tokenReserves)));
        console.log("constant product = x * y = " + ethers.utils.formatEther((tokenReserves.mul(etherReserves)).div(ethers.utils.parseEther("1"))) )
        console.log(`\nAdding Liquidity : 1.0 Ether + : ${ethers.utils.formatEther(lp_token)} Tokens`) 
        await pool.addLiquidity(lp_token, {value : ethers.utils.parseEther("1") })
        tokenReserves = await pool.getTokenReserves();
        etherReserves = await pool.getEtherReserves();
        console.log(`ether reserves ${ethers.utils.formatEther(etherReserves)}`)
        console.log(`tokens reseves ${ethers.utils.formatEther(tokenReserves)}`)
        console.log("Tokens Per Ether : " + ethers.utils.formatEther(tokenReserves.mul(ethers.utils.parseEther("1")).div(etherReserves)));
        console.log("Ethers Per Token : " + ethers.utils.formatEther(etherReserves.mul(ethers.utils.parseEther("1")).div(tokenReserves))); 
        console.log("x * y = " + ethers.utils.formatEther((tokenReserves.mul(etherReserves)).div(ethers.utils.parseEther("1"))))
    })

    it("Swapping tokens\n", async ()=>{
        await token.approve(pool.address, ethers.constants.MaxUint256);
        await pool.addLiquidity(lp_token, { value : lp_ether });
        let be1 = await token.balanceOf(deployer)
        console.log(`Swapping 10 ETH for Tokens...`)
        await pool.etherToTokenSwap( 0, deployer, {value : ethers.utils.parseEther("10")});
        let be2 = await token.balanceOf(deployer)
        console.log("received Tokens : " + ethers.utils.formatEther(be2.sub(be1)))
    })

    /**
     * because we have implemented constant product formula, if you try to sell 100% of your tokens, pool will receive those tokens, but bceause of the slippage
     * your will only receive 50% of what you expected (i.e whole pool) this means you are not able to drain liquidity
     */
    it("Swapping tokens (constant prodcut formula and slippage)\n", async ()=>{
        await token.approve(pool.address, ethers.constants.MaxUint256);
        await pool.addLiquidity(lp_token, { value : lp_ether });
        console.log('tryting to drain the pool (swapping pair token balance for ETH)')
        be1 = await ethers.provider.getBalance(deployer)
        let tokenReserves = await pool.getTokenReserves();
        let etherReserves = await pool.getEtherReserves();
        console.log("pool ether reserves before swap : " + ethers.utils.formatEther(etherReserves))
        console.log("pool token reserves before swap: " + ethers.utils.formatEther(tokenReserves));
        await pool.TokenToEtherSwap(tokenReserves, 0, deployer)
        be2 = await ethers.provider.getBalance(deployer)
        tokenReserves = await pool.getTokenReserves();
        etherReserves = await pool.getEtherReserves(); 
        console.log("pool ether reserves after swap : " + ethers.utils.formatEther(etherReserves))
        console.log("pool token reserves after swap: " + ethers.utils.formatEther(tokenReserves));
        console.log(`receivded tokens ${ethers.utils.formatEther(be2.sub(be1))}`)
    })

     it("Adding liquidity and then removing it\n", async ()=>{
        await token.approve(pool.address, ethers.constants.MaxUint256);
        let lpb1 = await pool.balanceOf(deployer);
        await pool.addLiquidity(lp_token, { value : lp_ether });
        let lpb2 = await pool.balanceOf(deployer); 
        console.log(`Receivded LP tokens : ${ethers.utils.formatEther(lpb2.sub(lpb1))}`)
        
        console.log("Removing liquidity...")
        const tb1 = await token.balanceOf(deployer);
        const eb1 = await ethers.provider.getBalance(deployer)
        await pool.removeLiquidity(lpb2.sub(lpb1))
        const tb2 = await token.balanceOf(deployer);
        const eb2 = await ethers.provider.getBalance(deployer)
        console.log(`Received Ether: ${ethers.utils.formatEther(eb2.sub(eb1))}`)
        console.log(`Received Tokens: ${ethers.utils.formatEther(tb2.sub(tb1))}`)
        console.log(`Burned LP tokens : ${ethers.utils.formatEther(lpb2.sub(lpb1))}`)
    })
    
})
}