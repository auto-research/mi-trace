"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

interface TrendChartProps {
  pid: number;
}

interface CommentRecord {
  date: string;
  comments_total: number;
}

export function TrendChart({ pid }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CommentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await fetch(`/api/comments/crawl?pid=${pid}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.records)) {
          setData(json.records.reverse()); // 时间升序
        } else {
          setHasError(true);
        }
      } catch (e) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [pid]);

  useEffect(() => {
    if (!chartRef.current || isLoading || hasError) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.date),
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: '评论总数',
          type: 'line',
          data: data.map((item) => item.comments_total),
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.1 },
        },
      ],
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
    });
    function handleResize() {
      chart.resize();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [data, isLoading, hasError]);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">加载中...</div>;
  }
  if (hasError) {
    return <div className="h-64 flex items-center justify-center text-red-500">加载失败</div>;
  }
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center">暂无数据</div>;
  }
  return <div ref={chartRef} className="h-64 w-full" />;
} 