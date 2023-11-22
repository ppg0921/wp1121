import { Many, relations, sql } from "drizzle-orm";
import {
  index,
  text,
  pgTable,
  serial,
  uuid,
  varchar,
  unique,
  timestamp,
} from "drizzle-orm/pg-core";


export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 100 }),
    provider: varchar("provider", {
      length: 100,
      enum: ["github", "credentials"],
    })
      .notNull()
      .default("credentials"),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    usernameIndex: index("username_index").on(table.username),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  usersToDocumentsTable: many(usersToDocumentsTable),
}));

export const documentsTable = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    // title: varchar("title", { length: 100 }).notNull(),
    content: varchar("content", { length: 100 }).notNull().array(),
    lastMessage: varchar("lastMessage", { length: 100 }),
    pinnedMessage: varchar("pinnedMessage", { length: 100 }),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);

// export const messagesTable = pgTable(
//   "messages",
//   {
//     id: serial("id").primaryKey(),
//     displayId: uuid("display_id").defaultRandom().notNull().unique(),
//     content: varchar("content", { length: 100 }).notNull(),
//     createdAt: timestamp("created_at").default(sql`now()`),
//     documentId: uuid("document_id")
//       .notNull()
//       .references(() => documentsTable.displayId, {
//         onDelete: "cascade",
//         onUpdate: "cascade",
//       }),
//     senderId: uuid("sender_id")
//       .notNull()
//       .references(() => usersTable.displayId, {
//         onDelete: "cascade",
//         onUpdate: "cascade",
//       }),
//   },
//   (table) => ({
//     createdAtIndex: index("created_at_index").on(table.createdAt),
//     documentIdIndex: index("document_id_index").on(table.documentId),
//   }),
// );

// export const messagesToDocumentTable = pgTable(
//   "messages_to_documents",
//   {
//     id: serial("id").primaryKey(),
//     messageId: uuid("message_id")
//       .notNull()
//       .references(() => messagesTable.displayId, {
//         onDelete: "cascade",
//         onUpdate: "cascade",
//       }),
//     documentId: uuid("document_id")
//       .notNull()
//       .references(() => documentsTable.displayId, {
//         onDelete: "cascade",
//         onUpdate: "cascade",
//       }),
//   },
//   (table) => ({
//     userAndDocumentIndex: index("message_and_document_index").on(
//       table.messageId,
//       table.documentId,
//     ),
//     // This is a unique constraint on the combination of userId and documentId.
//     // This ensures that there is no duplicate entry in the table.
//     uniqCombination: unique().on(table.documentId, table.messageId),
//   }),
// );

// export const messagesRelations = relations(documentsTable, ({ many }) => ({
// 	messages: many(messagesTable),
// }));

// export const messagesToDocRelations = relations(messagesTable, ({ one }) => ({
// 	document: one(documentsTable, {
//     fields: [documentsTable.displayId],
//     references: [documentsTable.displayId],
//   }),
// }));

export const documentsRelations = relations(documentsTable, ({ many }) => ({
  usersToDocumentsTable: many(usersToDocumentsTable),
}));

export const usersToDocumentsTable = pgTable(
  "users_to_documents",
  {
    id: serial("id").primaryKey(),
    user1Id: uuid("user1_id")
      .notNull()
      .references(() => usersTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // user2Id: uuid("user2_id")
    //   .notNull()
    //   .references(() => usersTable.displayId, {
    //     onDelete: "cascade",
    //     onUpdate: "cascade",
    //   }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documentsTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    userAndDocumentIndex: index("user_and_document_index").on(
      table.user1Id,
      table.documentId,
    ),
    // This is a unique constraint on the combination of userId and documentId.
    // This ensures that there is no duplicate entry in the table.
    uniqCombination: unique().on(table.documentId, table.user1Id),
  }),
);

export const usersToDocumentsRelations = relations(
  usersToDocumentsTable,
  ({ one }) => ({
    document: one(documentsTable, {
      fields: [usersToDocumentsTable.documentId],
      references: [documentsTable.displayId],
    }),
    user1: one(usersTable, {
      fields: [usersToDocumentsTable.user1Id],
      references: [usersTable.displayId],
    }),
    // user2: one(usersTable, {
    //   fields: [usersToDocumentsTable.user2Id],
    //   references: [usersTable.displayId],
    // })
  }),
);

export const userToUserTable = pgTable(
  "user_to_user",
  {
    id: serial("id").primaryKey(),
    user1Id: uuid("user1_id")
      .notNull()
      .references(() => usersTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    user2Id: uuid("user2_id")
      .notNull()
      .references(() => usersTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // documentId: uuid("document_id")
    //   .notNull()
    //   .references(() => documentsTable.displayId, {
    //     onDelete: "cascade",
    //     onUpdate: "cascade",
    //   }),
  },
  (table) => ({
    userAndDocumentIndex: index("user_and_document_index").on(
      table.user1Id,
      table.user2Id,
    ),
    // This is a unique constraint on the combination of userId and documentId.
    // This ensures that there is no duplicate entry in the table.
    uniqCombination: unique().on(table.user2Id, table.user1Id),
  }),
);