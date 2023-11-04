import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { db } from "@/db";
import { tweetsTable } from "@/db/schema";
// import { eq, desc, isNull, sql, ilike } from "drizzle-orm";
// import useUserInfo from "@/hooks/useUserInfo";

// zod is a library that helps us validate data at runtime
// it's useful for validating data coming from the client,
// since typescript only validates data at compile time.
// zod's schema syntax is pretty intuitive,
// read more about zod here: https://zod.dev/



// const { username, handle } = useUserInfo();

// const likesSubquery = db.$with("likes_count").as(
//   db
//     .select({
//       tweetId: likesTable.tweetId,
//       // some times we need to do some custom logic in sql
//       // although drizzle-orm is very powerful, it doesn't support every possible
//       // SQL query. In these cases, we can use the sql template literal tag
//       // to write raw SQL queries.
//       // read more about it here: https://orm.drizzle.team/docs/sql
//       likes: sql<number | null>`count(*)`.mapWith(Number).as("likes"),
//     })
//     .from(likesTable)
//     .groupBy(likesTable.tweetId),
// );

// This subquery generates the following SQL:
// WITH liked AS (
//  SELECT
//   tweet_id,
//   1 AS liked
//   FROM likes
//   WHERE user_handle = {handle}
//  )
// const likedSubquery = db.$with("liked").as(
//   db
//     .select({
//       tweetId: likesTable.tweetId,
//       // this is a way to make a boolean column (kind of) in SQL
//       // so when this column is joined with the tweets table, we will
//       // get a constant 1 if the user liked the tweet, and null otherwise
//       // we can then use the mapWith(Boolean) function to convert the
//       // constant 1 to true, and null to false
//       liked: sql<number>`1`.mapWith(Boolean).as("liked"),
//     })
//     .from(likesTable)
//     .where(eq(likesTable.userHandle, handle ?? "")),
// );

// const tweets = await db
//   .with(likesSubquery, likedSubquery)
//   .select({
//     id: tweetsTable.id,
//     content: tweetsTable.content,
//     username: usersTable.displayName,
//     handle: usersTable.handle,
//     likes: likesSubquery.likes,
//     createdAt: tweetsTable.createdAt,
//     liked: likedSubquery.liked,
//   })
//   .from(tweetsTable)
//   .where(isNull(tweetsTable.replyToTweetId))
//   .orderBy(desc(tweetsTable.createdAt))
//   // JOIN is by far the most powerful feature of relational databases
//   // it allows us to combine data from multiple tables into a single query
//   // read more about it here: https://orm.drizzle.team/docs/select#join
//   // or watch this video:
//   // https://planetscale.com/learn/courses/mysql-for-developers/queries/an-overview-of-joins
//   .innerJoin(usersTable, eq(tweetsTable.userHandle, usersTable.handle))
//   .leftJoin(likesSubquery, eq(tweetsTable.id, likesSubquery.tweetId))
//   .leftJoin(likedSubquery, eq(tweetsTable.id, likedSubquery.tweetId))
//   .as("tweeets")
// .execute();

const postTweetRequestSchema = z.object({
  handle: z.string().min(1).max(50),
  content: z.string().min(1).max(280),
  startDate: z.string().min(1).max(15),
  endDate: z.string().min(1).max(15),
  replyToTweetId: z.number().optional(),
});

// const getTweetRequestSchema = z.object({
//   searchText: z.string().min(0).max(250),
// });

// type abc = {
//   tweets: {
//     id: number;
//     content: string;
//     username: string;
//     handle: string;
//     likes: number;
//     createdAt: Date | null;
//     liked: boolean;
//   }[]
// }

// you can use z.infer to get the typescript type from a zod schema
type PostTweetRequest = z.infer<typeof postTweetRequestSchema>;
// type GetTweetRequest = z.infer<typeof getTweetRequestSchema>;

// This API handler file would be trigger by http requests to /api/likes
// POST requests would be handled by the POST function
// GET requests would be handled by the GET function
// etc.
// read more about Next.js API routes here:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    // parse will throw an error if the data doesn't match the schema
    postTweetRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Now we can safely use the data from the request body
  // the `as` keyword is a type assertion, this tells typescript
  // that we know what we're doing and that the data is of type LikeTweetRequest.
  // This is safe now because we've already validated the data with zod.
  const { handle, content, startDate, endDate, replyToTweetId } = data as PostTweetRequest;

  try {
    // This piece of code runs the following SQL query:
    // INSERT INTO tweets (
    //  user_handle,
    //  content,
    //  reply_to_tweet_id
    // ) VALUES (
    //  {handle},
    //  {content},
    //  {replyToTweetId}
    // )
    const result = await db
      .insert(tweetsTable)
      .values({
        userHandle: handle,
        startDate,
        endDate,
        content,
        replyToTweetId,
      })
      .returning({ newTweetId: tweetsTable.id })
      .execute();

    return NextResponse.json(
      { message: result[0].newTweetId },
      { status: 200 },
    );

  } catch (error) {
    // The NextResponse object is a easy to use API to handle responses.
    // IMHO, it's more concise than the express API.
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  // return new NextResponse("OK", { message: result[0].newTweetId, status: 200 });

}

// export async function GET(request: NextRequest) {
//   const data = await request.json();

//   try {
//     // parse will throw an error if the data doesn't match the schema
//     getTweetRequestSchema.parse(data);
//   } catch (error) {
//     // in case of an error, we return a 400 response
//     return NextResponse.json({ error: "Invalid request in get tweets" }, { status: 400 });
//   }

//   // Now we can safely use the data from the request body
//   // the `as` keyword is a type assertion, this tells typescript
//   // that we know what we're doing and that the data is of type LikeTweetRequest.
//   // This is safe now because we've already validated the data with zod.
//   const { searchText } = data as GetTweetRequest;
//   let ilikeParam = "";
//   if(searchText===""){
//     ilikeParam = "%";
//     console.log("ilikeParam = \"\"");
//   }else{
//     ilikeParam = "%" + searchText + "%";
//     console.log("ilikeParam = ", ilikeParam);
//   }
  

//   try {
//     // This piece of code runs the following SQL query:
//     // INSERT INTO tweets (
//     //  user_handle,
//     //  content,
//     //  reply_to_tweet_id
//     // ) VALUES (
//     //  {handle},
//     //  {content},
//     //  {replyToTweetId}
//     // )
//     const filteredTweet = await db.select().from(tweets).where(ilike(tweets.content, ilikeParam)).execute();


//     return NextResponse.json(
//       { message: filteredTweet },
//       { status: 200 },
//     );

//   } catch (error) {
//     // The NextResponse object is a easy to use API to handle responses.
//     // IMHO, it's more concise than the express API.
//     return NextResponse.json(
//       { error: "Something went wrong when getting tweets" },
//       { status: 500 },
//     );
//   }

//   // return new NextResponse("OK", { message: result[0].newTweetId, status: 200 });

// }
