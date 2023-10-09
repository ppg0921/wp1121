import { useEffect, useState } from "react";

import { Add as AddIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import Stack from '@mui/material/Stack';
import RemoveIcon from '@mui/icons-material/Remove';
import DoneIcon from '@mui/icons-material/Done';
import Grid from '@mui/material/Grid';

import CardList from "@/components/CardList";
import HeaderBar from "@/components/HeaderBar";
import NewListDialog from "@/components/NewListDialog";
import useCards from "@/hooks/useCards";





function App() {
  const { lists, fetchLists, fetchCards } = useCards();
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLists();
    fetchCards();
  }, [fetchCards, fetchLists]);

  return (
    <>
      <HeaderBar />
      <main className="flex-col">
        <div>
          <Stack direction="row" spacing={2} className="m-5">
            <Button
              variant="contained"
              className="w-80"
              onClick={() => setNewListDialogOpen(true)}
            >
              <AddIcon className="mr-2" />
              Add a list
            </Button>
            {(!deleting)?
              (<Button variant="outlined" className="w-80 p-2" onClick={() => setDeleting(true)} >
                <RemoveIcon className="mr-2" />
                Delete lists
              </Button>)
              :(<Button variant="outlined" className="w-80 p-2" onClick={() => setDeleting(false)} >
                <DoneIcon className="mr-2" />
                Done
              </Button>)
            }
          </Stack>
        </div>
        <div className="mx-auto flex max-h-full flex-row gap-6 px-24 py-12">
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 12, sm: 12, md: 12 }}>
            {lists.map((list) => (
              <Grid item xs={10} sm={6} md={4} key={list.id}>
                <CardList key={list.id} {...list} deleting={deleting}/>
              </Grid>
            ))}
          </Grid>
        </div>
        <NewListDialog
          open={newListDialogOpen}
          onClose={() => setNewListDialogOpen(false)}
        />
      </main>
    </>
  );
}

export default App;
