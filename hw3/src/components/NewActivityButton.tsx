"use client";

import { useState } from "react";
import type { EventHandler, MouseEvent } from "react";

// import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import ActivityDialog from "./ActivityDialog";

// import useLike from "@/hooks/useLike";
// import useTweet from "@/hooks/useTweet";
// import { cn } from "@/lib/utils";

type LikeButtonProps = {
  handle?: string;
};

export default function NewActivityButton({
  handle,
}: LikeButtonProps) {
  // const { postTweet, loading } = useTweet();
  const [openActivityDialog, setOpenActivityDialog] = useState(false);

  const handleClick: EventHandler<MouseEvent> = async () => {
    // since the parent node of the button is a Link, when we click on the
    // button, the Link will also be clicked, which will cause the page to
    // navigate to the tweet page, which is not what we want. So we stop the
    // event propagation and prevent the default behavior of the event.
    // e.stopPropagation();
    // e.preventDefault();
    if (!handle) return;
    setOpenActivityDialog(true);
  };

  return (
    <>
			<Button onClick={handleClick} className="bg-green-300">Add Activity</Button>
			<ActivityDialog activityDialogOpen={openActivityDialog} onClose={()=>setOpenActivityDialog(false)}></ActivityDialog>
    </>
  );
}
