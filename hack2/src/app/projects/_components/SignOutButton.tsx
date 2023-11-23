// TODO: 4. Call the signOut() function when the button is clicked
// hint: You may want to change the first line of this file
"use client"
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return <Button data-testid="sign-out-button" variant={"outline"} onClick={()=>signOut}>Sign Out</Button>;
}
// TODO: 4. end
