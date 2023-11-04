"use client";

import { useRef } from "react";

import GrowingTextarea from "@/components/GrowingTextarea";
import UserAvatar from "@/components/UserAvatar";
import useComment from "@/hooks/useComment";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

type ReplyInputProps = {
  replyToTweetId: number;
  replyToHandle: string;
  liked: boolean;
};

export default function ReplyInput({
  replyToTweetId,
  replyToHandle,
  liked,
}: ReplyInputProps) {
  const { handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const { postTweet, loading } = useTweet();
  const { postComment, loading } = useComment();

  const handleReply = async () => {
    const content = textareaRef.current?.value;
    if (!content) return;
    if (!handle) return;
    if(!liked) return;

    try {
      await postComment({
        handle,
        content,
        replyToTweetId,
      });
      textareaRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
    } catch (e) {
      console.error(e);
      alert("Error posting reply");
    }
  };

  return (
    // this allows us to focus (put the cursor in) the textarea when the user
    // clicks anywhere on the div
    <div onClick={() => textareaRef.current?.focus()}>
      <div className="grid grid-cols-[fit-content(48px)_1fr] gap-4 px-4 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <UserAvatar className="col-start-1 row-start-2 h-12 w-12" />
        <p className="col-start-2 row-start-1 text-gray-500">
          Replying to <span className="text-brand">@{replyToHandle}</span>
        </p>
        <GrowingTextarea
          ref={textareaRef}
          wrapperClassName="col-start-2 row-start-2"
          className="bg-transparent text-xl outline-none placeholder:text-gray-500"
          placeholder={liked?"Come and join discussion!":"You need to join the activity to reply"}
          disabled={!liked}
          onEnter={handleReply}
        />
      </div>
      <div className="p-4 text-end">
        <button
          className={cn(
            "my-2 rounded-full bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/70",
            "disabled:cursor-not-allowed disabled:bg-brand/40 disabled:hover:bg-brand/40",
          )}
          onClick={handleReply}
          disabled={loading}
        >
          {liked?"Comment":"You need to joint the activity to reply"}
        </button>
      </div>
    </div>
  );
}
