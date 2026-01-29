import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTradingStore } from "../../store/trading.store";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  ColorType,
  CrosshairMode,
  PriceScaleMode,
  Time,
} from "lightweight-charts";

export type ChartType = "candlestick" | "line";
export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1d";

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingChartProps {
  width?: number;
  height?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ width, height = 400 }) => {
  const { selectedAsset, chartType, timeframe, setChartType, setTimeframe } =
    useTradingStore();
  const [containerWidth, setContainerWidth] = useState(width || 800);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Handle responsive sizing
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerWidth(width);
      }
    });

    resizeObserver.observe(chartContainerRef.current);
    resizeObserverRef.current = resizeObserver;

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Update chart size when container resizes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        width: containerWidth,
        height,
      });
    }
  }, [containerWidth, height]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data based on timeframe
  const generateMockData = useCallback(
    (timeframe: Timeframe, count: number = 100): ChartData[] => {
      const now = Math.floor(Date.now() / 1000);
      const intervalSeconds = {
        "1m": 60,
        "5m": 300,
        "15m": 900,
        "1h": 3600,
        "1d": 86400,
      }[timeframe];

      const data: ChartData[] = [];
      let currentPrice = 45000; // Starting price for BTC

      for (let i = count; i >= 0; i--) {
        const time = now - i * intervalSeconds;
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * 2 * volatility;

        const open = currentPrice;
        const close = open * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);

        data.push({
          time,
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 1000000) + 100000,
        });

        currentPrice = close;
      }

      return data;
    },
    [],
  );

  // Calculate Moving Average
  const calculateMA = useCallback(
    (data: ChartData[], period: number): LineData[] => {
      const ma: LineData[] = [];

      for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += data[j].close;
        }
        ma.push({
          time: data[i].time as Time,
          value: sum / period,
        });
      }

      return ma;
    },
    [],
  );

  // Calculate RSI
  const calculateRSI = useCallback(
    (data: ChartData[], period: number = 14): LineData[] => {
      const rsi: LineData[] = [];
      const gains: number[] = [];
      const losses: number[] = [];

      // Calculate price changes
      for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      for (let i = period - 1; i < gains.length; i++) {
        let avgGain = 0;
        let avgLoss = 0;

        // Calculate initial averages
        if (i === period - 1) {
          for (let j = 0; j < period; j++) {
            avgGain += gains[j];
            avgLoss += losses[j];
          }
          avgGain /= period;
          avgLoss /= period;
        } else {
          // Smooth averages
          avgGain = (rsi[i - period].value * (period - 1) + gains[i]) / period;
          avgLoss = (rsi[i - period].value * (period - 1) + losses[i]) / period;
        }

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsiValue = 100 - 100 / (1 + rs);

        rsi.push({
          time: data[i + 1].time as Time,
          value: rsiValue,
        });
      }

      return rsi;
    },
    [],
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#333333",
      },
      grid: {
        vertLines: { color: "#e1e1e1" },
        horzLines: { color: "#e1e1e1" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        mode: PriceScaleMode.Normal,
        borderColor: "#cccccc",
      },
      timeScale: {
        borderColor: "#cccccc",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerWidth,
      height,
    });

    chartRef.current = chart;

    // Create series based on chart type
    if (chartType === "candlestick") {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chart.addLineSeries({
        color: "#2196F3",
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;
    }

    // Add MA indicators
    const ma20Series = chart.addLineSeries({
      color: "#FF6B35",
      lineWidth: 1,
      title: "MA(20)",
    });
    ma20SeriesRef.current = ma20Series;

    const ma50Series = chart.addLineSeries({
      color: "#4CAF50",
      lineWidth: 1,
      title: "MA(50)",
    });
    ma50SeriesRef.current = ma50Series;

    // Add RSI indicator
    const rsiSeries = chart.addLineSeries({
      color: "#9C27B0",
      lineWidth: 1,
      title: "RSI(14)",
      priceScaleId: "rsi",
    });
    rsiSeriesRef.current = rsiSeries;

    // Configure RSI price scale
    chart.priceScale("rsi").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartType, width, height]);

  // Update data when symbol or timeframe changes
  useEffect(() => {
    if (!chartRef.current) return;

    setIsLoading(true);

    // Generate mock data
    const data = generateMockData(timeframe);

    // Update main series
    if (chartType === "candlestick" && candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(data as CandlestickData[]);
    } else if (chartType === "line" && lineSeriesRef.current) {
      const lineData: LineData[] = data.map((d) => ({
        time: d.time as Time,
        value: d.close,
      }));
      lineSeriesRef.current.setData(lineData);
    }

    // Update MA indicators
    if (ma20SeriesRef.current) {
      const ma20Data = calculateMA(data, 20);
      ma20SeriesRef.current.setData(ma20Data);
    }

    if (ma50SeriesRef.current) {
      const ma50Data = calculateMA(data, 50);
      ma50SeriesRef.current.setData(ma50Data);
    }

    // Update RSI indicator
    if (rsiSeriesRef.current) {
      const rsiData = calculateRSI(data, 14);
      rsiSeriesRef.current.setData(rsiData);
    }

    // Fit content to show all data
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
      setIsLoading(false);
    }, 100);
  }, [
    selectedAsset?.symbol,
    timeframe,
    chartType,
    generateMockData,
    calculateMA,
    calculateRSI,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  };

  // Handle chart type change
  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType);
  };

  // Timeframe buttons
  const timeframes: Timeframe[] = ["1m", "5m", "15m", "1h", "1d"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedAsset?.symbol || "BTC"} Chart
          </h3>

          {/* Chart Type Toggle */}
          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => handleChartTypeChange("candlestick")}
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                chartType === "candlestick"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => handleChartTypeChange("line")}
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                chartType === "line"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1 text-sm font-medium rounded ${
                timeframe === tf
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        )}
        <div
          ref={chartContainerRef}
          className="w-full border border-gray-200 rounded"
          style={{ height: `${height}px` }}
        />
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-gray-600">MA(20)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-gray-600">MA(50)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-purple-500"></div>
          <span className="text-gray-600">RSI(14)</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
