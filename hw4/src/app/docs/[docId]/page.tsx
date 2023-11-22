"use client";

import { useDocument } from "@/hooks/useDocument";
import { useRef } from "react";
import { MdDelete, MdDeleteOutline } from "react-icons/md";
import { TiPin } from "react-icons/ti";

function DocPage() {
  const { pinnedMessage, setPinnedMessage, deleteMessage, content, addNewContent, targetUsername, oriUsername } = useDocument();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="w-full">
      <nav className="sticky top-0 flex w-full justify-between p-2 shadow-sm">
        <p className="rounded-lg px-2 py-1 text-slate-700 outline-0 focus:bg-slate-100 text-4xl">{targetUsername}</p>
        <p>{pinnedMessage}</p>
      </nav>
      <div className="h-80 overflow-y-scroll overscroll-y-auto">
        {content.map((mes, i) => {
          console.log("i = ", i);
          if ((mes !== "***" && (!mes.includes("!%!%"))) || (mes.includes("!%!%") && mes.includes("!" + targetUsername + "!")))
            return (
              <div key={i}>
                {mes.includes("!" + oriUsername + "!") ? (
                  <div className="text-right p-3">
                    <span className="text-sm">{oriUsername}</span>
                    <div>{mes.replace("!" + oriUsername + "!", "")}</div>
                    <div className="flex-col">
                      <button
                        className="px-2 text-slate-400 hover:text-red-400 group-hover:flex"
                        onClick={() => deleteMessage("fake", true, i)}
                      >
                        <MdDelete size={24} />
                      </button>
                      <button
                        className="px-2 text-slate-400 hover:text-red-400 group-hover:flex"
                        onClick={() => deleteMessage("fake", false, i)}
                      >
                        <MdDeleteOutline size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-left p-3">
                    <span className="text-sm">{targetUsername}</span>
                    <div>{mes.replace("!" + targetUsername + "!", "").replace("!%!%", "")}</div>
                  </div>
                )}
                <div className="flex-col">

                  <button
                    className="hidden px-2 text-slate-400 hover:text-red-400 group-hover:flex"
                    onClick={() => setPinnedMessage(mes)}
                  >
                    <TiPin size={6} />
                  </button>
                </div>
              </div>
            )
          // })) : (
          //   <>
          //     {content.includes(oriUsername) ? (
          //       <div className="text-right p-3">
          //         <span className="text-sm">{oriUsername}</span>
          //         <div>{content.replace(oriUsername, "")}</div>
          //       </div>
          //     ) : (
          //       <div className="text-left p-3">
          //         <span className="text-sm">{targetUsername}</span>
          //         <div>{content.replace(targetUsername, "")}</div>
          //       </div>
          //     )}
          //   </>
        })}
      </div>

      <section className="w-full px-4 py-4">
        <textarea
          placeholder="enter your message here"
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const newContent = textareaRef.current?.value;
              if (!newContent)
                return;
              if (newContent === "")
                return;
              const messageWithName = "!" + oriUsername + "!" + newContent;
              addNewContent(messageWithName);
              if (textareaRef.current)
                textareaRef.current.value = "";
            }

          }}
          className="h-auto w-full border-2 rounded border-blue-800 p-3"
        />
      </section>
    </div>
  );
}
export default DocPage;
