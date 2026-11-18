import data from "@/data/series.json";

export type Series = {
  id: string;
  island: string;
  kind: "inflation" | "arrivals" | "oil" | "fuel";
  freq: "month" | "quarter";
  unit: string;
  source: string;
  points: [string, number][];
};

const all = (data as unknown as { series: Series[] }).series;

export function series(id: string): Series | undefined {
  return all.find((s) => s.id === id);
}

/** Month key ("2026-03") for a point; quarters sit on their last month (Q1 -> 2026-03). */
export function monthOf(period: string): string {
  const q = period.match(/^(\d{4})-Q([1-4])$/);
  return q ? `${q[1]}-${String(Number(q[2]) * 3).padStart(2, "0")}` : period;
}
