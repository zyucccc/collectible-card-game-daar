import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './styles.module.css'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'
import axios from 'axios';

const API_BASE_URL = 'http://localhost:6854';

interface CardMetaData {
  cardNumber: number;
  ImgField: string;
}

interface Collection {
  id: number;
  name: string;
  cards: CardMetaData[];
}

type Canceler = () => void
const useAffect = (
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

//difinir Hook: useWallet
//connecter le ethereum et init le contrat
const useWallet = () => {
  //detail de wallet et instance de contract
  const [details, setDetails] = useState<ethereum.Details>()
  const [contract, setContract] = useState<main.Main>()

  //connecter le wallet et init le contract
  useAffect(async () => {
    const details_ = await ethereum.connect('metamask')
    if (!details_) return
    setDetails(details_)
    const contract_ = await main.init(details_)
    if (!contract_) return
    setContract(contract_)
  }, [])

  //return
  return useMemo(() => {
    if (!details || !contract) return
    return { details, contract }
  }, [details, contract])
}

export const App: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      // get le nb de collections
      const countResponse = await axios.get(`${API_BASE_URL}/getCollectionCount`);
      const count = parseInt(countResponse.data.count);

      const collectionsData: Collection[] = [];

      // pour les single cards de chaque collection
      for (let i = 0; i < count; i++) {
        const cardsResponse = await axios.get(`${API_BASE_URL}/getAllCollectionCards/${i}`);
        const addressResponse = await axios.get(`${API_BASE_URL}/getCollectionAddress/${i}`);
        const collectionName = await axios.get(`${API_BASE_URL}/getCollectionName/${i}`);

        collectionsData.push({
          id: i,
          // name: `Collection : ${i}`,
          name: `CollectionName : ` + collectionName.data.name,
          cards: cardsResponse.data.cards
        });
      }
      //mise a jour de collections
      setCollections(collectionsData);
    } catch (err) {
      setError('Failed to fetch collections. Please try again later.');
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Collective Game</h1>
      {collections.map((collection) => (
        <div key={collection.id}>
          <h2>{collection.name}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {collection.cards.map((card, index) => (
              <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
                <img src={card.ImgField} alt={`Card ${card.cardNumber}`} style={{ width: '200px', height: '300px' }} />
                <p>CardNumber: {card.cardNumber}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
