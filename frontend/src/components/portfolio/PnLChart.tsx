import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { usePortfolioStore } from "../../store/portfolio.store";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const PnLChart: React.FC = () => {
  const { equityCurve } = usePortfolioStore();

  const chartData = useMemo(() => {
    const labels = equityCurve.map((point) =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(point.timestamp),
    );

    const equityData = equityCurve.map((point) => point.equity);
    const balanceData = equityCurve.map((point) => point.balance);

    return {
      labels,
      datasets: [
        {
          label: "Total Equity",
          data: equityData,
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: "Cash Balance",
          data: balanceData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [equityCurve]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#333333",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return `${context.dataset.label}: $0.00`;
            return `${context.dataset.label}: $${value.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Value ($)",
        },
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          callback: (value) => {
            return `$${Number(value).toLocaleString()}`;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 2,
      },
    },
  };

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (equityCurve.length < 2) return null;

    const firstEquity = equityCurve[0].equity;
    const lastEquity = equityCurve[equityCurve.length - 1].equity;
    const totalReturn = ((lastEquity - firstEquity) / firstEquity) * 100;

    const peak = Math.max(...equityCurve.map((p) => p.equity));
    const currentDrawdown = ((peak - lastEquity) / peak) * 100;

    return {
      totalReturn,
      currentDrawdown,
      peak,
      current: lastEquity,
    };
  }, [equityCurve]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Chart
        </h3>
        {performanceMetrics && (
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Return</div>
              <div
                className={`font-semibold ${
                  performanceMetrics.totalReturn >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {performanceMetrics.totalReturn >= 0 ? "+" : ""}
                {performanceMetrics.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Current Drawdown</div>
              <div
                className={`font-semibold ${
                  performanceMetrics.currentDrawdown <= 5
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                -{performanceMetrics.currentDrawdown.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Starting Equity:</span>
          <span className="font-medium">
            ${equityCurve[0]?.equity.toLocaleString() || "0"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Equity:</span>
          <span className="font-medium">
            $
            {equityCurve[equityCurve.length - 1]?.equity.toLocaleString() ||
              "0"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PnLChart;
