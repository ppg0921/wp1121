"use client";

import { useEffect, useRef, useState } from "react";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// all components is src/components/ui are lifted from shadcn/ui
// this is a good set of components built on top of tailwindcss
// see how to use it here: https://ui.shadcn.com/
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn,  validateUsername, validateDate } from "@/lib/utils";
import useLike from "@/hooks/useLike";

type ActivityDialogProps = {
  activityDialogOpen: boolean;
  onClose: () => void;
}

export default function ActivityDialog(props: ActivityDialogProps) {
  const { handle } = useUserInfo();
  const { activityDialogOpen, onClose } = props;
  // const [dialogOpen, setDialogOpen] = useState(false);
  const { postTweet, latestTweetId, returnedMessage, zeroLatestTweetId } = useTweet();
  const router = useRouter();
  // const pathname = usePathname();
  const searchParams = useSearchParams();
  const activitynameInputRef = useRef<HTMLInputElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const [activitynameError, setActivitynameError] = useState(false);
  const [DateError, setDateError] = useState(false);
  const { likeTweet } = useLike();
  // const [endDateError, setEndDateError] = useState(false);

  // useEffect(() => {
  //   const username = searchParams.get("username");
  //   const handle = searchParams.get("handle");
  //   // if any of the username or handle is not valid, open the dialog
  //   setDialogOpen(!validateUsername(username) || !validateHandle(handle));
  // }, [searchParams]);

  useEffect(() => {
    if (!handle || latestTweetId === 0)
      return;
    console.log("intervalllll");
    likeTweet({
      tweetId: latestTweetId,
      userHandle: handle,
    })
    router.push(`/tweet/${latestTweetId}?${searchParams}`)
    zeroLatestTweetId();
  }, [latestTweetId, handle, likeTweet, router, searchParams, zeroLatestTweetId]);

  const handleSave = async () => {
    const activityname = activitynameInputRef.current?.value;
    const startDate = startDateInputRef.current?.value;
    const endDate = endDateInputRef.current?.value;
    if (!activityname || !startDate || !endDate || !handle) return;

    const newActivitynameError = !validateUsername(activityname);
    setActivitynameError(newActivitynameError);
    // console.log("before date check");
    const newDateError = !validateDate(startDate, endDate);
    // console.log("after date check")
    setDateError(newDateError);
    

    if (newActivitynameError || newDateError) {
      return false;
    }

    try {
      await postTweet({
        handle,
        startDate,
        endDate,
        content: activityname,
      });

      console.log("latestTweetId: ", latestTweetId);
      console.log("returned message: ", returnedMessage);

      // setTimeout(likeTweet, 1000, {
      //   tweetId:latestTweetId,
      //   userHandle:handle,
      // })

      // setTimeout(() => {
      //   console.log("intervalllll");
      //   likeTweet({
      //     tweetId:latestTweetId,
      //     userHandle:handle,
      //   });
      // }, 2000);

      activitynameInputRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      activitynameInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );

    } catch (e) {
      console.error(e);
      alert("Error posting tweet");
    }

    // when navigating to the same page with different query params, we need to
    // preserve the pathname, so we need to manually construct the url
    // we can use the URLSearchParams api to construct the query string
    // We have to pass in the current query params so that we can preserve the
    // other query params. We can't set new query params directly because the
    // searchParams object returned by useSearchParams is read-only.
    // const params = new URLSearchParams(searchParams);
    // params.set("username", activityname!);
    // params.set("handle", startDate!);
    // router.push(`${pathname}?${params.toString()}`);
    onClose();
  };

  const handleClickAway = () => {
    console.log("clickAway");
    onClose();
  }

  // The Dialog component calls onOpenChange when the dialog wants to open or
  // close itself. We can perform some checks here to prevent the dialog from
  // closing if the input is invalid.
  // todo still need some check
  // const handleOpenChange = (open: boolean) => {
  //   if (open) {
  //     setDialogOpen(true);
  //   } else {
  //     // if handleSave returns false, it means that the input is invalid, so we
  //     // don't want to close the dialog
  //     await handleSave() && setDialogOpen(false);
  //   }
  // };

  return (
    <Dialog open={activityDialogOpen} >
      {/* onOpenChange={handleOpenChange} */}
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={handleClickAway}>
        <DialogHeader>
          <DialogTitle>New Activity!</DialogTitle>
          <DialogDescription>
            Please enter the name and date of your activity.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              placeholder="Activity Name"
              defaultValue=""
              className={cn(DateError && "border-red-500", "col-span-3")}
              ref={activitynameInputRef}
            />
            {activitynameError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                Invalid activity name, use only{" "}
                <span className="font-mono">[a-z0-9 ]</span>, must be between 1
                and 50 characters long.
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Starting date
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                placeholder="yyyy-mm-dd-hh"
                defaultValue=""
                className={cn(DateError && "border-red-500")}
                ref={startDateInputRef}
              />
            </div>
            {DateError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                Invalid start handle, please use yyyy-mm-dd-hh
                {/* <span className="font-mono">[a-z0-9\._-]</span>, must be between
                1 and 25 characters long. */}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Endding date
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                placeholder="yyyy-mm-dd-hh"
                defaultValue=""
                className={cn(DateError && "border-red-500")}
                ref={endDateInputRef}
              />
            </div>
            {DateError && (
              <p className="col-span-3 col-start-2 text-xs text-red-500">
                Invalid start handle, please use yyyy-mm-dd-hh
                {/* <span className="font-mono">[a-z0-9\._-]</span>, must be between
                1 and 25 characters long. */}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Add activity!!!!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
