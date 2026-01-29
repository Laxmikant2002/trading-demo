export interface Trade {
  timestamp: string;
  realized_pnl: number;
  commission: number;
  symbol?: string;
  side?: string;
  quantity?: number;
  price?: number;
}

export interface Portfolio {
  equity: number;
  used_margin: number;
  leverage: number;
}

export interface TradeValidation {
  valid: boolean;
  status: number;
  message: string;
}

export interface PortfolioMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  totalRealizedPL: number;
  totalCommission: number;
  netPL: number;
}

export interface DailyPL {
  date: string;
  realizedPL: number;
  commission: number;
  netPL: number;
  tradeCount: number;
}

export class TradingCalculations {
  /**
   * Validates if a trade can be executed based on available margin and risk management
   */
  static validateTrade(
    symbol: string,
    side: string,
    quantity: number,
    price: number,
    portfolio: Portfolio,
  ): TradeValidation {
    try {
      const tradeValue = quantity * price;
      const requiredMargin = tradeValue / portfolio.leverage;

      // Check if user has sufficient margin
      if (portfolio.equity < requiredMargin) {
        return {
          valid: false,
          status: 400,
          message: `Insufficient funds. Required margin: $${requiredMargin.toFixed(2)}, Available equity: $${portfolio.equity.toFixed(2)}`,
        };
      }

      // Check margin level after trade
      const newUsedMargin = portfolio.used_margin + requiredMargin;
      const estimatedMarginLevel = (portfolio.equity / newUsedMargin) * 100;

      if (estimatedMarginLevel < 20) {
        // Conservative check
        return {
          valid: false,
          status: 400,
          message: `Trade would result in dangerously low margin level: ${estimatedMarginLevel.toFixed(2)}%`,
        };
      }

      return {
        valid: true,
        status: 200,
        message: "Trade validated successfully",
      };
    } catch (error) {
      console.error("Error validating trade:", error);
      return {
        valid: false,
        status: 500,
        message: "Failed to validate trade",
      };
    }
  }

  /**
   * Calculates performance chart data from trades
   */
  static calculatePerformanceChart(
    trades: Trade[],
    initialBalance: number,
  ): Array<{ timestamp: string; equity: number }> {
    let equity = initialBalance;
    const chartData = [
      {
        timestamp: new Date("2024-01-01").toISOString(),
        equity: initialBalance,
      },
    ];

    // Sort trades by timestamp
    const sortedTrades = [...trades].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (const trade of sortedTrades) {
      equity += trade.realized_pnl - trade.commission;
      chartData.push({
        timestamp: trade.timestamp,
        equity: equity,
      });
    }

    return chartData;
  }

  /**
   * Calculates comprehensive portfolio metrics
   */
  static calculatePortfolioMetrics(trades: Trade[]): PortfolioMetrics {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageProfit: 0,
        averageLoss: 0,
        profitFactor: 0,
        totalRealizedPL: 0,
        totalCommission: 0,
        netPL: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.realized_pnl > 0);
    const losingTrades = trades.filter((t) => t.realized_pnl < 0);

    const totalRealizedPL = trades.reduce((sum, t) => sum + t.realized_pnl, 0);
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
    const netPL = totalRealizedPL - totalCommission;

    const averageProfit =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.realized_pnl, 0) /
          winningTrades.length
        : 0;

    const averageLoss =
      losingTrades.length > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + t.realized_pnl, 0) /
              losingTrades.length,
          )
        : 0;

    const profitFactor = averageLoss > 0 ? averageProfit / averageLoss : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      averageProfit: averageProfit,
      averageLoss: averageLoss,
      profitFactor: profitFactor,
      totalRealizedPL: totalRealizedPL,
      totalCommission: totalCommission,
      netPL: netPL,
    };
  }

  /**
   * Calculates daily P&L breakdown
   */
  static calculateDailyPL(trades: Trade[]): DailyPL[] {
    const dailyMap = new Map<
      string,
      {
        date: string;
        realizedPL: number;
        commission: number;
        netPL: number;
        tradeCount: number;
      }
    >();

    for (const trade of trades) {
      const date = new Date(trade.timestamp).toISOString().split("T")[0];
      const existing = dailyMap.get(date) || {
        date,
        realizedPL: 0,
        commission: 0,
        netPL: 0,
        tradeCount: 0,
      };

      existing.realizedPL += trade.realized_pnl;
      existing.commission += trade.commission;
      existing.netPL += trade.realized_pnl - trade.commission;
      existing.tradeCount += 1;

      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  /**
   * Calculates position metrics (unrealized P&L, etc.)
   */
  static calculatePositionMetrics(
    quantity: number,
    averagePrice: number,
    currentPrice: number,
  ): {
    unrealizedPnL: number;
    pnlPercentage: number;
    marketValue: number;
  } {
    const marketValue = quantity * currentPrice;
    const costBasis = quantity * averagePrice;
    const unrealizedPnL = marketValue - costBasis;
    const pnlPercentage =
      costBasis !== 0 ? (unrealizedPnL / costBasis) * 100 : 0;

    return {
      unrealizedPnL,
      pnlPercentage,
      marketValue,
    };
  }

  /**
   * Calculates portfolio summary metrics
   */
  static calculatePortfolioSummary(
    positions: Array<{
      quantity: number;
      averagePrice: number;
      currentPrice: number;
    }>,
    cashBalance: number,
  ): {
    totalValue: number;
    investedValue: number;
    totalUnrealizedPnL: number;
    totalPnlPercentage: number;
  } {
    let totalValue = cashBalance;
    let investedValue = 0;
    let totalUnrealizedPnL = 0;

    for (const position of positions) {
      const metrics = this.calculatePositionMetrics(
        position.quantity,
        position.averagePrice,
        position.currentPrice,
      );

      totalValue += metrics.marketValue;
      investedValue += position.quantity * position.averagePrice;
      totalUnrealizedPnL += metrics.unrealizedPnL;
    }

    const totalPnlPercentage =
      investedValue !== 0 ? (totalUnrealizedPnL / investedValue) * 100 : 0;

    return {
      totalValue,
      investedValue,
      totalUnrealizedPnL,
      totalPnlPercentage,
    };
  }

  /**
   * Validates order parameters
   */
  static validateOrderParams(
    symbol: string,
    side: string,
    quantity: number,
    price?: number,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!symbol || typeof symbol !== "string" || symbol.trim().length === 0) {
      errors.push("Symbol is required and must be a non-empty string");
    }

    if (!["buy", "sell"].includes(side)) {
      errors.push('Side must be either "buy" or "sell"');
    }

    if (!quantity || quantity <= 0 || !Number.isFinite(quantity)) {
      errors.push("Quantity must be a positive number");
    }

    if (price !== undefined && (price <= 0 || !Number.isFinite(price))) {
      errors.push("Price must be a positive number if provided");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculates commission based on trade value
   */
  static calculateCommission(
    tradeValue: number,
    commissionRate: number = 0.001,
  ): number {
    return Math.max(tradeValue * commissionRate, 0.01); // Minimum $0.01 commission
  }

  /**
   * Calculates margin requirements
   */
  static calculateMarginRequirements(
    tradeValue: number,
    leverage: number,
    maintenanceMargin: number = 0.25,
  ): {
    requiredMargin: number;
    maintenanceMargin: number;
    liquidationPrice: number;
    positionSize: number;
  } {
    const positionSize = tradeValue;
    const requiredMargin = positionSize / leverage;
    const maintMargin = positionSize * maintenanceMargin;

    // For simplicity, assuming long position liquidation calculation
    const liquidationPrice =
      (requiredMargin / (positionSize / tradeValue)) * (1 - maintenanceMargin);

    return {
      requiredMargin,
      maintenanceMargin: maintMargin,
      liquidationPrice,
      positionSize,
    };
  }
}
