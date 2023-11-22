import { NextResponse, type NextRequest } from "next/server";

import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, usersToDocumentsTable, documentsTable } from "@/db/schema";

import type { Document } from "@/lib/types/db";

import { auth } from "@/lib/auth";
import { updateDocSchema } from "@/validators/updateDocument";

export async function GET(
	req: NextRequest,
	{ params }: { params: { userId: string } },
) {
	try {
		// Get user from session
		const session = await auth();
		if (!session || !session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const userId = session.user.id;

		// Get the document
		const dbDocument = await db.query.usersToDocumentsTable.findMany({
			where:
				eq(usersToDocumentsTable.user1Id, userId),
		});

		type theDocType = {
			id: number;
			user1Id: string;
			documentId: string;
			document: {
					lastMessage: string | null;
			};
			user1: {
					username: string;
			};
	} | undefined

		let roomWithTarget: theDocType = undefined;

		for (let doc of dbDocument) {
			const theDoc = await db.query.usersToDocumentsTable.findFirst({
				where:
					and(eq(usersToDocumentsTable.documentId, doc.documentId), eq(usersToDocumentsTable.user1Id, params.userId)),
				with: {
					document: {
						columns: {
							lastMessage: true,
						}
					},
					user1:{
						columns:{
							username: true,
						}
					}
				}
			})
			if (theDoc) {
				roomWithTarget = theDoc;
				break;
			}
		}

		return NextResponse.json(
			{
				found: roomWithTarget? true:false,
				id: roomWithTarget?.id,
				lastMessage: roomWithTarget?.document.lastMessage,
				targetUsername: roomWithTarget?.user1.username,
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