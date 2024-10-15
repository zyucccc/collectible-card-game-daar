import { ethers } from 'ethers'
import * as providers from './ethereum/provider'
export * as account from './ethereum/account'

export type Wallet = 'metamask' | 'silent'

export type Details = {
  provider: ethers.providers.Provider
  signer?: ethers.providers.JsonRpcSigner
  account?: string
}

const metamask = async (requestAccounts = true): Promise<Details | null> => {
  // verifier si window.ethereum existe（l'objet que MetaMask deverse)，as any skip TypeScript typecheck
  const ethereum = (window as any).ethereum
  if (ethereum) {
    if (requestAccounts)
      await ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.providers.Web3Provider(ethereum as any)
    const accounts = await provider.listAccounts()
    //si y a des comptes, prends le premier
    const account = accounts.length ? accounts[0] : undefined
    const signer = account ? provider.getSigner() : undefined
    return { provider, signer, account }
  }
  return null
}

const silent = async (): Promise<Details> => {
  // verifier si window.ethereum existe（l'objet que MetaMask deverse)，as any skip TypeScript typecheck
  const ethereum = (window as any).ethereum
  if (ethereum) {
    //check si metamask est deverrouille
    const unlocked = await ethereum?._metamask?.isUnlocked?.()
    //si oui,appeal metamask sans demander l'autorisation du compte
    if (unlocked) return (await metamask(false))!
    const provider = new ethers.providers.Web3Provider(ethereum as any)
    return { provider }
  }
  //si pas de ethereum,choisir celui de l'envrionnement
  const provider = providers.fromEnvironment()
  return { provider }
}

export const connect = async (provider: Wallet) => {
  switch (provider) {
    case 'metamask':
      return metamask()
    case 'silent':
      return silent()
    default:
      return null
  }
}

export const accountsChanged = (callback: (accounts: string[]) => void) => {
  const ethereum = (window as any).ethereum
  //ethereum.on:ajouter un listener
  if (ethereum && ethereum.on) {
    //listener pour le changement de compte,si changement,appel le callback
    ethereum.on('accountsChanged', callback)
    return () => ethereum.removeListener('accountsChanged', callback)
  } else {
    return () => {}
  }
}

//listener pour le changement de chaine(network)
export const chainChanged = (callback: (accounts: string[]) => void) => {
  const ethereum = (window as any).ethereum
  //ethereum.on:ajouter un listener
  if (ethereum && ethereum.on) {
    ethereum.on('chainChanged', callback)
    return () => ethereum.removeListener('chainChanged', callback)
  } else {
    return () => {}
  }
}
