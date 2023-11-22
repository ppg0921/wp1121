import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { DocumentandUsers, User } from "@/lib/types/db";
import { pusherClient } from "@/lib/pusher/client";
import { useDebounce } from "use-debounce";
type PusherPayload = {
  senderId: User["id"];
  document: DocumentandUsers;
};


export const useDocument = () => {
  const { docId } = useParams();
  const documentId = Array.isArray(docId) ? docId[0] : docId;
  const [document, setDocument] = useState<DocumentandUsers | null>(null);
  const [dbDocument, setDbDocument] = useState<DocumentandUsers | null>(null);
  const router = useRouter();

  const debounceMilliseconds = 300;
  const [debouncedDocument] = useDebounce(document, debounceMilliseconds);
  const [debouncedDbDocument] = useDebounce(dbDocument, debounceMilliseconds);
  
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const isSynced = useMemo(() => {
    if (debouncedDocument === null || debouncedDbDocument === null) return true;
    return (
        debouncedDocument.pinnedMessage === debouncedDbDocument.pinnedMessage &&
        debouncedDocument.content === debouncedDbDocument.content
    );
  }, [debouncedDocument, debouncedDbDocument]);


  useEffect(() => {
    // [NOTE] 2023.11.18 - If either of the debounced value is null, then `isSynced` must be true. 
    //                     Therefore, we don't need to explicitly check for their null values.
    if (isSynced) return;

    const updateDocument = async () => {
      if (!debouncedDocument) return;
      // [NOTE] 2023.11.18 - This PUT request will trigger a pusher event that will update the document to the other clients.
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinnedMessage: debouncedDocument.pinnedMessage,
          content: debouncedDocument.content,
        }),
      });
      if (!res.ok) {
        return;
      }
      const data: DocumentandUsers = await res.json();
      // Update the navbar if the title changed
      if (debouncedDbDocument?.pinnedMessage !== data.pinnedMessage) {
        router.refresh();
      }
      setDbDocument(data);
    };
    updateDocument();
  }, [debouncedDocument, documentId, router, debouncedDbDocument, isSynced]);


  // Subscribe to pusher events
  useEffect(() => {
    if (!documentId) return;
    // Private channels are in the format: private-...
    const channelName = `private-${documentId}`;

    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("doc:update", ({ senderId, document: received_document }: PusherPayload) => {
        if (senderId === userId) {
          
          return;
        }
        // [NOTE] 2023.11.18 - This is the pusher event that updates the dbDocument.
        console.log("herererererere");
        setDocument(received_document);
        setDbDocument(received_document);
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      router.push("/docs");
    }

    // Unsubscribe from pusher events when the component unmounts
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [documentId, router, userId]);

  useEffect(() => {
    if (!documentId) return;
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) {
        setDocument(null);
        router.push("/docs");
        return;
      }
      const data = await res.json();
      setDocument(data);
      setDbDocument(data);
    };
    fetchDocument();
  }, [documentId, router]);


  const pinnedMessage = document?.pinnedMessage || "";
  const setPinnedMessage = (newPinnedMessage: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      pinnedMessage: newPinnedMessage,
    });
  };

  const content = document?.content||[""];
  const addNewContent = async (newContent: string) => {
    if (document === null) return;
    const trueContent = document.content;
    setDocument({
      ...document,
      lastMessage: newContent,
      content: [...trueContent, newContent],
    });
    console.log({
      content: [...trueContent, newContent],
      lastMessage: newContent.replace(oriUsername, ""),
    });
    console.log("documentId = ", documentId);
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: [...trueContent, newContent],
        lastMessage: newContent.replace(oriUsername, ""),
      }),
    });
    if (!res.ok) {
      return;
    }
    // Update the navbar
    
    router.refresh();

  };



  const deleteMessage = async (desiredContent: string, toAll: boolean, contentIndex: number) => {
    if (document === null) return;

    const originalContent = document.content;
    let revisedContent = document.content;
    let newLastMessage = "";

    if (toAll) {
      revisedContent[contentIndex] = "***";
      if (contentIndex === originalContent.length - 1) {
        for (let i = revisedContent.length - 1; i >= 0; i--) {
          if (revisedContent[i] !== "***") {
            newLastMessage = revisedContent[i];
            break;
          }
        }
      }
    } else {
      revisedContent[contentIndex] = "!%!%" + revisedContent[contentIndex];
    }

    setDocument({
      ...document,
      lastMessage: newLastMessage,
      content: revisedContent,
    });
    console.log({
      lastMessage: newLastMessage,
      content: revisedContent,
    });
    console.log("documentId = ", documentId);
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lastMessage: newLastMessage,
        content: revisedContent,
      }),
    });
    if (!res.ok) {
      console.log("not ok in delete message");
      return;
    }
    // Update the navbar
    router.refresh();

  };

  

  const targetUsername = document?.targetUsername || "";
  const oriUsername = document?.oriUsername || "";

  return {
    documentId,
    document,
    pinnedMessage,
    setPinnedMessage,
    content,
    targetUsername,
    oriUsername,
    addNewContent,
    deleteMessage,
  };

};
