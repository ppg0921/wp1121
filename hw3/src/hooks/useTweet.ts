import { useState } from "react";

import { useRouter } from "next/navigation";
// import { string } from "zod";

// type TweetInfo = {
//   id: number;
//   content: string;
//   username: string;
//   handle: string;
//   likes: number;
//   createdAt: Date | null;
//   liked: boolean;
// }[]

export default function useTweet() {
  const [loading, setLoading] = useState(false);
  const [latestTweetId, setLatestTweetId] = useState(0);
  const [returnedMessage, setReturnedMessage] = useState("");
  // const [filteredTweet, setFilteredTweet] = useState<TweetInfo>([]);
  const router = useRouter();

  const zeroLatestTweetId = ()=>{
    setLatestTweetId(0);
  }

  const postTweet = async ({
    handle,
    content,
    startDate,
    endDate,
    replyToTweetId,
  }: {
    handle: string;
    content: string;
    startDate: string;
    endDate: string;
    replyToTweetId?: number;
  }) => {
    setLoading(true);

    const res = await fetch("/api/tweets", {
      method: "POST",
      body: JSON.stringify({
        handle,
        content,
        startDate,
        endDate,
        replyToTweetId,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }
    
    res.json() // Parse the response as JSON
      .then((data: { message: number, status: number }) => {
        // Access the "message" field from the JSON response
        setReturnedMessage(JSON.stringify(data));
        console.log(`the data is: ${returnedMessage}`);
        const message = data.message;
        console.log(`The message is:${message}`);
        setLatestTweetId(message);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.
    router.refresh();
    setLoading(false);

  };

  // const getTweets = async (
  //   {searchText,}:{searchText:string;}
  // ) => {
  //   setLoading(true);

  //   const res = await fetch("/api/tweets", {
  //     method: "GET",
  //     body: JSON.stringify({
  //       searchText,
  //     }),
  //   });

  //   if (!res.ok) {
  //     const body = await res.json();
  //     throw new Error(body.error);
  //   }
    
  //   res.json() // Parse the response as JSON
  //     .then((data: { message: TweetInfo, status: number }) => {
  //       // Access the "message" field from the JSON response
  //       const message = data.message;
  //       setFilteredTweet(message);
  //       console.log("filteredTweet = ", filteredTweet);
        
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     });

  //   // router.refresh() is a Next.js function that refreshes the page without
  //   // reloading the page. This is useful for when we want to update the UI
  //   // from server components.
  //   router.refresh();
  //   setLoading(false);

  // };

  return {
    postTweet,
    zeroLatestTweetId,
    // getTweets,
    loading,
    latestTweetId,
    returnedMessage,
  };
}


