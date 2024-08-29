"use client";

import { useRef } from "react";
import { HeroWithOrbitingCircles } from "./(components)/Hero2";
import { FeatureSection } from "./(components)/Features";
import { MarqueeDemo } from "./(components)/Reviews";
import { StickyHeader } from "./(components)/Header";

const teamMembers = [
  {
    name: "Jorge Andres Padilla",
    image: "/images/member_jorgeandrespadilla.jpeg",
    githubUsername: "jorgeandrespadilla",
  },
  {
    name: "Gabriela Padilla",
    image: "/images/member_gabrielapadilla.jpeg",
    githubUsername: "gabrielapadilla06",
  },
  {
    name: "Jennifer Mena",
    image: "/images/member_jennifermena.jpeg",
    githubUsername: "JennMena",
  },
  {
    name: "Guleed Nuh",
    image: "/images/member_guleednuh.jpeg",
    githubUsername: "Guleed-N",
  },
];

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
          id="team"
          className="text-center mx-auto max-w-[80rem] px-6 md:px-8"
        >
          <div className="py-14">
            <div className="mx-auto max-w-screen-xl px-4 md:px-8">
              <h2 className="text-center text-2xl font-bold text-white">
                MEET OUR TEAM
              </h2>
              <div className="mt-6">
                <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
                  {
                    teamMembers.map((member) => (
                      <li key={member.name} className="flex flex-col items-center">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-32 h-32 object-cover rounded-full"
                        />
                        <a
                          href={`https://www.github.com/${member.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white font-bold mt-2"
                        >
                          {member.name}
                        </a>
                      </li>
                    ))
                  }
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
