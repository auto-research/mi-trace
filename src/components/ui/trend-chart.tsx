"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Product } from "data/product-list";

interface TrendChartProps {
  pid?: number;
  products?: Product[];
  dataMap: Record<number, CommentRecord[]>;
}

interface CommentRecord {
  date: string;
  comments_total: number;
}

export function TrendChart({ pid, products, dataMap }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    // 合并所有日期
    const allDates = Array.from(
      new Set(
        Object.values(dataMap)
          .flat()
          .map((item) => item.date)
      )
    ).sort();
    // 构建 series
    let series: any[] = [];
    let legend: string[] = [];
    if (products && products.length > 0) {
      // 统计所有年份
      const yearSet = new Set(products.map(p => p.year));
      const years = Array.from(yearSet).sort();
      // 预设线型样式
      // 按年份分配线型：2024年实线，2023年虚线，其他dotted
      const yearLineTypeMap: Record<number, string> = {};
      years.forEach((year) => {
        if (year === 2024) {
          yearLineTypeMap[year] = 'solid';
        } else if (year === 2023) {
          yearLineTypeMap[year] = 'dashed';
        } else {
          yearLineTypeMap[year] = 'dotted';
        }
      });
      series = products.map((p) => {
        legend.push(`${p.name} (${p.year})`);
        const dataArr = dataMap[p.id] || [];
        // 按日期对齐
        const dataByDate: Record<string, number> = {};
        dataArr.forEach((item) => {
          dataByDate[item.date] = item.comments_total;
        });
        return {
          name: `${p.name} (${p.year})`,
          type: 'line',
          data: allDates.map((date) => dataByDate[date] ?? null),
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, type: yearLineTypeMap[p.year] },
          emphasis: { focus: 'series' },
          // areaStyle: { opacity: 0.1 },
        };
      });
    } else if (pid) {
      const dataArr = dataMap[pid] || [];
      series = [
        {
          name: '评论总数',
          type: 'line',
          data: dataArr.map((item) => item.comments_total),
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2 },
          // areaStyle: { opacity: 0.1 },
          emphasis: { focus: 'series' }
        },
      ];
      legend = [];
    }
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: legend.length > 0 ? {
        data: legend,
        type: 'scroll',
        top: 10,
        icon: 'circle',
        itemHeight: 12,
        itemWidth: 12,
        textStyle: {
          fontSize: 12,
          padding: [0, 8, 0, 0],
        },
      } : undefined,
      xAxis: {
        type: 'category',
        data: allDates.length > 0 ? allDates : (dataMap[pid ?? 0]?.map((item) => item.date) ?? []),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: {
          formatter: formatYAxisLabel,
        },
      },
      series,
      grid: { left: 40, right: 20, top: 60, bottom: 30 },
    });
    function handleResize() {
      chart.resize();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [dataMap, pid, JSON.stringify(products)]);

  const hasData = products && products.length > 0
    ? products.some(p => (dataMap[p.id]?.length ?? 0) > 0)
    : (dataMap[pid ?? 0]?.length ?? 0) > 0;
  if (!hasData) {
    return <div className="h-64 flex items-center justify-center">暂无数据</div>;
  }
  return <div ref={chartRef} className="h-64 w-full" />;
}

// 辅助函数：格式化 y 轴数字为 k、m、b 单位
function formatYAxisLabel(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return value.toString();
} 