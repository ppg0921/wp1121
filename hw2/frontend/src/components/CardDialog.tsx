import { useEffect, useState } from "react";
import axios from 'axios';

import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Input from "@mui/material/Input";


import useCards from "@/hooks/useCards";
import { createCard } from "@/utils/client";


// this pattern is called discriminated type unions
// you can read more about it here: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
// or see it in action: https://www.typescriptlang.org/play#example/discriminate-types


type CardDialogProps = {
  open: boolean;
  onClose: () => void;
  listId: string;
}


export default function CardDialog(props: CardDialogProps) {
  const { open, onClose, listId } = props;

  // using a state variable to store the value of the input, and update it on change is another way to get the value of a input
  // however, this method is not recommended for large forms, as it will cause a re-render on every change
  // you can read more about it here: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
  const [newTitle, setNewTitle] = useState("title");
  const [newSinger, setNewSinger] = useState("singer");
  const [newSongLink, setNewSongLink] = useState("songLink");
  useEffect(()=>{
    setNewTitle("title");
    setNewSinger("singer");
    setNewSongLink("songLink");
  }, [open])

  const { fetchCards } = useCards();

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    if(newTitle==="title"){
      alert("Plase change the title");
      return;
    }
    if(newSinger==="singer"){
      alert("Please change the singer");
      return;
    }
    if(newSongLink==="songLink"){
      alert("Please change the song link");
      return;
    }
    try {
      await createCard({
        title: newTitle,
        singer: newSinger,
        songLink: newSongLink,
        list_id: [listId],
      });

      fetchCards();
    } catch (error: unknown) {
      // console.log(error.response.error.data);
      if (axios.isAxiosError(error))  {
        alert(error.response?.data.error ?? "Error: Failed to save card");
      }else{
        alert("Error: Failed to save card");
      } 
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="flex gap-4">


        <ClickAwayListener
          onClickAway={() => { }}
        >
          <Input
            autoFocus
            defaultValue={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="grow"
            placeholder="Enter a title for this card..."
          />
        </ClickAwayListener>
        

      </DialogTitle>
      <DialogContent className="w-[600px]">
        <ClickAwayListener onClickAway={() => { }}>
          <Input
            autoFocus
            defaultValue={newSinger}
            onChange={(e) => setNewSinger(e.target.value)}
            className="grow"
            placeholder="Enter a singer for this card..."
          />
        </ClickAwayListener>
        <ClickAwayListener onClickAway={() => { }}>
          <Input
            autoFocus
            defaultValue={newSongLink}
            onChange={(e) => setNewSongLink(e.target.value)}
            className="grow"
            placeholder="Enter a songLink for this card..."
          />
        </ClickAwayListener>
        {/* {edittingSinger ? (
          <ClickAwayListener
            onClickAway={() => {
              if (variant === "edit") {
                setEdittingSinger(false);
              }
            }}
          >
            <textarea
              className="bg-white/0 p-2"
              autoFocus
              defaultValue={singer}
              placeholder="Add a more detailed description..."
              onChange={(e) => setNewSinger(e.target.value)}
            />
          </ClickAwayListener>
        ) : (
          <button
            onClick={() => setEdittingSinger(true)}
            className="w-full rounded-md p-2 hover:bg-white/10"
          >
            <Typography className="text-start">{newSinger}</Typography>
          </button>
        )} */}
        <DialogActions>
          <Button onClick={handleSave}>save</Button>
          <Button onClick={handleClose}>close</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
