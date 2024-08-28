"use client";

import { useRef } from "react";
import { HeroWithOrbitingCircles } from "./(components)/Hero2";
import { FeatureSection } from "./(components)/Features";
import { MarqueeDemo } from "./(components)/Reviews";
import { StickyHeader } from "./(components)/Header";

export default function Home() {
  const containerRef = useRef(null);

  return (
    <main
      ref={containerRef}
      className=" bg-background h-full w-full overflow-y-auto"
    >
      <StickyHeader containerRef={containerRef} />
      <HeroWithOrbitingCircles />
      <div className="flex justify-center items-center w-full px-4">
        <div className="max-w-screen-lg w-full" id="features">
          <FeatureSection />
        </div>
      </div>
      <div className="flex justify-center items-center w-full px-4">
        <div className="max-w-screen-lg w-full" id="reviews">
          <MarqueeDemo />
        </div>
      </div>
      <div>
        <section
          id="clients"
          className="text-center mx-auto max-w-[80rem] px-6 md:px-8"
        >
          <div className="py-14">
            <div className="mx-auto max-w-screen-xl px-4 md:px-8">
              <h2 className="text-center text-2xl font-bold     text-white">
                MEET OUR TEAM
              </h2>
              <div className="mt-6">
                <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
                  <li className="flex flex-col items-center">
                    <img
                      src="/images/member_jorgeandrespadilla.jpeg"
                      alt="Jorge Andres Padilla"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Jorge Andres Padilla</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="/images/member_gabrielapadilla.jpeg"
                      alt="Gabriela Padilla"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Gabriela Padilla</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="/images/member_jennifermena.jpeg"
                      alt="Jennifer Mena"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Jennifer Mena</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="/images/member_guleednuh.jpeg"
                      alt="Guleed Nuh"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Guleed Nuh</p>
                  </li>
                </ul>
              </div>
              <br />
              <br />
            </div>
          </div>
        </section>
      </div>


    </main>
  );
}
