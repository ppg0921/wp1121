import { useEffect, useState } from "react";

// import { Delete as DeleteIcon } from "@mui/icons-material";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
// import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
// import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
// import AddIcon from "@mui/icons-material/Add";
import CheckBox from "@mui/material/Checkbox";

import useCards from "@/hooks/useCards";
// import { createCard, deleteCard, updateCard, updateList, getList } from "@/utils/client";
import { updateList } from "@/utils/client";
import Card from "./Card.tsx";
import CardDialog from "./CardDialog.tsx";

import type { CardData } from "@lib/shared_types";
// import { SentimentNeutralRounded } from "@mui/icons-material";

// this pattern is called discriminated type unions
// you can read more about it here: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
// or see it in action: https://www.typescriptlang.org/play#example/discriminate-types


type CardListDialogProps = {
	open: boolean;
	onClose: () => void;
	listId: string;
	//   cardId: string;
	name: string;
	description: string;
	cards: CardData[];
};


export default function CardListDialog(props: CardListDialogProps) {

	const { cards, open, onClose, listId, name, description } = props;

	// if (cards === undefined) {
	// 	console.log(" in CardListDialog, undefineddddd");
	// }
	// else {
	// 	console.log("in CardListDialog", cards);
	// }

	const [selectedCards, setSelectedCards] = useState<string[]>([]);
	const [totalSelected, setTotalSelected] = useState(false);
	const [edittingName, setEdittingName] = useState(false);
	const [edittingDescription, setEdittingDescription] = useState(false);

	// using a state variable to store the value of the input, and update it on change is another way to get the value of a input
	// however, this method is not recommended for large forms, as it will cause a re-render on every change
	// you can read more about it here: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
	const [newName, setNewName] = useState(name);
	const [newDescription, setNewDescription] = useState(description);
	const [openNewCardDialog, setOpenNewCardDialog] = useState(false);

	const { lists, fetchCards, fetchLists } = useCards();

	useEffect(() => {
		setSelectedCards([]);
		setTotalSelected(false);
		setNewName(name);
		setNewDescription(description);
	}, [open]);

	const handleClose = () => {
		onClose();

		setNewName(name);
		setNewDescription(description);
		// setNewListId(listId);

	};

	const onTotalChecked = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setTotalSelected(true);
			const theList = lists.filter((list) => (list.id === listId));
			if (theList.length !== 0) {
				const theListReal = theList[0];
				setSelectedCards(theListReal.cards.map((card) => (card.id)));
			}
			console.log("setTotalSelected(true)");
			console.log(totalSelected);
		} else {
			setTotalSelected(false);
			setSelectedCards([]);
			console.log(totalSelected);
		}
		console.log("selectedCards = ", selectedCards);
	}

	const handleSave = async () => {
		try {
			// fetchLists();
			// if (
			// 	newName === name &&
			// 	newDescription === description
			// ) {
			// 	return;
			// }
			// typescript is smart enough to know that if variant is not "new", then it must be "edit"
			// therefore props.cardId is a valid value
			await updateList(props.listId, {
				name: newName,
				description: newDescription,
			});
			fetchLists();
		} catch (error) {
			alert("Error: Failed to save list");
		} finally {
			handleClose();
		}
	};

	// const handleLog = () => {
	// 	console.log("selectedCards = !!!!!!!!!!!111", selectedCards);
	// }

	const handleDelete = async () => {
		try {
			await updateList(listId, { variant: "removeCards", cards: selectedCards })
			console.log("updateLIst: listId = ", listId, "cards = ", selectedCards);
			// await deleteCard(props.cardId);
			fetchCards();
			fetchLists();
		} catch (error) {
			console.log(error);
			alert("Error: Failed to delete card");
		} finally {
			handleClose();
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
			<DialogTitle className="flex gap-4">
				{/* <Button onClick={handleLog}>for selected cards info</Button> */}
				<img src="../../../6-5.png" className="w-28"></img>
				<div className="flex-col">
				{edittingName ? (
					<>
						<ClickAwayListener
							onClickAway={() => {
								setEdittingName(false);
							}}
						>
							<Input
								autoFocus
								defaultValue={name}
								onChange={(e) => setNewName(e.target.value)}
								className="grow text-8xl"
								placeholder="Enter a title for this list..."
							/>
						</ClickAwayListener>

					</>
				) : (
					<button
						onClick={() => setEdittingName(true)}
						className="w-full rounded-md p-2 hover:bg-white/10"
					>
						<Typography variant="h4" className="text-start">{newName}</Typography>
					</button>
				)}
				{edittingDescription ? (
					<>
						<ClickAwayListener
							onClickAway={() => {
								setEdittingDescription(false);
							}}
						>
							<Input
								autoFocus
								defaultValue={description}
								onChange={(e) => setNewDescription(e.target.value)}
								className="grow"
								placeholder="Enter a description for this card..."
							/>
						</ClickAwayListener>
					</>
				) : (
					<button
						onClick={() => setEdittingDescription(true)}
						className="w-full rounded-md p-2 hover:bg-white/10"
					>
						<Typography className="text-start" variant="subtitle1">{newDescription}</Typography>
					</button>
				)}
				{/* <Select
					value={newListId}
					onChange={(e) => setNewListId(e.target.value)}
				>
					{lists.map((list) => (
						<MenuItem value={list.id} key={list.id}>
							{list.name}
						</MenuItem>
					))}
				</Select> */}
				{/* {variant === "edit" && (
					<IconButton color="error" onClick={handleDelete}>
						<DeleteIcon />
					</IconButton>
				)} */}
				</div>
				
			</DialogTitle>
			<DialogContent className="w-full" >

				{/* {edittingDescription ? (
					<ClickAwayListener
						onClickAway={() => {
							if (variant === "edit") {
								setEdittingDescription(false);
							}
						}}
					>
						<textarea
							className="bg-white/0 p-2"
							autoFocus
							defaultValue={description}
							placeholder="Add a more detailed description..."
							onChange={(e) => setNewDescription(e.target.value)}
						/>
					</ClickAwayListener>
				) : (
					<button
						onClick={() => setEdittingDescription(true)}
						className="w-full rounded-md p-2 hover:bg-white/10"
					>
						<Typography className="text-start">{newDescription}</Typography>
					</button>
				)} */}
				<DialogActions>
					<Button onClick={handleSave}>save</Button>
					<Button onClick={handleClose}>close</Button>
					<Button
						variant="contained"
						onClick={() => setOpenNewCardDialog(true)}
					>
						{/* <AddIcon className="mr-2" /> */}
						Add a song
					</Button>
					<Button
						variant="contained"
						onClick={handleDelete}
					>
						Delete selected songs
					</Button>
					{/* <Button onClick={handleAdd}>add</Button> */}
				</DialogActions>
				<div>
					<CheckBox onChange={onTotalChecked} />
					<Input defaultValue="title" className="grow" sx={{ fontSize: "0.5rem" }} disabled />
					<Input defaultValue="singer" className="grow" sx={{ fontSize: "0.5rem" }} disabled />
					<Input autoFocus defaultValue="songLink" className="grow" sx={{ fontSize: "0.5rem" }} disabled />

					{cards.map((card) => (
						<Card key={card.id} {...card} currentList={listId} totalSelected={totalSelected} selectedCards={selectedCards} setSelectedCards={setSelectedCards} />
					))}
				</div>
				<CardDialog
					open={openNewCardDialog}
					onClose={() => setOpenNewCardDialog(false)}
					listId={listId}
				/>
			</DialogContent>
		</Dialog>
	);
}
