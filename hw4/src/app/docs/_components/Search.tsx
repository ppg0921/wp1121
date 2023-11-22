"use client"

// import useUserInfo from "@/hooks/useUserInfo";
// import type { TweetProps } from "./Tweet";
// import Tweet from "./Tweet";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
// import useTweet from "@/hooks/useTweet";

type usersListProps = {
	allUsers?: {
		userId: string;
		username: string;
	}[],
}

export default function SearchNameLists(props: usersListProps) {
	const { allUsers } = props;
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
					className="border-red-500 col-span-3"
					ref={searchBarRef}
					onChange={searchSent}
				/>
				<button onClick={searchSent} className="p-5"><FaSearch size={18} /></button>
			</div>

			{allUsers &&
				allUsers.filter((user) =>
					user.username.toLowerCase().includes(searchText.toLowerCase())
				).map((user) => {
					// // const withTarget = await 
					// <>
						
					// </>
				})
			}
		</>

	)
}