import { db } from "@/db";
import { documentsTable, usersTable, usersToDocumentsTable } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";

export const createDocument = async (userId: string, targetId: string) => {
  "use server";
  console.log("[createDocument]");

  const newDocId = await db.transaction(async (tx) => {
    const [newDoc] = await tx
      .insert(documentsTable)
      .values({
        content: [""],
        lastMessage: "",
        pinnedMessage: "",
      })
      .returning();
    await tx.insert(usersToDocumentsTable).values({
      user1Id: userId,
      documentId: newDoc.displayId,
    });
    await tx.insert(usersToDocumentsTable).values({
      user1Id: targetId,
      documentId: newDoc.displayId,
    });
    return newDoc.displayId;
  });
  return newDocId;
};

export const getDocuments = async (userId: string) => {
  "use server";
  const documents1 = await db.query.usersToDocumentsTable.findMany({
    where: and(eq(usersToDocumentsTable.user1Id, userId)),
    with: {
      document: {
        columns: {
          displayId: true,
        }
      },
    }
  });
  type docs = {
    id: number;
    user1Id: string;
    documentId: string;
    document: {
      lastMessage: string | null;
      content: string[] | null;
    };
    user1: {
      displayId: string;
      username: string;
    };
  }[];
  const documents: docs = [];
  for (let doc of documents1) {
    const a = await db.query.usersToDocumentsTable.findFirst({
      // the same document but only find the relationship of the doc to the target
      where: and(eq(usersToDocumentsTable.documentId, doc.documentId), ne(usersToDocumentsTable.user1Id, userId)),
      with: {
        document: {
          columns: {
            lastMessage: true,
            content: true,
            displayId: true,
          }
        },
        user1: {
          columns: {
            displayId: true,
            username: true,
          },
        },
      }
    });
    if(a){
      documents.push(a);
    }
  }
  // const documents2 = await db.query.usersToDocumentsTable.findMany({
  //   where: eq(usersToDocumentsTable.user2Id, userId),
  //   with: {
  //     document: {
  //       columns: {
  //         displayId: true,
  //         lastMessage: true,
  //       }
  //     },
  //     user1: {
  //       columns: {
  //         username: true,
  //       }
  //     }
  //   }
  // });
  return documents;
}

export const getAllUsers = async (userId: string) => {
  "use server";
  const allUsers = await db
    .select({
      userId: usersTable.displayId,
      username: usersTable.username,
    })
    .from(usersTable)
    .where(ne(usersTable.displayId, userId))
    .execute();
  return allUsers;
}

export const deleteDocument = async (documentId: string) => {
  "use server";
  console.log("[deleteDocument]");

  await db
    .delete(documentsTable)
    .where(eq(documentsTable.displayId, documentId));
  return;
};
