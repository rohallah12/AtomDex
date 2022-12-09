Uniswap-V1

<h4>Pool V1</h4>
- Only Supports ERC20-Ether Pairs
- Chained ERC20-ERC20 Swaps
- Not Supporting a router yet, swapps are performed directly against pools

<h4>Factory V1</h4>
- Connecting Pools For Chained ERC20-ERC20 swapps
- Creating new pool contracts

# Test
run "yarn hardhat test" to run test files, pool.test.js is disabled by default (to run test with factory)