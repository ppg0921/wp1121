export type User = {
  id: string;
  username: string;
  // email: string;
  provider: "github" | "credentials";
};

export type Document = {
  id: string;
  pinnedMessge: string;
  lastMessage: string;
  lastMessagePrivate: string;
  content: string[];
};

export type DocumentandUsers = {
  id: string;
  pinnedMessage: string;
  lastMessage: string;
  // lastMessagePrivate: string;
  content: string[];
  targetUsername: string;
  oriUsername: string;
};
