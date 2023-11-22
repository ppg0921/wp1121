import { NextResponse, type NextRequest } from "next/server";

import { and, eq, ne } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { usersTable, usersToDocumentsTable, documentsTable } from "@/db/schema";

import type { Document } from "@/lib/types/db";

import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import { updateDocSchema } from "@/validators/updateDocument";

// GET /api/documents/:documentId
export async function GET(
	req: NextRequest,
	{
		params,
	}: {
		params: {
			documentId: string;
		};
	},
) {
	try {
		// Get user from session
		const session = await auth();
		if (!session || !session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const userId = session.user.id;

		// Get the document
		const dbDocument = await db.query.usersToDocumentsTable.findFirst({
			where: and(
				ne(usersToDocumentsTable.user1Id, userId),
				eq(usersToDocumentsTable.documentId, params.documentId),
			),
			with: {
				document: {
					columns: {
						displayId: true,
						pinnedMessage: true,
						content: true,
					},
				},
				user1: {
					columns: {
						username: true,
					}
				}
			},
		});
		const originalUserInfo = await db.select({
			oriUsername: usersTable.username,
		})
			.from(usersTable)
			.where(eq(usersTable.displayId, userId))
			.execute();
		if (!dbDocument?.document) {
			return NextResponse.json({ error: "Message room Not Found" }, { status: 404 });
		}

		const document = dbDocument.document;
		const targetUser = dbDocument.user1;
		const oriUser = Array.isArray(originalUserInfo) ? originalUserInfo[0] : originalUserInfo;
		return NextResponse.json(
			{
				id: document.displayId,
				pinnedMessage: document.pinnedMessage,
				content: document.content,
				oriUsername: oriUser.oriUsername,
				targetUsername: targetUser.username,
			},
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{
				error: "Internal Server Error",
			},
			{
				status: 500,
			},
		);
	}
}


// PUT /api/documents/:documentId
export async function PUT(
	req: NextRequest,
	{ params }: { params: { documentId: string } },
) {
	try {
		// Get user from session
		const session = await auth();
		if (!session || !session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const userId = session.user.id;

		// Check ownership of document
		const doc = await db
			.select({
				documentId: documentsTable.displayId,
			})
			.from(documentsTable)
			.where(eq(documentsTable.displayId, params.documentId))
			.execute();

		console.log("the id = ", params.documentId);

		if (!doc) {
			return NextResponse.json({ error: "Doc Not Found in update document" }, { status: 404 });
		}

		// Parse the request body
		const reqBody = await req.json();
		let validatedReqBody: Partial<Omit<Document, "id">>;
		try {
			validatedReqBody = updateDocSchema.parse(reqBody);
		} catch (error) {
			return NextResponse.json({ error: "Bad Request" }, { status: 400 });
		}

		console.log("validate request body = ", validatedReqBody);

		// Update document
		const [updatedDoc] = await db
			.update(documentsTable)
			.set(validatedReqBody)
			.where(eq(documentsTable.displayId, params.documentId))
			.returning();

		const pusher = new Pusher({
			appId: privateEnv.PUSHER_ID,
			key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
			secret: privateEnv.PUSHER_SECRET,
			cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
			useTLS: true,
		});

		await pusher.trigger(`private-${updatedDoc.displayId}`, "doc:update", {
      senderId: userId,
      document: {
        id: updatedDoc.displayId,
        pinnedMessage: updatedDoc.pinnedMessage,
        content: updatedDoc.content,
      },
    });

		// console.log({
    //   senderId: userId,
    //   document: {
    //     id: updatedDoc.displayId,
    //     pinnedMessage: updatedDoc.pinnedMessage,
    //     content: updatedDoc.content,
    //   },
    // });

		return NextResponse.json(
			{
				id: updatedDoc.displayId,
				pinnedMessage: updatedDoc.pinnedMessage,
				content: updatedDoc.content,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

