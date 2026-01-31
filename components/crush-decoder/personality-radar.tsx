"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar as RadarIcon } from "lucide-react"
import { Brain } from "lucide-react" // Added import for Brain

interface PersonalityData {
  trait: string
  value: number
  fullMark: number
}

interface PersonalityRadarProps {
  data: PersonalityData[]
}

export function PersonalityRadar({ data }: PersonalityRadarProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <RadarIcon className="w-4 h-4 text-neon-cyan" />
          性格特征分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%" margin={{ top: 40, right: 50, bottom: 40, left: 50 }}>
              <PolarGrid stroke="rgba(168, 85, 247, 0.2)" />
              <PolarAngleAxis
                dataKey="trait"
                tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 11, dy: -2 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 8 }}
                tickCount={5}
                axisLine={false}
              />
              <Radar
                name="性格"
                dataKey="value"
                stroke="rgb(168, 85, 247)"
                fill="rgba(168, 85, 247, 0.3)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
