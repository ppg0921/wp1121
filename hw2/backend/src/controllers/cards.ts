// Get cards
// Path: backend/src/controllers/cards.ts
import CardModel from "../models/card";
import ListModel from "../models/list";
import { genericErrorHandler } from "../utils/errors";
import type {
  CreateCardPayload,
  CreateCardResponse,
  GetCardResponse,
  GetCardsResponse,
  UpdateCardPayload,
  UpdateCardResponse,
} from "@lib/shared_types";
import type { Request, Response } from "express";
import type { Types } from "mongoose";

// Get all cards
export const getCards = async (_: Request, res: Response<GetCardsResponse>) => {
  try {
    const dbCards = await CardModel.find({});
    const cards = dbCards.map((card) => ({
      id: card.id as string,
      title: card.title,
      singer: card.singer,
      songLink: card.songLink,
      list_id: card.list_id.map((eachId) => (eachId.toString())),
    }));

    return res.status(200).json(cards);
  } catch (error) {
    // Check the type of error
    genericErrorHandler(error, res);
  }
};

export const getCardsByList = async (req: Request<{ id: string }>, res: Response<{ cards: string[] } | { error: string }>) => {
  try {
    const { id } = req.params;
    // const cards = {cards:["fakeid1", "fakeid2"]};
    const dbList = await ListModel.findById(id);
    if (!dbList) {
      return res.status(404).json({ error: "list not found in cards by list qqqqqq" });
    }
    const cards = {
      cards: dbList.cards.map((card) =>
        (card.toString())
      )
    };
    // const dbCards = await CardModel.find({});
    // const cards = dbCards.map((card) => ({
    //   id: card.id as string,
    //   title: card.title,
    //   singer: card.singer,
    //   songLink: card.songLink,
    //   list_id: card.list_id.map((eachId)=>(eachId.toString())),
    // }));

    return res.status(200).json(cards);
  } catch (error) {
    // Check the type of error
    genericErrorHandler(error, res);
  }
};

// Get a card
export const getCard = async (
  req: Request<{ id: string }>,
  res: Response<GetCardResponse | { error: string }>,
) => {
  try {
    const { id } = req.params;

    const card = await CardModel.findById(id);
    if (!card) {
      return res.status(404).json({ error: "id is not valid!!!!!!!!!!!11" });
    }

    return res.status(200).json({
      id: card.id as string,
      title: card.title,
      singer: card.singer,
      songLink: card.songLink,
      list_id: card.list_id.map((eachId) => (eachId.toString())),
    });
  } catch (error) {
    genericErrorHandler(error, res);
  }
};

// Create a card
export const createCard = async (
  req: Request<never, never, CreateCardPayload>,
  res: Response<CreateCardResponse | { error: string }>,
) => {
  try {
    const { title, singer, songLink, list_id } = req.body;
    const checkRepeat = await CardModel.find({title: title});
    if(checkRepeat){
      return res.status(405).json({error: "Song of the same title already exists!"});
    }
    // Check if the list exists
    const list = await ListModel.findById(list_id);
    if (!list) {
      return res.status(404).json({ error: "list_id is not valid" });
    }
    const card = await CardModel.create({
      title,
      singer,
      songLink,
      list_id,
    });

    // Add the card to the list
    list.cards.push(card._id);
    await list.save();

    return res.status(201).json({
      id: card.id as string,
    });
  } catch (error) {
    // Check the type of error
    genericErrorHandler(error, res);
  }
};

// Update a card
export const updateCard = async (
  req: Request<{ id: string }, never, UpdateCardPayload>,
  res: Response<UpdateCardResponse | { error: string }>,
) => {
  // Create mongoose transaction
  const session = await CardModel.startSession();
  session.startTransaction();
  // In `updateCard` function, 2 database operations are performed:
  // 1. Update the card
  // 2. Update the list
  // If one of them fails, we need to rollback the other one.
  // To do that, we need to use mongoose transaction.

  try {
    const { id } = req.params;
    const { title, singer, songLink, list_id, variant } = req.body;
    // return res.status(404).json({ error: JSON.stringify(req.body) });
    // update the card itself
    const newCard = await CardModel.findByIdAndUpdate(
      id,
      {
        title,
        singer,
        songLink,
      },
      { new: true },
    );
    if (!newCard) {
      return res.status(404).json({ error: "id is not validkqkqkq" });
    }

    const oldCard = await CardModel.findById(id);
    if (!oldCard) {
      return res.status(404).json({ error: "id is not validfadfafaf" });
    }

    if (variant === "addList" && list_id) {
      // list_id is the list(s) added to the song
      for (const eachId of list_id) {
        const addList = await ListModel.findById(eachId);
        if (!addList) {
          return res.status(404).json({ error: "list_id is not validfadf" });
        }
        // const toStringListId = oldCard.list_id.map((list)=>(list.toString()));
        if(!oldCard.list_id.includes(addList.id)){
          addList.cards.push(oldCard.id);
          oldCard.list_id.push(addList.id);
        }  
        await addList.save();
      }
      await oldCard.save();
      // return res.status(404).json({error:`addList.cards = ${oldCard.list_id}`});
    }
    else if (variant === "removeList" && list_id) {
      //list_id is the list(s) to be removed from the song
      for (const eachId of list_id) {
        const oldList = await ListModel.findById(eachId);
        if (!oldList) {
          return res.status(404).json({ error: "list_id is not valid" });
        }
        oldList.cards = oldList.cards.filter(
          (cardId) => cardId.toString() !== id,
        );
        oldCard.list_id = oldCard.list_id.filter((eachListId) => (
          eachListId.toString() !== eachId
        )) as [Types.ObjectId];
        await oldList.save();
      }
      await oldCard.save();
    }
    // If the user wants to update the list_id, we need to update the list as well
    else if (list_id) {
      // Remove the card from the old list
      const toStringOldList = oldCard.list_id.map((listId) => (listId.toString()));
      const listsRemoved = toStringOldList.filter((listId) => (list_id.includes(listId) === false));
      const listsAdded = list_id.filter((listId) => (toStringOldList.includes(listId) === false));
      // check list existed
      for (const eachId of listsRemoved) {
        const oldList = await ListModel.findById(eachId);
        if (!oldList) {
          return res.status(404).json({ error: "list_id is not valid" });
        }
        oldList.cards = oldList.cards.filter(
          (cardId) => cardId.toString() !== id,
        );
        await oldList.save();
      }
      // Add the card to the new list
      for (const eachId of listsAdded) {
        const newList = await ListModel.findById(eachId);
        if (!newList) {
          return res.status(404).json({ error: "list_id is not valid" });
        }
        newList.cards.push(newCard.id);
        await newList.save();
      }
    }

    // Commit the transaction
    // This means that all database operations are successful
    await session.commitTransaction();

    return res.status(200).send("OK");
  } catch (error) {
    // Rollback the transaction
    // This means that one of the database operations is failed
    await session.abortTransaction();
    genericErrorHandler(error, res);
  }
};

// Delete a card
export const deleteCard = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  // Create mongoose transaction
  // return res.status(404).json({ error: JSON.stringify(req.body) });
  const session = await CardModel.startSession();
  session.startTransaction();
  

  try {
    const { id } = req.params;

    // Delete the card from the database
    const deletedCard = await CardModel.findByIdAndDelete(id);
    if (!deletedCard) {
      return res.status(404).json({ error: "id is not validioioio" });
    }

    // Delete the card from the list
    for (const listId of deletedCard.list_id) {
      const list = await ListModel.findById(listId);
      if (!list) {
        return res.status(404).json({ error: "list_id is not valid" });
      }
      list.cards = list.cards.filter((cardId) => cardId.toString() !== id);
      await list.save();
    }

    // Commit the transaction
    session.commitTransaction();

    return res.status(200).send("OK");
  } catch (error) {
    session.abortTransaction();
    genericErrorHandler(error, res);
  }
};
