"use client"

// import useUserInfo from "@/hooks/useUserInfo";
// import type { TweetProps } from "./Tweet";
import Tweet from "./Tweet";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
// import useTweet from "@/hooks/useTweet";

type ActivityListProps = {
	searchParams: {
		username?: string;
		handle?: string;
	};
	tweets: {
		id: number;
		content: string;
		username: string;
		handle: string;
		likes: number;
		createdAt: Date | null;
		liked: boolean;
	}[]
	// tweets: (Omit<TweetProps, "username" | "handle"> & { username: string, handle: string })[];
	// tweets: TweetProps[];
}

export default function ActivityList(props: ActivityListProps) {
	const { tweets, searchParams } = props;
	// const { username, handle } = useUserInfo();
	const [searchText, setSearchText] = useState("");
	const searchBarRef = useRef<HTMLInputElement>(null);
	// const { getTweets, filteredTweet } = useTweet();

	const searchSent = async () => {
		let nowSearchText = searchBarRef.current?.value;
		if (!nowSearchText) {
			nowSearchText = "";
		}
		// getTweets({ searchText });
		setSearchText(nowSearchText);

		return true;
	}

	return (
		<>
			<div className="flex">
				<Input
					placeholder="Search activities..."
					defaultValue=""
					className={cn("border-red-500", "col-span-3")}
					ref={searchBarRef}
					onChange={searchSent}
				/>
				<button onClick={searchSent} className="p-5"><Search size={18} /></button>
			</div>

			{tweets &&
				tweets.filter((tweet) =>
				tweet.content.toLowerCase().includes(searchText.toLowerCase())
			).map((tweet) => (
					<Tweet
						key={tweet.id}
						id={tweet.id}
						username={searchParams.username}
						handle={searchParams.handle}
						authorName={tweet.username}
						authorHandle={tweet.handle}
						content={tweet.content}
						likes={tweet.likes}
						liked={tweet.liked}
						createdAt={tweet.createdAt!}
					/>
				))
			}
		</>

	)
}