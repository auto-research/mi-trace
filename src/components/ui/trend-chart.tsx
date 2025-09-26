"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Product } from "data/product-list";
import dayjs from "dayjs";

interface TrendChartProps {
  products: Product[];
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

if (typeof window !== 'undefined' && echarts) {
  try {
    echarts.registerTheme('mi', miTheme);
  } catch (error) {
    // Theme might already be registered, ignore error
  }
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

export function TrendChart({ products, dataMap }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, 'mi');
    // 计算所有产品的周数横坐标
    // 1. 找到所有产品的所有周数（如第1周、第2周...）
    const weekLabelSet = new Set<string>();
    const productWeekMap: Record<number, Record<string, number>> = {};
    products.forEach((p) => {
      const release = dayjs(p.releaseDate);
      const arr = dataMap[p.id] || [];
      productWeekMap[p.id] = {};
      arr.forEach((item) => {
        const d = dayjs(item.date);
        // 计算第几周（首日为第1周）
        const week = Math.floor(d.diff(release, 'day') / 7) + 1;
        if (week >= 1) {
          const label = `第${week}周`;
          weekLabelSet.add(label);
          productWeekMap[p.id][label] = item.comments_total;
        }
      });
    });
    const allWeeks = Array.from(weekLabelSet).sort((a, b) => {
      // 提取数字排序
      return parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''));
    });
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
        if (year === 2025) {
          yearLineTypeMap[year] = 'solid';
        } else if (year === 2024) {
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
        // series.push({
        //   name: p.name,
        //   type: 'bar',
        //   stack: String(p.year), // 按年份堆叠
        //   data: allDates.map((date) => dataByDate[date] ?? null),
        //   emphasis: { focus: 'series' },
        //   barMaxWidth: 10,
        //   yAxisIndex: 1, // 使用右侧 y 轴
        //   itemStyle: {
        //     color,
        //   },
        // });
      });
      // 构建折线图 series
      series.push(
        ...products.map((p) => {
          const yearProducts = productsByYear[p.year];
          const idx = yearProducts.findIndex(prod => prod.id === p.id);
          const alpha = 1 - idx * 0.15 > 0.5 ? 1 - idx * 0.15 : 0.5;
          const color = hexToRgba(yearColorMap[p.year] || '#888', alpha);
          legend.push(p.name);
          return {
            name: p.name,
            type: 'line',
            data: allWeeks.map((week) => {
              const v = productWeekMap[p.id][week] ?? 0;
              return v === 0 ? null : v;
            }),
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 1, type: yearLineTypeMap[p.year], color },
            color,
            emphasis: { focus: 'series' },
            endLabel: {
              show: true,
              distance: 0,
              color: 'inherit',
              offset: [-50, -10],
              formatter: (params: any) => {
                return `${params.seriesName}`;
              }
            }
          };
        })
      );
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
          const lineParams = params.filter((item: any) => item.seriesType === 'line');
          if (lineParams.length === 0) return '';
          let result = `${lineParams[0].axisValueLabel}<br/>`;
          lineParams.forEach((item: any) => {
            const value = (item.value === undefined || item.value === null) ? 0 : item.value;
            result += `\n<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:${item.color}"></span>\n              ${item.seriesName}: ${formatNumberWithCommas(value)}<br/>\n            `;
          });
          return result;
        }
      },
      legend: legend.length > 0 ? {
        data: legend,
        type: 'scroll',
        top: 10,
        right: 40,
        align: 'left',
        icon: 'circle',
        itemHeight: 8,
        itemWidth: 8,
        textStyle: {
          fontSize: 12,
          padding: [0, 8, 0, 0],
        },
      } : undefined,
      xAxis: {
        type: 'category',
        data: allWeeks,
        boundaryGap: true,
        axisLabel: {
          formatter: (value: string) => value,
        },
        axisPointer: {
          type: 'shadow'
        },
      },
      yAxis: [
        {
          type: 'value',
          // name: '型号',
          minInterval: 1,
          axisLabel: {
            formatter: formatYAxisLabel,
          },
          position: 'left',
        },
        // {
        //   type: 'value',
        //   name: '年款累计',
        //   minInterval: 1,
        //   axisLabel: {
        //     formatter: formatYAxisLabel,
        //   },
        //   position: 'right',
        //   splitLine: { show: false },
        // }
      ],
      series,
      grid: { left: 40, right: 30, top: 60, bottom: 30 },
      // dataZoom: [
      //   {
      //     type: 'slider',
      //     show: true,
      //     xAxisIndex: 0,
      //     start: 0,
      //     end: 100,
      //     height: 24,
      //     bottom: 0,
      //     handleSize: '80%',
      //     showDetail: false,
      //     brushSelect: false,
      //   },
      //   {
      //     type: 'inside',
      //     xAxisIndex: 0,
      //     start: 0,
      //     end: 100,
      //   }
      // ],
    });
    function handleResize() {
      chart.resize();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [dataMap, products]);

  const hasData = products.some(p => (dataMap[p.id]?.length ?? 0) > 0);
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

// 千分位分隔
function formatNumberWithCommas(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  if (!isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US');
  }
  return value;
} 
