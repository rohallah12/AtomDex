const fs = require("fs")
const Staking = require("../artifacts/contracts/BitEarnStaking.sol/BitStaking.json")
const Facility = require("../artifacts/contracts/BitEarnCreditFacility.sol/BitBUSDCredit.json")
const token = require("../artifacts/contracts/BitToken.sol/BitToken.json")
const busd = require("../artifacts/contracts/Stable.sol/Stable.json")
const distributor = require("../artifacts/contracts/BitEarnTokenDistributor.sol/Bitdistributor.json")
const btc = require("../artifacts/contracts/BitCoin.sol/BitCoin.json")

const updateFrontEnd = (StakingAddress, facilityAddress, distributorAddress, TokenAddress, busdAddress, btcAddress)=>{

    const path = "/home/roholah/Desktop/8Bit/src-ssr/contract/"

    //Updating Staking Info
    const stakingABI = Staking.abi
    let data = {address : StakingAddress, abi : stakingABI}
    fs.writeFileSync(path + "Staking.json", JSON.stringify(data))

    //Updating Staking Info
    const facilityABI = Facility.abi
    data = {address : facilityAddress, abi : facilityABI}
    fs.writeFileSync(path + "creditfacility.json", JSON.stringify(data))

    //Updating Staking Info
    const distABI = distributor.abi
    data = {address : distributorAddress, abi : distABI}
    fs.writeFileSync(path + "distributor.json", JSON.stringify(data))

    //updating token info
    const tokenABI = token.abi
    data = {address : TokenAddress, abi : tokenABI}
    fs.writeFileSync(path + "testToken.json", JSON.stringify(data))

    //updating token info
    const busdABI = busd.abi
    data = {address : busdAddress, abi : busdABI}
    fs.writeFileSync(path + "busdTest.json", JSON.stringify(data))

    //updating token info
    const btcABI = btc.abi
    data = {address : btcAddress, abi : btcABI}
    fs.writeFileSync(path + "btcTest.json", JSON.stringify(data))
}

module.exports = {updateFrontEnd}