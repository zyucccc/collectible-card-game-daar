import { useEffect, useMemo, useRef, useState } from 'react'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'

export type Canceler = () => void
export const useAffect = (
  asyncEffect: () => Promise<Canceler | void>,
  dependencies: any[] = []
) => {
  const cancelerRef = useRef<Canceler | void>()
  useEffect(() => {
    asyncEffect()
      .then(canceler => (cancelerRef.current = canceler))
      .catch(error => console.warn('Uncatched error', error))
    return () => {
      if (cancelerRef.current) {
        cancelerRef.current()
        cancelerRef.current = undefined
      }
    }
  }, dependencies)
}

export const useWallet = () => {
  const [details, setDetails] = useState<ethereum.Details | null>(null)
  const [contract, setContract] = useState<main.Main>()

  useAffect(async () => {
    const connectWallet = async () => {
      console.log("Connecting to wallet...")
      const details_ = await ethereum.connect('metamask')
      console.log("Wallet connected:", details_)
      if (!details_) return
      setDetails(details_)
      console.log("Initializing contract...")
      const contract_ = await main.init(details_)
      console.log("Contract initialized:", contract_)
      if (!contract_) return
      setContract(contract_)
    }
    await connectWallet()
    //ajoute un listener pour ecouter le changement de compte
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setDetails(prevDetails => ({
          ...prevDetails!,
          //mise a jour le compte actuellement connecte
          account: accounts[0],
        }))
      } else {
        setDetails(null)
        // setContract(null)
      }
    }
    //listener of ethereum
    const unsubscribe = ethereum.accountsChanged(handleAccountsChanged)
    return () => {
      unsubscribe();
    };
  }, [])

  return useMemo(() => {
      if (!details || !contract) return
      return { details, contract }
    }, [details, contract])
  //   if (!details) return
  //   return { details }
  // },[details])

}