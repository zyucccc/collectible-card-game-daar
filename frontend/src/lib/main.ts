import { ethers } from 'ethers'
import * as ethereum from './ethereum'
import { contracts } from '@/contracts.json'
import type { Main } from '$/Main'
export type { Main } from '$/Main'

export const correctChain = () => {
  // Hardhat network ID par défaut
  return 31337
}

//config et connect to smart contract
export const init = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address, abi } = contracts.Main
  const contract = new ethers.Contract(address, abi, provider)
  //check si le contract est deploye
  const deployed = await contract.deployed()
  if (!deployed) return null
  //si signer existe,connecter le contract avec signer
  const contract_ = signer ? contract.connect(signer) : contract
  return contract_ as any as Main
}

//get the contract address
export const myShip = () => contracts.Main.address
