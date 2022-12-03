const {ethers} = require('hardhat')

const incT = async (seconds)=>{
    await ethers.provider.send('evm_increaseTime', [seconds])
    await ethers.provider.send('evm_mine', [])
}

module.exports = {
    incT
}