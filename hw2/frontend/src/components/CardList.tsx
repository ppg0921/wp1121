import { useEffect, useState } from "react";

// import AddIcon from "@mui/icons-material/Add";

import DeleteIcon from '@mui/icons-material/Delete';
// import Button from "@mui/material/Button";
// import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
// import IconButton from "@mui/material/IconButton";
// import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import useCards from "@/hooks/useCards";
import { deleteList } from "@/utils/client";

// import Card from "./Card";
// import type { CardProps } from "./Card";
import type { CardData } from "@lib/shared_types";
// import CardDialog from "./CardDialog";
import CardListDialog from "./CardListDialog";

export type CardListProps = {
  id: string;
  name: string;
  cards: CardData[];
  description: string;
};

export default function CardList({ id, name, description, cards, deleting }: CardListProps & { deleting: boolean }) {
  // if(cards===undefined){
  //   console.log(" in CardList, undefineddddd");
  // }
  // else{
  //   console.log("in CardList", cards);
  // }
  // const [openNewCardDialog, setOpenNewCardDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const { fetchLists, lists } = useCards();
  // const inputRef = useRef<HTMLInputElement>(null);
  const [cardsInList, setCardsInList] = useState(lists.find((list) => (list.id === id))?.cards);
  // let cardsInList = lists.find((list) => (list.id === id))?.cards;
  // console.log("cardsInList = ", cardsInList);
  useEffect(()=>{
    setCardsInList(lists.find((list) => (list.id === id))?.cards);
    // console.log("cardsInList = ", cardsInList);
  }, [lists, id]);

  // const handleUpdateName = async () => {
  //   if (!inputRef.current) return;

  //   const newName = inputRef.current.value;
  //   if (newName !== name) {
  //     try {
  //       await updateList(id, { name: newName });
  //       fetchLists();
  //     } catch (error) {
  //       alert("Error: Failed to update list name");
  //     }
  //   }
  //   setEdittingName(false);
  // };

  const imgOnClick = () => {

    setOpen(true)
  };

  const handleDelete = async () => {
    try {
      await deleteList(id);
      fetchLists();
    } catch (error) {
      // console.log(error);
      alert("Error: Failed to delete list");
    }
  };

  return (
    <>
      <Paper className="w-80 p-6">
        <div className="flex gap-4">
          <div className="flex-col">
            <img src="../../6-5.png" onClick={imgOnClick}></img>
            <Typography className="text-start" variant="h4">
              {name}
            </Typography>
            <Divider variant="middle" sx={{ mt: 1, mb: 2 }} />
            <Typography className="text-start" variant="subtitle1">
              {cards.length} {cards.length <= 1 ? "song" : "songs"}
            </Typography>
            {deleting ?
              (<button onClick={handleDelete}><DeleteIcon></DeleteIcon></button>) : (<></>)
            }
          </div>
        </div>
        
        {/* <div className="flex flex-col gap-4">
          {cards.map((card) => (
            <Card key={card.id} {...card} currentList={id} totalSelected={false} />
          ))}
          <Button
            variant="contained"
            onClick={() => setOpenNewCardDialog(true)}
          >
            <AddIcon className="mr-2" />
            Add a card
          </Button>
        </div> */}
      </Paper>
      <CardListDialog
        name={name}
        open={open}
        onClose={() => setOpen(false)}
        listId={id}
        description={description}
        cards={cardsInList ?? cards}
      />
    </>
  );
}
