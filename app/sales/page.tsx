import Script from "next/script";
import { useEffect, useRef } from "react";

const sameSeriesData = {
  labels: ["小米13", "小米14", "小米15"],
  datasets: [
    {
      label: "销量",
      data: [120, 160, 200],
      backgroundColor: "#f97316",
    },
  ],
};

const sameYearData = {
  labels: ["小米15", "红米K80", "红米Turbo4"],
  datasets: [
    {
      label: "销量",
      data: [200, 140, 100],
      backgroundColor: "#3b82f6",
    },
  ],
};

function Charts() {
  const seriesRef = useRef<HTMLCanvasElement>(null);
  const yearRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !seriesRef.current || !yearRef.current) return;
    new Chart(seriesRef.current, { type: "bar", data: sameSeriesData });
    new Chart(yearRef.current, { type: "bar", data: sameYearData });
  }, []);

  return (
    <div className="flex flex-col gap-8 items-center">
      <div>
        <h2 className="text-lg font-bold mb-2">同系列不同年份款</h2>
        <canvas ref={seriesRef} width={400} height={200} />
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2">同年份不同型号</h2>
        <canvas ref={yearRef} width={400} height={200} />
      </div>
    </div>
  );
}

export default function SalesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">销量趋势</h1>
      <Charts />
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" />
    </div>
  );
}
