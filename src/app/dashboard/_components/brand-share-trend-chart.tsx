"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { brandList } from "data/brand";

interface BrandShareTrendChartProps {
  data: Record<number, { x: string; y: number }[]>;
  weekDateMap: Record<string, { date_start: string; date_end: string }>;
}

export function BrandShareTrendChart({ data, weekDateMap }: BrandShareTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const brandIds = Object.keys(data).map(Number);
    const allWeeks = Array.from(
      new Set(
        brandIds.flatMap((bid) => data[bid].map((d) => d.x))
      )
    ).sort((a, b) => {
      // a, b 形如 "2025-W1"
      const [ya, wa] = a.split('-W').map(Number);
      const [yb, wb] = b.split('-W').map(Number);
      if (ya !== yb) return ya - yb;
      return wa - wb;
    });
    const series = brandIds.map((bid) => {
      const brand = brandList.find((b) => b.id === bid);
      return {
        name: brand?.name ?? String(bid),
        type: "line",
        data: allWeeks.map((w) => {
          const found = data[bid].find((d) => d.x === w);
          return found ? found.y : null;
        }),
        smooth: true,
        showSymbol: false,
        color: brand?.color,
        lineStyle: { color: brand?.color },
      };
    });

    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          if (!params.length) return '';
          const week = params[0].axisValue;
          const dateObj = weekDateMap[week];
          const dateRange = dateObj ? ` (${dateObj.date_start}~${dateObj.date_end})` : '';
          const formatPercent = (v: number) => {
            if (typeof v !== 'number' || isNaN(v)) return v;
            return v % 1 === 0 ? v.toString() : v.toFixed(1).replace(/\.0$/, '');
          };
          let result = `${week}${dateRange}<br/>`;
          params.forEach((item: any) => {
            const value = (item.value === undefined || item.value === null) ? 0 : item.value;
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:${item.color}"></span>${item.seriesName}: ${formatPercent(value)}%<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: brandIds.map((bid) => brandList.find((b) => b.id === bid)?.name ?? String(bid)),
        type: "scroll",
        top: 10,
        right: 100,
      },
      xAxis: {
        type: "category",
        data: allWeeks,
        boundaryGap: false,
        axisLabel: { rotate: 0 },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: { formatter: (v: number) => v + "%" },
      },
      series,
      grid: { left: 40, right: 10, top: 60, bottom: 30 },
    });
    function handleResize() { chart.resize(); }
    window.addEventListener("resize", handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [data, weekDateMap]);

  const hasData = Object.values(data).some((arr) => arr.length > 0);
  if (!hasData) {
    return <div className="min-h-[240px] h-[40vw] max-h-[360px] md:h-[320px] md:min-h-[240px] md:max-h-[480px] flex items-center justify-center">暂无数据</div>;
  }
  return (
    <div
      ref={chartRef}
      className="min-h-[240px] h-[40vw] max-h-[360px] md:h-[320px] md:min-h-[240px] md:max-h-[480px] w-full"
    />
  );
} 