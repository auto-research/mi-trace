"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { brandList } from "data/brand";

interface BrandShareBarRaceChartProps {
  data: Record<number, { x: string; y: number }[]>;
  weekDateMap: Record<string, { date_start: string; date_end: string }>;
}

export function BrandShareBarRaceChart({ data, weekDateMap }: BrandShareBarRaceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const brandIds = Object.keys(data).map(Number);
    // 获取所有周（x 形如 2024-W1）
    const allWeeks = Array.from(
      new Set(
        brandIds.flatMap((bid) => data[bid].map((d) => d.x))
      )
    ).sort((a, b) => {
      const [ya, wa] = a.split('-W').map(Number);
      const [yb, wb] = b.split('-W').map(Number);
      if (ya !== yb) return ya - yb;
      return wa - wb;
    });
    // 构建每周的品牌份额快照
    const weekBrandMap: Record<string, { name: string; value: number; color: string }[]> = {};
    allWeeks.forEach((week) => {
      const arr = brandIds.map((bid) => {
        const brand = brandList.find((b) => b.id === bid);
        const found = data[bid].find((d) => d.x === week);
        return {
          name: brand?.name ?? String(bid),
          value: found ? found.y : 0,
          color: brand?.color ?? '#888',
        };
      });
      weekBrandMap[week] = arr.sort((a, b) => b.value - a.value);
    });
    // 动态条形图 option
    let currentWeekIdx = 0;
    function getOption(week: string) {
      const snapshot = weekBrandMap[week];
      return {
        title: {
          text: `${week} 品牌份额动态排行`,
          left: 'center',
          top: 10,
          textStyle: { fontSize: 18 }
        },
        grid: { left: 80, right: 40, top: 60, bottom: 30 },
        xAxis: {
          max: 100,
          splitLine: { show: false },
          axisLabel: { formatter: (v: number) => v + '%' },
        },
        yAxis: {
          type: 'category',
          data: snapshot.map((b) => b.name),
          inverse: true,
          axisLabel: { fontWeight: 'bold' },
        },
        series: [
          {
            realtimeSort: true,
            type: 'bar',
            data: snapshot.map((b) => ({ value: b.value, itemStyle: { color: b.color } })),
            label: {
              show: true,
              position: 'right',
              formatter: (p: any) => `${typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%`,
              fontWeight: 'bold',
            },
            barCategoryGap: '40%',
          },
        ],
        animationDuration: 400,
        animationDurationUpdate: 400,
        animationEasing: 'linear' as any,
        animationEasingUpdate: 'linear' as any,
        tooltip: {
          show: true,
          formatter: (params: any) => {
            const week = allWeeks[currentWeekIdx];
            const dateObj = weekDateMap[week];
            const dateRange = dateObj ? ` (${dateObj.date_start}~${dateObj.date_end})` : '';
            return `${params.name}: ${params.value}%<br/>${week}${dateRange}`;
          },
        },
      };
    }
    // 初始渲染
    chart.setOption(getOption(allWeeks[0]));
    let timer: NodeJS.Timeout | null = null;
    function play() {
      timer = setInterval(() => {
        currentWeekIdx++;
        if (currentWeekIdx >= allWeeks.length) {
          clearInterval(timer!);
          return;
        }
        chart.setOption(getOption(allWeeks[currentWeekIdx]));
      }, 900);
    }
    play();
    function handleResize() { chart.resize(); }
    window.addEventListener("resize", handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
      if (timer) clearInterval(timer);
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