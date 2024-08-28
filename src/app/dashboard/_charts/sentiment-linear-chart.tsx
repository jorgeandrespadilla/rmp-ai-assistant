"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { sentimentCategoriesConfig } from "./constants"
import { ReviewStatsData } from "@/app/api/stats/route"

const chartConfig = {
  reviews: {
    label: "Reviews",
  },
  ...sentimentCategoriesConfig,
} satisfies ChartConfig

interface SentimentLinearChartProps {
  data: ReviewStatsData["linear"]
}

export function SentimentLinearChart({ data }: SentimentLinearChartProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sentiment Evolution</CardTitle>
          <CardDescription>
            Showing sentiment evolution over time
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data.points}>
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(160 60% 45%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(160 60% 45%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(30 80% 55%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(30 80% 55%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(0 80% 55%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0 80% 55%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="POSITIVE"
              type="natural"
              fill="url(#fillPositive)"
              stroke="hsl(160 60% 45%)"
              stackId="a"
            />
            <Area
              dataKey="NEUTRAL"
              type="natural"
              fill="url(#fillNeutral)"
              stroke="hsl(30 80% 55%)"
              stackId="a"
            />
            <Area
              dataKey="NEGATIVE"
              type="natural"
              fill="url(#fillNegative)"
              stroke="hsl(0 80% 55%)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
