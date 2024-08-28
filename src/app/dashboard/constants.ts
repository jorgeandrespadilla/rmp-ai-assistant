import { ChartConfig } from "@/components/ui/chart";

export const sentimentCategoriesConfig = {
  POSITIVE: {
    label: "Positive",
    color: "hsl(160 60% 45%)",
  },
  NEUTRAL: {
    label: "Neutral",
    color: "hsl(30 80% 55%)",
  },
  NEGATIVE: {
    label: "Negative",
    color: "hsl(0 80% 55%)",
  },
} satisfies ChartConfig
