import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

interface Item {
  name?: string;
  description: string;
  icon?: string;
  color?: string;
  time?: string;
}

const ChatNotification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "transform-gpu bg-transparent backdrop-blur-md [border:1px_solid_rgba(255,255,255,.1)] [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        {icon && (
          <div
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: color,
            }}
          >
            <span className="text-lg">{icon}</span>
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          {name && (
            <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-white">
              <span className="text-sm sm:text-lg">{name}</span>
              {time && (
                <>
                  <span className="mx-1">·</span>
                  <span className="text-xs text-gray-500">{time}</span>
                </>
              )}
            </figcaption>
          )}
          <ReactMarkdown className="text-sm font-normal text-white/60" components={{
            hr: () => <hr className="my-2 border-gray-500" />,
          }}>
            {description}
          </ReactMarkdown>
        </div>
      </div>
    </figure>
  );
};

export default ChatNotification;
