import React, { useEffect } from "react";

// import CardDialog from "./CardDialog";

import { useRef, useState } from "react";

// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
// import Divider from "@mui/material/Divider";
// import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
// import Typography from "@mui/material/Typography";
import CheckBox from "@mui/material/Checkbox";
// import { Select } from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';

import useCards from "@/hooks/useCards";
import { updateCard } from "@/utils/client";
// import { setServers } from "dns";



export type CardProps = {
  id: string;
  title: string;
  singer: string;
  songLink: string;
  list_id: string[];
  currentList?: string;
  selectedCards: string[];
  setSelectedCards: (list: string[]) => void;
  totalSelected: boolean;
};

export default function Card({ id, title, singer, songLink, setSelectedCards, selectedCards, totalSelected }: CardProps) {

  const { fetchCards, fetchLists, lists} = useCards();
  const [unAddedLists, setUnAddedLists] = useState<{ id: string, name: string }[]>([{ id: "fakeId", name: "still loading..." }]);
  const [responsedToTotalCheck, setResponsedToTotalCheck] = useState(false);

  useEffect(() => {
    setResponsedToTotalCheck(false);
    // if (totalSelected === false) {
    //   // from selected to unselected
    //   setResponsedToTotalCheck(false);
    // }else{
    //   // from unselected to selected
    //   setResponsedToTotalCheck(false);
    // }
    // console.log("selectedCards = ",selectedCards);

  }, [totalSelected]);

  // const [edittingTitle, setEdittingTitle] = useState(false);
  // const [edittingSinger, setEdittingSinger] = useState(false);
  const [edittingSongLink, setEdittingSongLink] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openSelect = Boolean(anchorEl);


  const handleClickSelect = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    await fetchCards();
    setUnAddedLists(lists.map((eachList) => ({ id: eachList.id, name: eachList.name })));
    // console.log("the Card: ", theCard);
    // const tmpList = lists.filter((eachList) => (theCard.list_id.includes(eachList.id) === false));
    // setUnAddedLists((tmpList.length >= 1) ? tmpList.map((eachList) => ({ id: eachList.id, name: eachList.name })) : [{ id: "fakeId", name: "the song is already in every existed lists" }]);
  };

  const handleClickWhenTotalSelected = async () => {
    setResponsedToTotalCheck(true);
    setSelectedCards(selectedCards.filter((eachId) => (eachId !== id)));
    // console.log("selectedCards: ", selectedCards);
  }

  const handleCloseSelect = async (addid: string) => {
    try {
      if (addid !== "fakeId") {
        // console.log("here1");
        // console.log("addid = ", addid);
        // console.log("[addid]=", [addid]);
        await updateCard(id, { variant: "addList", list_id: [addid] });
        // console.log("here2");
      }
      await fetchCards();
      setUnAddedLists([{ id: "fakeId", name: "still loading..." }]);
      setAnchorEl(null);
    } catch (error) {
      // console.log(error);
    }
  };

  const onChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("event.checked = ", event.target.checked);
    if (event.target.checked) {
      // console.log("add ", id);
      setSelectedCards(selectedCards.concat([id]));
    }
    else {
      // console.log("remove ", id);
      setSelectedCards(selectedCards.filter((eachId) => (eachId !== id)));
    }
    // console.log("selectedCards: ", selectedCards);
  }



  const titleInputRef = useRef<HTMLInputElement>(null);
  const singerInputRef = useRef<HTMLInputElement>(null);
  const songLinkInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateTitle = async () => {
    if (!titleInputRef.current) return;
    const newTitle = titleInputRef.current.value;
    if (newTitle !== title) {
      try {
        await updateCard(id, { title: newTitle });
        fetchCards();
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update song title");
      }
    }
    // setEdittingTitle(false);
  };

  const handleUpdateSinger = async () => {
    if (!singerInputRef.current) return;

    const newSinger = singerInputRef.current.value;
    if (newSinger !== singer) {
      try {
        await updateCard(id, { singer: newSinger });
        // console.log(currentList);
        fetchCards();
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update song singer");
      }
    }
    // setEdittingSinger(false);
  };

  const handleUpdateSongLink = async () => {
    if (!songLinkInputRef.current) return;

    const newSongLink = songLinkInputRef.current.value;
    if (newSongLink !== songLink) {
      try {
        await updateCard(id, { songLink: newSongLink });
        fetchCards();
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update song link");
      }
    }
    setEdittingSongLink(false);
  };

  

  return (
    <>
      <Paper className="flex w-full" >
        {(totalSelected && (!responsedToTotalCheck)) ?
          (<button onClick={handleClickWhenTotalSelected}><CheckBox checked={true} /></button>)
          : (<CheckBox onChange={onChecked} />)
        }


        <ClickAwayListener onClickAway={handleUpdateTitle}>
          <Input
            autoFocus
            defaultValue={title}
            className="w-32"
            placeholder="Enter a new title for this song..."
            sx={{ fontSize: "0.5rem" }}
            inputRef={titleInputRef}
          />
        </ClickAwayListener>
        <ClickAwayListener onClickAway={handleUpdateSinger}>
          <Input
            autoFocus
            defaultValue={singer}
            className="w-32"
            placeholder="Enter a new singer for this song..."
            sx={{ fontSize: "0.5rem" }}
            inputRef={singerInputRef}
          />
        </ClickAwayListener>
        {edittingSongLink?(
          <ClickAwayListener onClickAway={handleUpdateSongLink}>
            <Input
              autoFocus
              defaultValue={songLink}
              className="w-96"
              placeholder="Enter a new songLink for this song..."
              sx={{ fontSize: "0.5rem" }}
              inputRef={songLinkInputRef}
            />
          </ClickAwayListener>
        ):(<button onClick={()=>{setEdittingSongLink(true)} } className="w-96 text-start text-sm">
          <Link href={songLink} underline="hover" target="_blank" className="w-96 text-start text-sm">
            {songLink}
          </Link></button>)
        }
        
        <Button
          id="basic-button"
          aria-controls={openSelect ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openSelect ? 'true' : undefined}
          onClick={handleClickSelect}
          className="w-40"
        >
          Add to a playList
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openSelect}
          onClose={() => handleCloseSelect("fakeId")}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {unAddedLists.map((list) => (
            <MenuItem value={list.id} key={list.id} onClick={() => handleCloseSelect(list.id)}>
              {list.name}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      {/* <Paper className="flex w-full flex-col p-2" elevation={6}>
        {title}   {singer}    {songLink}
      </Paper> */}
      {/* <button onClick={handleClickOpen} className="text-start">
        <Paper className="flex w-full flex-col p-2" elevation={6}>
          {title}
        </Paper>
      </button> */}
    </>
  );
}
