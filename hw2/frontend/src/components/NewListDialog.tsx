import { useRef } from "react";
import axios from "axios";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import useCards from "@/hooks/useCards";
import { createList } from "@/utils/client";

type NewListDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewListDialog({ open, onClose }: NewListDialogProps) {
  // using a ref to get the dom element is one way to get the value of a input
  // another way is to use a state variable and update it on change, which can be found in CardDialog.tsx
  const textfieldRef = useRef<HTMLInputElement>(null);
  const desfieldRef = useRef<HTMLInputElement>(null);
  const { fetchLists } = useCards();

  const handleAddList = async () => {
    if(!textfieldRef.current?.value){
      alert("Please enter a name");
      return;
    }
    if(!desfieldRef.current?.value){
      alert("Please enter a description");
      return;
    }
    try {
      await createList({ 
        name: textfieldRef.current?.value ?? "",
        description: desfieldRef.current?.value ?? "",
      });
      fetchLists();
    } catch (error) {
      if (axios.isAxiosError(error))  {
        alert(error.response?.data.error ?? "Error: Failed to save card");
      }else{
        alert("Error: Failed to create list");
      } 
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} >
      <DialogTitle>Add a list</DialogTitle>
      <DialogContent className="flex-col p-2">
        <TextField
          inputRef={textfieldRef}
          label="List Name"
          variant="outlined"
          sx={{ mt: 2 }}
          autoFocus
        />
        <TextField
          inputRef={desfieldRef}
          label="List Description"
          variant="outlined"
          sx={{ mt: 2 }}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddList}>add</Button>
        <Button onClick={onClose}>cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
