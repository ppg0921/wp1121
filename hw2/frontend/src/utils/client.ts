import type {
  CreateCardPayload,
  CreateCardResponse,
  CreateListPayload,
  CreateListResponse,
  GetCardsResponse,
  GetCardResponse,
  GetListsResponse,
  GetListResponse,
  UpdateCardPayload,
  UpdateCardResponse,
  DeleteCardResponse,
  DeleteListFromCardsPayload,
  DeleteListResponse,
  UpdateListPayload,
  UpdateListResponse,
} from "@lib/shared_types";
import axios from "axios";

import { env } from "./env";

const client = axios.create({
  baseURL: env.VITE_API_URL,
});

export function getLists() {
  return client.get<GetListsResponse>("/lists");
}

export function getList(id:string){
  return client.get<GetListResponse>(`/lists/${id}`);
}

export function getCards() {
  return client.get<GetCardsResponse>("/cards");
}

export function getCardsByList(id:string){
  return client.get<{cards: string[]}>(`/cards/byList/${id}`);
}

export function getCard(id:string){
  return client.get<GetCardResponse>(`/cards/${id}`);
}

export function createList(input: CreateListPayload) {
  return client.post<CreateListResponse>("/lists", input);
}

export function createCard(input: CreateCardPayload) {
  return client.post<CreateCardResponse>("/cards", input);
}

export function updateCard(id: string, input: UpdateCardPayload) {
  return client.put<UpdateCardResponse>(`/cards/${id}`, input);
}

export function updateList(id: string, input: UpdateListPayload) {
  return client.put<UpdateListResponse>(`/lists/${id}`, input);
}

export function deleteCard(id: string) {
  return client.delete<DeleteCardResponse>(`/cards/${id}`);
}

export function deleteList(id: string) {
  return client.delete<DeleteListResponse>(`/lists/${id}`);
}

export function DeleteListsFromCard(input:DeleteListFromCardsPayload){
  return client.put<UpdateCardResponse>(`/cards/`, input);
}
