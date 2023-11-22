import { AiFillDelete, AiFillFileAdd, AiFillFileText } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";

import { createDocument, getAllUsers, getDocuments, deleteDocument } from "./actions";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { useState, useTransition } from "react";
import { ilike, eq } from "drizzle-orm";

async function Navbar() {
  const session = await auth();
  if (!session || !session?.user?.id) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL);
  }
  const userId = session.user.id;
  const username = session.user.username;
  // const searchBar = document.getElementById("searchUsersBar");

  const allUsers = await db.select({
    username: usersTable.username,
    userId: usersTable.displayId,
  })
    .from(usersTable)
    .execute();

  let filteredUsers: { username: string, userId: string }[] = [];

  const changeFilteredUsers = (theValue: { username: string, userId: string }[]) => {
    filteredUsers = theValue;
  }

  const documents = await getDocuments(userId);
  // users without user itself
  const users = await getAllUsers(userId);




  return (
    <nav className="flex w-full flex-col overflow-y-scroll bg-slate-100 pb-10">
      <nav className="sticky top-0 flex flex-col items-center justify-between border-b bg-slate-100 pb-2">
        <div className="flex w-full items-center justify-between px-3 py-1">
          <div className="flex items-center gap-2">
            <RxAvatar />
            <h1 className="text-sm font-semibold">
              {session?.user?.username ?? "User"}
            </h1>
          </div>
          <Link href={`/auth/signout`}>
            <Button
              variant={"ghost"}
              type={"submit"}
              className="hover:bg-slate-200"
            >
              Sign Out
            </Button>
          </Link>
        </div>
        <form
          action={async (e) => {
            "use server";
            console.log("value of searchbar: ", e);
            for (const [key, value] of e) {
              if (key == "searchUsers") {
                const searchFor = `%${value}%`;
                console.log("real value = ", searchFor);
                const yes = await db
                  .select({
                    username: usersTable.username,
                    userId: usersTable.displayId,
                  })
                  .from(usersTable)
                  .where(ilike(usersTable.username, searchFor))
                  .execute();
                console.log("filterusers = ", yes);

                break;
              }
            }
            // filteredUsers = await db.select({
            //   username: usersTable.username,
            //   userId: usersTable.displayId,
            // })
            //   .from(usersTable)
            //   .execute();
          }}
        >
          <input
            type="text"
            name="searchUsers"
            id="searchUsersBar"
            placeholder="search for users"
          // value={query}
          // onChange={(e) => {
          //   async () => {
          //     "use server";
          //     e.preventDefault();
          //     console.log("value of searchbar: ", e.target.value);
          //     filteredUsers = await db.select({
          //       username: usersTable.username,
          //       userId: usersTable.displayId,
          //     })
          //       .from(usersTable)
          //       .execute();
          //   }
          //   // filteredUsers = allUsers.filter((user) => (user.username.includes(e.target.value)));
          // }}
          />
          <button type="submit">submit</button>
        </form>
        <section className="flex w-full flex-col pt3">
          {users.map((user, i) => {
            return (
              <div key={i}>
                <form
                  className="w-full hover:bg-slate-200"
                  action={async () => {
                    "use server";
                    const newDocId = await createDocument(userId, user.userId);
                    revalidatePath("/docs");
                    redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs/${newDocId}`);
                  }}
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-1 text-left text-sm text-slate-500"
                  >
                    <AiFillFileAdd size={16} />
                    <p>{user.username}</p>
                  </button>
                </form>
              </div>
            )
          })}
        </section>
      </nav>
      <section className="flex w-full flex-col pt-3">
        {documents.map((doc, i) => {
          let realLast = "";
          const theContent = doc.document.content;
          if (theContent)
            for (let k = theContent.length - 1; k >= 0; k--) {
              if (theContent[k] !== "" && !theContent[k].includes("!%!%")) {
                realLast = theContent[k];
                break;
              }
            }
          return (
            <div
              key={i}
              className="group flex w-full cursor-pointer items-center justify-between gap-2 text-slate-400 hover:bg-slate-200 "
            >
              <Link
                className="grow px-3 py-1"
                href={`/docs/${doc.documentId}`}
              >
                <div className="flex items-center gap-2">
                  <p>{doc.user1.username}</p>
                  {/* <AiFillFileText /> */}
                  <span className="text-sm font-light ">
                    {realLast}
                  </span>
                </div>
              </Link>
              <form
                className="hidden px-2 text-slate-400 hover:text-red-400 group-hover:flex"
                action={async () => {
                  "use server";
                  const docId = doc.documentId;
                  await deleteDocument(docId);
                  revalidatePath("/docs");
                  redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/docs`);
                }}
              >
                <button type={"submit"}>
                  <AiFillDelete size={16} />
                </button>
              </form>
            </div>
          );
        })}
      </section>
    </nav>
  );
}

export default Navbar;
