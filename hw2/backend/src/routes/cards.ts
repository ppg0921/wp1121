// import {} from "../controllers/lists";
import {
  createCard,
  deleteCard,
  getCard,
  getCards,
  getCardsByList,
  updateCard,
} from "../controllers/cards";
import express from "express";

const router = express.Router();

// GET /api/cards
router.get("/", getCards);
// GET /api/cards/:id
router.get("/:id", getCard);
// GET /api/cards/byList/:id
router.get("/byList/:id", getCardsByList);
// POST /api/cards
router.post("/", createCard);
// PUT /api/cards/:id
router.put("/:id", updateCard);

// router.put("/", )
// DELETE /api/cards/:id
router.delete("/:id", deleteCard);

// export the router
export default router;
