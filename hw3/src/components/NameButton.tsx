
"use client";

import { useState } from "react";
import type { EventHandler, MouseEvent } from "react";
import { Button } from "./ui/button";
import NameDialog from "./NameDialog";


type LikeButtonProps = {
  handle?: string;
};

export default function NameButton({
  handle,
}: LikeButtonProps) {
  const [openNameDialog, setOpenNameDialog] = useState(false);

  const handleClick: EventHandler<MouseEvent> = async (e) => {
    // since the parent node of the button is a Link, when we click on the
    // button, the Link will also be clicked, which will cause the page to
    // navigate to the tweet page, which is not what we want. So we stop the
    // event propagation and prevent the default behavior of the event.
    e.stopPropagation();
    e.preventDefault();
    console.log("name button clicked");
    if (!handle){
      console.log("no handle");
      return;
    }
    setOpenNameDialog(true);
    return;
  };



  return (
    <>
      <Button onClick={handleClick} className="bg-blue-300">Change your displayName!!</Button>
      <NameDialog openFromOutSide={openNameDialog} onClose={()=>{setOpenNameDialog(false)}}/>
    </>
    // <button
    //   className={cn(
    //     "flex w-16 items-center gap-1 hover:text-brand",
    //     liked && "text-brand",
    //   )}
    //   onClick={handleClick}
    //   disabled={loading}
    // >
    //   <div
    //     className={cn(
    //       "flex items-center gap-1 rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10",
    //       liked && "bg-brand/10",
    //     )}
    //   >
    //   </div>
    //   {likesCount > 0 && likesCount}
    // </button>
  );
}
