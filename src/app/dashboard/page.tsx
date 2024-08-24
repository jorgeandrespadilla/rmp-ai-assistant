"use client";

import { useRef } from "react";
import { StickyHeader } from "../(components)/Header";

export default function Home() {
    const containerRef = useRef(null);

    return (
        <main
            ref={containerRef}
            className=" bg-black h-full w-full overflow-y-auto"
        >
            <StickyHeader containerRef={containerRef} />
            


        </main>
    );
}