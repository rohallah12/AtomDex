const {ethers, deployments, getNamedAccounts} = require("hardhat");
const poolABI = require("../artifacts/contracts/poolV1.sol/PoolV1.json")
const {assert, expect} = require("chai")

//AtomDex Staking Tests
describe("***************************************AtomDex V1 - Test Cases ***************************************\n", function(){
    let token, deployer, lp_token, lp_ether, cerc20, factory;
    beforeEach(async ()=>{
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['all'])
        token = await ethers.getContract("AtomToken", deployer)
        cerc20 = await ethers.getContract("CostumeERC20", deployer)
        factory = await ethers.getContract("Factory", deployer)
        lp_token = (await token.totalSupply()).div(3); // 500, 000
        lp_ether = ethers.utils.parseEther("100"); // 100
        // ether per token = 100 / 500, 000
        // token per ether = 500, 000 / 100
    })

   it("Adding liquidity ===========================================\n", async ()=>{
        await factory.createPool(token.address)
        let pool = new ethers.Contract(await factory.getPool(token.address), poolABI.abi, await ethers.getSigner(deployer)) 
        await token.approve(pool.address, ethers.constants.MaxUint256);
        await pool.addLiquidity(lp_token, { value : lp_ether });
        console.log(`Ether Reserves : ${ethers.utils.formatEther(await pool.getEtherReserves())}`)
        console.log(`Token Reserves : ${ethers.utils.formatEther(await pool.getTokenReserves())}`)
    })

   it("Swapping tokens for tokens ===========================================\n", async ()=>{
        await factory.createPool(token.address) // creating pool for first token (atom)
        await factory.createPool(cerc20.address) // creating pool for second token (costume erc20)
        let pool_atom = new ethers.Contract(await factory.getPool(token.address), poolABI.abi, await ethers.getSigner(deployer)) 
        let pool_cerc20 = new ethers.Contract(await factory.getPool(cerc20.address), poolABI.abi, await ethers.getSigner(deployer)) 

        await token.approve(pool_atom.address, ethers.constants.MaxUint256);
        await token.approve(pool_cerc20.address, ethers.constants.MaxUint256);
        await cerc20.approve(pool_cerc20.address, ethers.constants.MaxUint256)
        await cerc20.approve(pool_atom.address, ethers.constants.MaxUint256)

        await pool_atom.addLiquidity(lp_token, { value : lp_ether });
        await pool_cerc20.addLiquidity(lp_token, { value : lp_ether });

        console.log(`Atom - Ether Reserves : ${ethers.utils.formatEther(await pool_atom.getEtherReserves())}`)
        console.log(`Atom - Token Reserves : ${ethers.utils.formatEther(await pool_atom.getTokenReserves())}`)

        console.log(`CERC20 - Ether Reserves : ${ethers.utils.formatEther(await pool_cerc20.getEtherReserves())}`)
        console.log(`CERC20 - Token Reserves : ${ethers.utils.formatEther(await pool_cerc20.getTokenReserves())}`)

        const cb1 = await cerc20.balanceOf(deployer)
        const tb1 = await token.balanceOf(deployer)
        console.log("\nswapping 100 CERC20 tokens for Atom Token")
        await pool_atom.TokenToTokenSwap(cerc20.address, ethers.utils.parseEther("100"), 0)
        const cb2 = await cerc20.balanceOf(deployer)
        const tb2 = await token.balanceOf(deployer)
        console.log("swapped CERC20 tokens: " + ethers.utils.formatEther(cb1.sub(cb2)))
        console.log("received Atom tokens : " + ethers.utils.formatEther(tb2.sub(tb1)))
        
    })
})
