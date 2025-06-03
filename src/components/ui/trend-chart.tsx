"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Product } from "data/product-list";
import dayjs from "dayjs";

interface TrendChartProps {
  pid?: number;
  products?: Product[];
  dataMap: Record<number, CommentRecord[]>;
}

interface CommentRecord {
  date: string;
  comments_total: number;
}

// 小米品牌主题
const miTheme = {
  color: [
    '#ff6900', // 小米橙
    '#333333', // 深灰
    '#bfbfbf', // 浅灰
    '#f5f5f5', // 背景灰
    '#ffb980', // 橙黄
    '#d87a80', // 红
    '#8d98b3', // 蓝灰
    '#e5cf0d', // 金黄
    '#97b552', // 绿
  ],
  backgroundColor: '#fff',
  textStyle: {
    fontFamily: 'MiSans, Arial, sans-serif',
  },
  title: {
    textStyle: {
      color: '#ff6900',
    },
    subtextStyle: {
      color: '#333',
    },
  },
};

if (typeof window !== 'undefined' && echarts && !(echarts as any).getTheme?.('mi')) {
  echarts.registerTheme('mi', miTheme);
}

// 年份主色映射
const yearColorMap: Record<number, string> = {
  2024: '#ff6900', // 橙
  2023: '#3b82f6', // 蓝
  2022: '#22c55e', // 绿
  2021: '#f59e42', // 橙黄
  2020: '#6366f1', // 靛蓝
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function TrendChart({ pid, products, dataMap }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, 'mi');
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
      // 按年份分组产品
      const productsByYear: Record<number, Product[]> = {};
      products.forEach(p => {
        if (!productsByYear[p.year]) productsByYear[p.year] = [];
        productsByYear[p.year].push(p);
      });
      // 构建柱状图 series：每个产品一个 series，stack 按年份
      products.forEach((p) => {
        const yearProducts = productsByYear[p.year];
        const idx = yearProducts.findIndex(prod => prod.id === p.id);
        // 透明度递减，最多 5 个产品，最浅 0.2
        const alpha = 0.5 - idx * 0.1 > 0.2 ? 0.5 - idx * 0.1 : 0.2;
        const color = hexToRgba(yearColorMap[p.year] || '#888', alpha);
        const dataArr = dataMap[p.id] || [];
        const dataByDate: Record<string, number> = {};
        dataArr.forEach((item) => {
          dataByDate[item.date] = item.comments_total;
        });
        series.push({
          name: p.name,
          type: 'bar',
          stack: String(p.year), // 按年份堆叠
          data: allDates.map((date) => dataByDate[date] ?? null),
          emphasis: { focus: 'series' },
          barMaxWidth: 18,
          yAxisIndex: 1, // 使用右侧 y 轴
          itemStyle: {
            color,
          },
        });
      });
      // 构建折线图 series
      series.push(
        ...products.map((p) => {
          const yearProducts = productsByYear[p.year];
          const idx = yearProducts.findIndex(prod => prod.id === p.id);
          const alpha = 1 - idx * 0.15 > 0.5 ? 1 - idx * 0.15 : 0.5;
          const color = hexToRgba(yearColorMap[p.year] || '#888', alpha);
          const dataArr = dataMap[p.id] || [];
          const dataByDate: Record<string, number> = {};
          dataArr.forEach((item) => {
            dataByDate[item.date] = item.comments_total;
          });
          legend.push(`${p.name} (${p.year})`);
          return {
            name: `${p.name} (${p.year})`,
            type: 'line',
            data: allDates.map((date) => dataByDate[date] ?? null),
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2, type: yearLineTypeMap[p.year], color },
            color,
            emphasis: { focus: 'series' },
          };
        })
      );
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
      toolbox: {
        feature: {
          dataView: { show: false },
          magicType: { show: false },
          saveAsImage: { show: true }
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          // params 是一个数组，包含所有系列在该点的数据
          const lineParams = params.filter((item: any) => item.seriesType === 'line');
          if (lineParams.length === 0) return '';
          // 构造 tooltip 内容
          let result = `${lineParams[0].axisValueLabel}<br/>`;
          lineParams.forEach((item: any) => {
            result += `
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:${item.color}"></span>
              ${item.seriesName}: ${item.value}<br/>
            `;
          });
          return result;
        }
      },
      legend: legend.length > 0 ? {
        data: legend,
        type: 'scroll',
        top: 10,
        right: 100,
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
        data: allDates.length > 0
          ? allDates
          : (dataMap[pid ?? 0]?.map((item) => item.date) ?? []),
        boundaryGap: true,
        axisLabel: {
          formatter: (value: string) => formatDateToMMDD(value),
        },
        axisPointer: {
          type: 'shadow'
        },
      },
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            formatter: formatYAxisLabel,
          },
          position: 'left',
        },
        {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            formatter: formatYAxisLabel,
          },
          position: 'right',
          splitLine: { show: false },
        }
      ],
      series,
      grid: { left: 40, right: 40, top: 60, bottom: 30 },
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
    return <div className="min-h-[240px] h-[40vw] max-h-[360px] md:h-[320px] md:min-h-[240px] md:max-h-[480px] flex items-center justify-center">暂无数据</div>;
  }
  return (
    <div
      ref={chartRef}
      className="min-h-[240px] h-[40vw] max-h-[360px] md:h-[320px] md:min-h-[240px] md:max-h-[480px] w-full"
    />
  );
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

// 辅助函数：格式化日期为 MM/DD
function formatDateToMMDD(dateStr: string): string {
  const d = dayjs(dateStr);
  if (!d.isValid()) return dateStr;
  return d.format("MM/DD");
} 