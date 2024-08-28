"use client";

import { useEffect, useRef, useState } from "react";
import { StickyHeader } from "../(components)/Header";
import { SentimentPieChart } from "./_charts/sentiment-pie-chart";
import { SentimentLinearChart } from "./_charts/sentiment-linear-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ReviewStatsData } from "../api/stats/route";
import { ReviewData } from "../api/reviews/route";
import { Separator } from "@/components/ui/separator";
import { sentimentCategoriesConfig } from "./constants";

interface Professor {
  slug: string;
  name: string;
}

const getProfessors = async (): Promise<Professor[]> => {
  const response = await fetch("/api/professors");
  const data = await response.json();
  return data.professors as Professor[];
}

const getStats = async (professorSlug: string, timeRange: string) => {
  const response = await fetch(`/api/stats?professor=${professorSlug}&timeRange=${timeRange}`);
  const data = await response.json();
  return data.stats as ReviewStatsData;
}

const getReviews = async (professorSlug: string, timeRange: string) => {
  const response = await fetch(`/api/reviews?professor=${professorSlug}&timeRange=${timeRange}`);
  const data = await response.json();
  return data.reviews as ReviewData[];
}

function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <div className="flex flex-col bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{review.subject?.name ?? "N/A"}</h3>
        <span className="text-sm text-gray-400">{review.publishedAt}</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-400">
          Quality:
          <span className="text-white ml-1">{review.qualityRating}</span>
        </span>
        <Separator orientation="vertical" className="h-4 bg-slate-500" />
        <span className="text-sm text-gray-400">
          Difficulty:
          <span className="text-white ml-1">{review.difficultyRating}</span>
        </span>
        <Separator orientation="vertical" className="h-4 bg-slate-500" />
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">Sentiment: </span>
          <span className="text-sm" style={{ color: sentimentCategoriesConfig[review.sentiment].color }}>
            {sentimentCategoriesConfig[review.sentiment].label}
          </span>
        </div>
      </div>
      <p className="text-sm text-white mt-4">{review.content}</p>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>(""); // Slug
  const [timeRange, setTimeRange] = useState<string>("all");
  const [stats, setStats] = useState<ReviewStatsData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[] | null>(null);

  useEffect(() => {
    getProfessors()
      .then(setProfessors)
      .catch(err => {
        console.error(err);
        toast.error("Failed to fetch professors. Please try again later.");
      });
  }, []);

  useEffect(() => {
    if (selectedProfessor && timeRange) {
      getStats(selectedProfessor, timeRange)
        .then(setStats)
        .catch(err => {
          console.error(err);
          toast.error("Failed to fetch stats. Please try again later.");
        });
      getReviews(selectedProfessor, timeRange)
        .then(setReviews)
        .catch(err => {
          console.error(err);
          toast.error("Failed to fetch reviews. Please try again later.");
        });
    }
  }, [selectedProfessor, timeRange]);

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
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  All time
                </SelectItem>
                <SelectItem value="10y" className="rounded-lg">
                  Last 10 years
                </SelectItem>
                <SelectItem value="1y" className="rounded-lg">
                  Last year
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {
            stats === null
              ? (
                <div className="text-white text-lg mt-4">Select a professor to view stats & reviews</div>
              )
              : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-4xl">
                  <div className="md:col-span-2">
                    <SentimentLinearChart data={stats.linear} />
                  </div>
                  <SentimentPieChart data={stats.pie} />
                </div>
              )
          }

          {
            reviews && (
              <div className="flex flex-col w-full max-w-4xl m-8">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {
                    reviews.length === 0 && (
                      <div className="text-white text-lg text-center mt-4">No reviews found for the current professor</div>
                    )
                  }
                  {
                    reviews.map((review) => (
                      <ReviewCard key={review.publishedAt} review={review} />
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>

      </div>

    </main>
  );
}
