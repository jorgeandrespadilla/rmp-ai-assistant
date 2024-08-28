"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ReviewStatsData } from "@/app/api/stats/route"
import { sentimentCategoriesConfig } from "./constants"

type SentimentCategory = keyof typeof sentimentCategoriesConfig

const chartConfig = {
  reviews: {
    label: "Reviews",
  },
  ...sentimentCategoriesConfig,
} satisfies ChartConfig

interface SentimentPieChartProps {
  data: ReviewStatsData["pie"]
}

export function SentimentPieChart({ data }: SentimentPieChartProps) {
  const chartData = Object.entries(data.categories).map(([sentiment, reviews]) => ({
    sentiment,
    reviews,
    fill: sentimentCategoriesConfig[sentiment as SentimentCategory].color,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center">Sentiment Distribution</CardTitle>
        <CardDescription>{data.timeRangeLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="reviews"
              nameKey="sentiment"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data.totalReviews.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Reviews
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {
          data.totalReviews > 0 ? (
            <div className="flex items-center gap-2 font-medium leading-none">
              Predominantly
              <span className="px-2 py-1 text-white rounded-full border" style={{ borderColor: sentimentCategoriesConfig[data.predominantCategory as SentimentCategory].color }}>
                {sentimentCategoriesConfig[data.predominantCategory as SentimentCategory].label}
              </span>
            </div>
          ) : (
            <div className="text-center">No reviews</div>
          )
        }
      </CardFooter>
    </Card>
  )
}
