import {
  TradingCalculations,
  Trade,
  Portfolio,
} from "../../src/utils/tradingCalculations";

describe("TradingCalculations", () => {
  describe("validateTrade", () => {
    const mockPortfolio: Portfolio = {
      equity: 10000,
      used_margin: 2000,
      leverage: 10,
    };

    it("should validate a valid trade", () => {
      const result = TradingCalculations.validateTrade(
        "AAPL",
        "buy",
        100,
        150,
        mockPortfolio,
      );

      expect(result.valid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe("Trade validated successfully");
    });

    it("should reject trade with insufficient funds", () => {
      const smallPortfolio: Portfolio = {
        equity: 100,
        used_margin: 50,
        leverage: 10,
      };

      const result = TradingCalculations.validateTrade(
        "AAPL",
        "buy",
        100,
        150,
        smallPortfolio,
      );

      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Insufficient funds");
    });

    it("should reject trade that would cause low margin level", () => {
      const highLeveragePortfolio: Portfolio = {
        equity: 1000,
        used_margin: 4986,
        leverage: 100,
      };

      const result = TradingCalculations.validateTrade(
        "AAPL",
        "buy",
        10,
        150,
        highLeveragePortfolio,
      );

      expect(result.valid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("dangerously low margin level");
    });

    it("should handle calculation errors gracefully", () => {
      // Create a portfolio object that will cause property access errors
      const invalidPortfolio = null as any;

      const result = TradingCalculations.validateTrade(
        "AAPL",
        "buy",
        100,
        150,
        invalidPortfolio,
      );

      expect(result.valid).toBe(false);
      expect(result.status).toBe(500);
      expect(result.message).toBe("Failed to validate trade");
    });
  });

  describe("calculatePerformanceChart", () => {
    it("should calculate performance chart with no trades", () => {
      const result = TradingCalculations.calculatePerformanceChart([], 10000);

      expect(result).toHaveLength(1);
      expect(result[0].equity).toBe(10000);
      expect(result[0].timestamp).toContain("2024-01-01");
    });

    it("should calculate performance chart with trades", () => {
      const trades: Trade[] = [
        {
          timestamp: "2024-01-02T10:00:00Z",
          realized_pnl: 500,
          commission: 5,
        },
        {
          timestamp: "2024-01-03T10:00:00Z",
          realized_pnl: -200,
          commission: 3,
        },
        {
          timestamp: "2024-01-04T10:00:00Z",
          realized_pnl: 300,
          commission: 4,
        },
      ];

      const result = TradingCalculations.calculatePerformanceChart(
        trades,
        10000,
      );

      expect(result).toHaveLength(4); // Initial + 3 trades
      expect(result[0].equity).toBe(10000);
      expect(result[1].equity).toBe(10495); // 10000 + 500 - 5
      expect(result[2].equity).toBe(10292); // 10495 - 200 - 3
      expect(result[3].equity).toBe(10588); // 10292 + 300 - 4
    });

    it("should sort trades by timestamp", () => {
      const trades: Trade[] = [
        {
          timestamp: "2024-01-04T10:00:00Z",
          realized_pnl: 300,
          commission: 4,
        },
        {
          timestamp: "2024-01-02T10:00:00Z",
          realized_pnl: 500,
          commission: 5,
        },
        {
          timestamp: "2024-01-03T10:00:00Z",
          realized_pnl: -200,
          commission: 3,
        },
      ];

      const result = TradingCalculations.calculatePerformanceChart(
        trades,
        10000,
      );

      expect(result).toHaveLength(4);
      expect(result[1].timestamp).toBe("2024-01-02T10:00:00Z");
      expect(result[2].timestamp).toBe("2024-01-03T10:00:00Z");
      expect(result[3].timestamp).toBe("2024-01-04T10:00:00Z");
    });
  });

  describe("calculatePortfolioMetrics", () => {
    it("should return zero metrics for empty trades", () => {
      const result = TradingCalculations.calculatePortfolioMetrics([]);

      expect(result.totalTrades).toBe(0);
      expect(result.winningTrades).toBe(0);
      expect(result.losingTrades).toBe(0);
      expect(result.winRate).toBe(0);
      expect(result.averageProfit).toBe(0);
      expect(result.averageLoss).toBe(0);
      expect(result.profitFactor).toBe(0);
      expect(result.totalRealizedPL).toBe(0);
      expect(result.totalCommission).toBe(0);
      expect(result.netPL).toBe(0);
    });

    it("should calculate metrics for mixed trades", () => {
      const trades: Trade[] = [
        { timestamp: "2024-01-01", realized_pnl: 100, commission: 2 },
        { timestamp: "2024-01-02", realized_pnl: -50, commission: 1 },
        { timestamp: "2024-01-03", realized_pnl: 75, commission: 1.5 },
        { timestamp: "2024-01-04", realized_pnl: -25, commission: 0.5 },
        { timestamp: "2024-01-05", realized_pnl: 200, commission: 3 },
      ];

      const result = TradingCalculations.calculatePortfolioMetrics(trades);

      expect(result.totalTrades).toBe(5);
      expect(result.winningTrades).toBe(3);
      expect(result.losingTrades).toBe(2);
      expect(result.winRate).toBe(60);
      expect(result.averageProfit).toBe((100 + 75 + 200) / 3); // 125
      expect(result.averageLoss).toBe(Math.abs((-50 - 25) / 2)); // 37.5
      expect(result.profitFactor).toBeCloseTo(125 / 37.5, 2); // ~3.33
      expect(result.totalRealizedPL).toBe(300);
      expect(result.totalCommission).toBe(8);
      expect(result.netPL).toBe(292);
    });

    it("should handle only winning trades", () => {
      const trades: Trade[] = [
        { timestamp: "2024-01-01", realized_pnl: 100, commission: 2 },
        { timestamp: "2024-01-02", realized_pnl: 200, commission: 3 },
      ];

      const result = TradingCalculations.calculatePortfolioMetrics(trades);

      expect(result.totalTrades).toBe(2);
      expect(result.winningTrades).toBe(2);
      expect(result.losingTrades).toBe(0);
      expect(result.winRate).toBe(100);
      expect(result.averageProfit).toBe(150);
      expect(result.averageLoss).toBe(0);
      expect(result.profitFactor).toBe(0); // Division by zero
    });

    it("should handle only losing trades", () => {
      const trades: Trade[] = [
        { timestamp: "2024-01-01", realized_pnl: -100, commission: 2 },
        { timestamp: "2024-01-02", realized_pnl: -200, commission: 3 },
      ];

      const result = TradingCalculations.calculatePortfolioMetrics(trades);

      expect(result.totalTrades).toBe(2);
      expect(result.winningTrades).toBe(0);
      expect(result.losingTrades).toBe(2);
      expect(result.winRate).toBe(0);
      expect(result.averageProfit).toBe(0);
      expect(result.averageLoss).toBe(150);
      expect(result.profitFactor).toBe(0); // Division by zero
    });
  });

  describe("calculateDailyPL", () => {
    it("should calculate daily P&L breakdown", () => {
      const trades: Trade[] = [
        { timestamp: "2024-01-01T10:00:00Z", realized_pnl: 100, commission: 2 },
        { timestamp: "2024-01-01T14:00:00Z", realized_pnl: -50, commission: 1 },
        {
          timestamp: "2024-01-02T10:00:00Z",
          realized_pnl: 75,
          commission: 1.5,
        },
        {
          timestamp: "2024-01-02T16:00:00Z",
          realized_pnl: 25,
          commission: 0.5,
        },
      ];

      const result = TradingCalculations.calculateDailyPL(trades);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2024-01-01");
      expect(result[0].realizedPL).toBe(50); // 100 - 50
      expect(result[0].commission).toBe(3); // 2 + 1
      expect(result[0].netPL).toBe(47); // 50 - 3
      expect(result[0].tradeCount).toBe(2);

      expect(result[1].date).toBe("2024-01-02");
      expect(result[1].realizedPL).toBe(100); // 75 + 25
      expect(result[1].commission).toBe(2); // 1.5 + 0.5
      expect(result[1].netPL).toBe(98); // 100 - 2
      expect(result[1].tradeCount).toBe(2);
    });

    it("should return empty array for no trades", () => {
      const result = TradingCalculations.calculateDailyPL([]);

      expect(result).toHaveLength(0);
    });

    it("should sort results by date", () => {
      const trades: Trade[] = [
        { timestamp: "2024-01-03T10:00:00Z", realized_pnl: 100, commission: 2 },
        { timestamp: "2024-01-01T10:00:00Z", realized_pnl: 50, commission: 1 },
        {
          timestamp: "2024-01-02T10:00:00Z",
          realized_pnl: 75,
          commission: 1.5,
        },
      ];

      const result = TradingCalculations.calculateDailyPL(trades);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe("2024-01-01");
      expect(result[1].date).toBe("2024-01-02");
      expect(result[2].date).toBe("2024-01-03");
    });
  });

  describe("calculatePositionMetrics", () => {
    it("should calculate position metrics for profitable position", () => {
      const result = TradingCalculations.calculatePositionMetrics(
        100,
        150,
        160,
      );

      expect(result.unrealizedPnL).toBe(1000); // (160 - 150) * 100
      expect(result.pnlPercentage).toBeCloseTo(6.67, 2); // 1000 / 15000 * 100
      expect(result.marketValue).toBe(16000); // 100 * 160
    });

    it("should calculate position metrics for losing position", () => {
      const result = TradingCalculations.calculatePositionMetrics(50, 200, 180);

      expect(result.unrealizedPnL).toBe(-1000); // (180 - 200) * 50
      expect(result.pnlPercentage).toBeCloseTo(-10, 2); // -1000 / 10000 * 100
      expect(result.marketValue).toBe(9000); // 50 * 180
    });

    it("should handle zero cost basis", () => {
      const result = TradingCalculations.calculatePositionMetrics(100, 0, 150);

      expect(result.unrealizedPnL).toBe(15000);
      expect(result.pnlPercentage).toBe(0); // Avoid division by zero
      expect(result.marketValue).toBe(15000);
    });
  });

  describe("calculatePortfolioSummary", () => {
    it("should calculate portfolio summary", () => {
      const positions = [
        { quantity: 100, averagePrice: 150, currentPrice: 160 }, // +1000 P&L
        { quantity: 50, averagePrice: 200, currentPrice: 180 }, // -1000 P&L
      ];
      const cashBalance = 5000;

      const result = TradingCalculations.calculatePortfolioSummary(
        positions,
        cashBalance,
      );

      expect(result.totalValue).toBe(30000); // 5000 + 16000 + 9000
      expect(result.investedValue).toBe(25000); // 100*150 + 50*200
      expect(result.totalUnrealizedPnL).toBe(0); // +1000 - 1000
      expect(result.totalPnlPercentage).toBe(0); // 0 / 25000 * 100
    });

    it("should handle empty positions", () => {
      const result = TradingCalculations.calculatePortfolioSummary([], 10000);

      expect(result.totalValue).toBe(10000);
      expect(result.investedValue).toBe(0);
      expect(result.totalUnrealizedPnL).toBe(0);
      expect(result.totalPnlPercentage).toBe(0);
    });
  });

  describe("validateOrderParams", () => {
    it("should validate correct order parameters", () => {
      const result = TradingCalculations.validateOrderParams(
        "AAPL",
        "buy",
        100,
        150,
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate market order parameters", () => {
      const result = TradingCalculations.validateOrderParams(
        "AAPL",
        "sell",
        50,
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid symbol", () => {
      const result = TradingCalculations.validateOrderParams("", "buy", 100);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Symbol is required and must be a non-empty string",
      );
    });

    it("should reject invalid side", () => {
      const result = TradingCalculations.validateOrderParams(
        "AAPL",
        "hold",
        100,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Side must be either "buy" or "sell"');
    });

    it("should reject invalid quantity", () => {
      let result = TradingCalculations.validateOrderParams("AAPL", "buy", 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Quantity must be a positive number");

      result = TradingCalculations.validateOrderParams("AAPL", "buy", -10);
      expect(result.valid).toBe(false);

      result = TradingCalculations.validateOrderParams("AAPL", "buy", NaN);
      expect(result.valid).toBe(false);
    });

    it("should reject invalid price", () => {
      const result = TradingCalculations.validateOrderParams(
        "AAPL",
        "buy",
        100,
        -50,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Price must be a positive number if provided",
      );
    });

    it("should accumulate multiple errors", () => {
      const result = TradingCalculations.validateOrderParams(
        "",
        "invalid",
        -5,
        -10,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });

  describe("calculateCommission", () => {
    it("should calculate commission with default rate", () => {
      const result = TradingCalculations.calculateCommission(10000);

      expect(result).toBe(10); // 10000 * 0.001
    });

    it("should calculate commission with custom rate", () => {
      const result = TradingCalculations.calculateCommission(10000, 0.002);

      expect(result).toBe(20); // 10000 * 0.002
    });

    it("should enforce minimum commission", () => {
      const result = TradingCalculations.calculateCommission(1, 0.001);

      expect(result).toBe(0.01); // Minimum commission
    });
  });

  describe("calculateMarginRequirements", () => {
    it("should calculate margin requirements", () => {
      const result = TradingCalculations.calculateMarginRequirements(10000, 10);

      expect(result.requiredMargin).toBe(1000); // 10000 / 10
      expect(result.maintenanceMargin).toBe(2500); // 10000 * 0.25
      expect(result.positionSize).toBe(10000);
      expect(result.liquidationPrice).toBeDefined();
    });

    it("should calculate with custom maintenance margin", () => {
      const result = TradingCalculations.calculateMarginRequirements(
        10000,
        5,
        0.3,
      );

      expect(result.requiredMargin).toBe(2000); // 10000 / 5
      expect(result.maintenanceMargin).toBe(3000); // 10000 * 0.3
    });
  });
});
