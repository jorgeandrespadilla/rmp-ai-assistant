"use client";

import { useRef, useState } from "react";
import { StickyHeader } from "../(components)/Header";
import { SentimentPieChart } from "./_charts/sentiment-pie-chart";
import { SentimentLinearChart } from "./_charts/sentiment-linear-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Professor {
  slug: string;
  name: string;
}

const sampleProfessors: Professor[] = [ // TODO: Remove this when linked to real data
  { slug: "professor-1", name: "Professor 1" },
  { slug: "professor-2", name: "Professor 2" },
  { slug: "professor-3", name: "Professor 3" },
  { slug: "professor-4", name: "Professor 4" },
  { slug: "professor-5", name: "Professor 5" },
];


export default function Home() {
  const containerRef = useRef(null);
  const [professors, setProfessors] = useState<Professor[]>(sampleProfessors);
  const [selectedProfessor, setSelectedProfessor] = useState<string>(""); // Slug
  const [timeRange, setTimeRange] = useState<string>("10y");

  return (
    <main
      ref={containerRef}
      className="h-full w-full overflow-y-auto"
    >
      <StickyHeader containerRef={containerRef} />

      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="flex flex-col items-center w-full max-w-4xl p-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">

            <Select value={selectedProfessor} onValueChange={setSelectedProfessor} disabled={professors.length === 0}>
              <SelectTrigger
                className="w-[320px] rounded-lg"
                aria-label="Select a professor"
              >
                <SelectValue placeholder={professors.length === 0 ? "Loading..." : "Select a professor"} />
              </SelectTrigger>
              {
                professors.length > 0 &&
                <SelectContent className="rounded-xl">
                  {
                    professors.map((professor) => (
                      <SelectItem key={professor.slug} value={professor.slug} className="rounded-lg">
                        {professor.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              }
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange} disabled={professors.length === 0}>
              <SelectTrigger
                className="w-[160px] rounded-lg"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 10 years" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="10y" className="rounded-lg">
                  Last 10 years
                </SelectItem>
                <SelectItem value="1y" className="rounded-lg">
                  Last year
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-4xl">
            <div className="col-span-2">
              <SentimentLinearChart professorSlug={selectedProfessor} timeRange={timeRange} />
            </div>
            <SentimentPieChart professorSlug={selectedProfessor} timeRange={timeRange} />
          </div>
        </div>

      </div>

    </main>
  );
}
