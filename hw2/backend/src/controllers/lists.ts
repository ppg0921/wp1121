import CardModel from "../models/card";
import ListModel from "../models/list";
import { genericErrorHandler } from "../utils/errors";
import type {
  CardData,
  CreateListPayload,
  CreateListResponse,
  GetListsResponse,
  ListData,
  UpdateListPayload,
} from "@lib/shared_types";
import type { Request, Response } from "express";
import type { Types } from "mongoose";

// Get all lists
export const getLists = async (_: Request, res: Response<GetListsResponse>) => {
  try {
    const lists = await ListModel.find({});

    // Return only the id and name of the list
    const listsToReturn = lists.map((list) => {
      return {
        id: list.id,
        name: list.name,
        description: list.description,
      };
    });

    return res.status(200).json(listsToReturn);
  } catch (error) {
    genericErrorHandler(error, res);
  }
};

// Get a list
export const getList = async (
  req: Request<{ id: string }>,
  res: Response<ListData | { error: string }>,
) => {
  try {
    const { id } = req.params;
    const lists = await ListModel.findById(id).populate("cards");
    if (!lists) {
      return res.status(404).json({ error: "id is not validjjij" });
    }

    return res.status(200).json({
      id: lists.id,
      name: lists.name,
      description: lists.description,
      cards: lists.cards as unknown as CardData[],
    });
  } catch (error) {
    genericErrorHandler(error, res);
  }
};

// Create a list
export const createList = async (
  req: Request<never, never, CreateListPayload>,
  res: Response<CreateListResponse | { error: string }>,
) => {
  try {
    const { name } = req.body;
    const checkRepeat = await ListModel.find({ name: name });
    if (checkRepeat.length>=1) {
      return res.status(405).json({ error: "List of the same name already exists!" });
    }
    const { id } = await ListModel.create(req.body);
    return res.status(201).json({ id });
  } catch (error) {
    genericErrorHandler(error, res);
  }
};

// Update a list
export const updateList = async (
  req: Request<{ id: string }, never, UpdateListPayload>,
  res: Response,
) => {
  const session = await CardModel.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { name, description, cards, variant } = req.body;

    const oldList = await ListModel.findById(id);
    if (!oldList) {
      return res.status(404).json({ error: "list_id not valid" });
    }
    // update each card(song) first
    if (cards) {
      if (variant === "removeCards") {
        // cards is the cards removed from the list
        for (const cardId of cards) {
          const oldCard = await CardModel.findById(cardId);
          if (!oldCard) {
            return res.status(404).json({ error: " card id is not valid" });
          }
          if (oldCard.list_id.length <= 1) {
            const deletedCard = await CardModel.findByIdAndDelete(cardId);
            // return res.status(404).json({ error: "hererererere" });
            if (!deletedCard) {
              return res.status(404).json({ error: "id is not valid jjpoijp" });
            }
          } else {

            oldCard.list_id = oldCard.list_id.filter((listId) => (listId.toString() !== id)) as [Types.ObjectId];
            await oldCard.save();
            // const messageString = "the card now has "+oldCard.list_id.length.toString()+" LISTS";
            // return res.status(404).json({ error: messageString });
          }
          oldList.cards = oldList.cards.filter(
            (eachId) => eachId.toString() !== cardId,
          );
        }
        await oldList.save();
      } else {
        const toStringOldCards: string[] = oldList.cards.map((card) => (card.id.toString()));
        const cardsRemoved = toStringOldCards.filter((cardId) => (cards.includes(cardId) === false));
        for (const cardId of cardsRemoved) {
          const oldCard = await CardModel.findById(cardId);
          if (!oldCard) {
            return res.status(404).json({ error: " card id is not valid" });
          }
          if (oldCard.list_id.length <= 1) {
            const deletedCard = await CardModel.findByIdAndDelete(cardId);
            if (!deletedCard) {
              return res.status(404).json({ error: "id is not valid jjpoijp" });
            }
          } else {
            oldCard.list_id = oldCard.list_id.filter((listId) => (listId.toString() !== id)) as [Types.ObjectId];
            await oldCard.save();
          }
          oldList.cards = oldList.cards.filter(
            (eachId) => eachId.toString() !== cardId,
          );
        }
        await oldList.save();
      }
    }

    // Update the list
    const newList = await ListModel.findByIdAndUpdate(
      id,
      {
        name: name,
        description: description,
      },
      { new: true },
    );

    // If the list is not found, return 404
    if (!newList) {
      return res.status(404).json({ error: "id is not validwwwwwwwwww" });
    }
    session.commitTransaction();

    return res.status(200).send("OK");
  } catch (error) {
    await session.abortTransaction();
    genericErrorHandler(error, res);
  }
};

// Delete a list
// todo still need adjustment
export const deleteList = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  // Create a transaction
  const session = await ListModel.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const deletedList = await ListModel.findById(id);
    if (!deletedList) {
      throw new Error("id is not validdafafasgtqea");
    }
    await ListModel.findByIdAndDelete(id);
    for (const cardId of deletedList.cards) {
      const eachCard = await CardModel.findById(cardId.toString());
      if (!eachCard) {
        throw new Error("card id is not valid in deletedList");
      }
      if (eachCard.list_id.length <= 1) {
        await CardModel.findByIdAndDelete(cardId);
      } else {
        eachCard.list_id = eachCard.list_id.filter((eachId) => (eachId.toString() !== id)) as [Types.ObjectId];
        await eachCard.save();
      }
    }
    await CardModel.deleteMany({ list_id: id }).session(session);
    await session.commitTransaction();
    res.status(200).send("OK");
  } catch (error) {
    await session.abortTransaction();
    genericErrorHandler(error, res);
  } finally {
    session.endSession();
  }
};
