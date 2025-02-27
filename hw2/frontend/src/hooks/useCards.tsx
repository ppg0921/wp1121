import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// import type { GetCardsResponse, GetListsResponse, CardData } from "@lib/shared_types";
import type { GetCardsResponse, GetListsResponse} from "@lib/shared_types";

import type { CardListProps } from "@/components/CardList";
// import { getCards, getLists, getCardsByList, getCard } from "@/utils/client";
import { getCards, getLists } from "@/utils/client";

type CardContextType = {
  lists: CardListProps[];
  // theCard: CardData;
  fetchLists: () => Promise<void>;
  fetchCards: () => Promise<void>;
  // fetchCard: (id: string) => Promise<void>;
  // fetchCardsByList: (list_id: string) => Promise<void>;
};

// context is a way to share data between components without having to pass props down the component tree
const CardContext = createContext<CardContextType>({
  lists: [],
  // theCard: { title: "", id: "", singer: "", songLink: "", list_id: [] },
  fetchLists: async () => { },
  fetchCards: async () => { },
  // fetchCard: async () => { },
  // fetchCardsByList: async (list_id) => { },
});

type CardProviderProps = {
  children: React.ReactNode;
};

// all data fetching and processing is done here, the rest of the app just consumes the data exposed by this provider
// when we run fetchLists or fetchCards, we update the state of the provider, which causes the rest of the app to re-render accordingly
export function CardProvider({ children }: CardProviderProps) {
  const [rawLists, setRawLists] = useState<GetListsResponse>([]);
  const [rawCards, setRawCards] = useState<GetCardsResponse>([]);
  // const [rawCard, setRawCard] = useState<CardData>({ title: "", id: "", singer: "", songLink: "", list_id: [] });
  // const [rawListCards, setRawListCards] = useState<GetCardsResponse>([]);

  const fetchLists = useCallback(async () => {
    try {
      const { data } = await getLists();
      setRawLists(data);
    } catch (error) {
      alert("Error: failed to fetch lists");
    }
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      const { data } = await getCards();
      setRawCards(data);
    } catch (error) {
      alert("Error: failed to fetch cards");
    }
  }, []);

  // const fetchCard = useCallback(async (id: string) => {
  //   try {
  //     const { data } = await getCard(id);
  //     console.log("rawCard data = ", data);
  //     setRawCard(data);
  //     console.log("rawCard= ", rawCard);
  //   } catch (error) {
  //     alert("Error: failed to fetch card");
  //   }
  // }, [])

  // const fetchCardsByList = useCallback(async (list_id: string) => {
  //   try {
  //     // console.log("list_id=", list_id);
  //     // const { data } = await getCardsByList(list_id);
  //     // console.log("list_id=", list_id);
  //     // setRawListCards(data);
  //     const { data } = await getCards();
  //     setRawCards(data);
  //   } catch (error) {
  //     alert("Error: failed to fetch cards by list");
  //     console.log(error);
  //   }
  // }, []);



  const lists = useMemo(() => {
    // you can do functional-ish programming in JS too
    const listMap = rawLists.reduce(
      (acc, list) => {
        acc[list.id] = { ...list, cards: [] };
        return acc;
      },
      {} as Record<string, CardListProps>,
    );
    // or you can do for loops
    for (const card of rawCards) {
      for (const eachList of card.list_id) {
        const list = listMap[eachList];
        if (!list) {
          continue;
        }
        listMap[eachList].cards.push({
          ...card,
          list_id: card.list_id,
        });
      }
    }
    return Object.values(listMap);
  }, [ rawCards, rawLists]);

  return (
    <CardContext.Provider
      value={{
        lists,
        fetchLists,
        fetchCards,
        // fetchCard,
        // fetchCardsByList,
      }}
    >
      {children}
    </CardContext.Provider>
  );
}

// this is a custom hook, the name must start with "use"
export default function useCards() {
  return useContext(CardContext);
}
