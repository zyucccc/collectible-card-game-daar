import { ethers } from 'ethers'
import * as ethereum from './ethereum'
import { contracts } from '@/contracts.json'
// @ts-ignore
import type { Main } from '$/Main'
import main_json from '../../../contracts/artifacts/src/Main.sol/Main.json'
// @ts-ignore
export type { Main } from '$/Main'

export const correctChain = () => {
  // Hardhat network ID par défaut
  return 31337
}

//config et connect to smart contract
export const init = async (details: ethereum.Details) => {
  const { provider, signer } = details
  console.log('provider:', provider)
  console.log('signer:', signer)
  const network = await provider.getNetwork()
  console.log('network:', network)
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address } = contracts.Main
  console.log('address:', address)
  const abi = main_json.abi
  console.log('abi:', abi)
  const contract = new ethers.Contract(address, abi, provider)
  console.log('contract:', contract)
  //check si le contract est deploye
  const latestBlock = await provider.getBlockNumber()
  console.log('latestBlock:', latestBlock)
  try {
    const deployed = await contract.deployed()
    if (!deployed) return null
  }catch (e) {
    console.error('contrat non deploye')
  }
  console.log('contrat deployed')
  //si signer existe,connecter le contract avec signer
  const contract_ = signer ? contract.connect(signer) : contract
  return contract_ as any as Main
}

//get the contract address
export const myShip = () => contracts.Main.address
