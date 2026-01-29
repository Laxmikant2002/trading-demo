import Notification, { INotification } from "../models/Notification";
import User, { IUser } from "../models/User";
import { sendEmail } from "../utils/email";
// import { io } from "../app";
import { Op } from "sequelize";

export interface NotificationData {
  userId: number;
  type:
    | "trade_confirmation"
    | "balance_alert"
    | "price_alert"
    | "margin_call"
    | "system";
  title: string;
  message: string;
  data?: any;
  channels?: ("in_app" | "email" | "sms" | "push")[];
}

export interface NotificationPreferences {
  tradeConfirmations: { inApp: boolean; email: boolean };
  balanceAlerts: { inApp: boolean; email: boolean };
  priceAlerts: { inApp: boolean; email: boolean };
  marginCalls: { inApp: boolean; email: boolean };
  systemNotifications: { inApp: boolean; email: boolean };
}

export class NotificationService {
  // Create and send a notification
  static async createNotification(
    notificationData: NotificationData,
  ): Promise<INotification | null> {
    try {
      const { userId, type, title, message, data, channels } = notificationData;

      // Get user and their preferences
      const user = await User.findByPk(userId);
      if (!user) {
        console.error(`User ${userId} not found for notification`);
        return null;
      }

      // Determine which channels to use based on user preferences
      const userPrefs = user.notificationPreferences as NotificationPreferences;
      const effectiveChannels =
        channels || this.getPreferredChannels(type, userPrefs);

      // Create notification record
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        channels: effectiveChannels,
        sentAt: new Date(),
      });

      // Send through each channel
      await this.sendThroughChannels(notification, user);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  // Send notification through specified channels
  private static async sendThroughChannels(
    notification: INotification,
    user: IUser,
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of notification.channels) {
      switch (channel) {
        case "in_app":
          promises.push(this.sendInAppNotification(notification, user));
          break;
        case "email":
          promises.push(this.sendEmailNotification(notification, user));
          break;
        case "sms":
          promises.push(this.sendSMSNotification(notification, user));
          break;
        case "push":
          promises.push(this.sendPushNotification(notification, user));
          break;
      }
    }

    await Promise.all(promises);
  }

  // Send in-app notification via WebSocket
  private static async sendInAppNotification(
    notification: INotification,
    user: IUser,
  ): Promise<void> {
    try {
      // Temporarily disabled to fix import issues
      // io.to(`notifications-${user.id}`).emit('notification', {
      //   id: notification.id,
      //   type: notification.type,
      //   title: notification.title,
      //   message: notification.message,
      //   data: notification.data,
      //   timestamp: notification.createdAt,
      // });
      console.log(
        `In-app notification to user ${user.id}: ${notification.title}`,
      );
    } catch (error) {
      console.error("Error sending in-app notification:", error);
    }
  }

  // Send email notification
  private static async sendEmailNotification(
    notification: INotification,
    user: IUser,
  ): Promise<void> {
    try {
      let htmlContent = this.generateEmailContent(notification);

      await sendEmail({
        to: user.email,
        subject: notification.title,
        html: htmlContent,
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  // Send SMS notification (placeholder for future implementation)
  private static async sendSMSNotification(
    notification: INotification,
    user: IUser,
  ): Promise<void> {
    // TODO: Implement SMS sending (Twilio, AWS SNS, etc.)
    console.log(
      `SMS notification would be sent to user ${user.id}: ${notification.message}`,
    );
  }

  // Send push notification (placeholder for future implementation)
  private static async sendPushNotification(
    notification: INotification,
    user: IUser,
  ): Promise<void> {
    // TODO: Implement push notifications (Firebase, OneSignal, etc.)
    console.log(
      `Push notification would be sent to user ${user.id}: ${notification.message}`,
    );
  }

  // Generate HTML content for email notifications
  private static generateEmailContent(notification: INotification): string {
    const baseStyles = `
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    const headerStyles = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    `;

    const contentStyles = `
      padding: 30px 20px;
      color: #333;
      line-height: 1.6;
    `;

    const footerStyles = `
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    `;

    let contentSection = `<p>${notification.message}</p>`;

    // Add specific content based on notification type
    if (notification.data) {
      switch (notification.type) {
        case "trade_confirmation":
          contentSection = this.generateTradeConfirmationContent(
            notification.data,
          );
          break;
        case "balance_alert":
          contentSection = this.generateBalanceAlertContent(notification.data);
          break;
        case "margin_call":
          contentSection = this.generateMarginCallContent(notification.data);
          break;
        case "price_alert":
          contentSection = this.generatePriceAlertContent(notification.data);
          break;
      }
    }

    return `
      <div style="${baseStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">${notification.title}</h1>
        </div>
        <div style="${contentStyles}">
          ${contentSection}
        </div>
        <div style="${footerStyles}">
          <p>This is an automated notification from XPro Trading.</p>
          <p>You can manage your notification preferences in your account settings.</p>
        </div>
      </div>
    `;
  }

  // Specific content generators for different notification types
  private static generateTradeConfirmationContent(data: any): string {
    return `
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #28a745;">Trade Executed Successfully</h3>
        <p><strong>Symbol:</strong> ${data.symbol || "N/A"}</p>
        <p><strong>Side:</strong> ${data.side || "N/A"}</p>
        <p><strong>Quantity:</strong> ${data.quantity || "N/A"}</p>
        <p><strong>Price:</strong> $${data.price || "N/A"}</p>
        <p><strong>Order ID:</strong> ${data.orderId || "N/A"}</p>
      </div>
      <p>Thank you for trading with XPro Trading!</p>
    `;
  }

  private static generateBalanceAlertContent(data: any): string {
    return `
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">Balance Alert</h3>
        <p><strong>Current Balance:</strong> $${data.currentBalance || "N/A"}</p>
        <p><strong>Remaining Percentage:</strong> ${data.percentage || "N/A"}%</p>
        <p>Please consider adding funds to continue trading.</p>
      </div>
    `;
  }

  private static generateMarginCallContent(data: any): string {
    return `
      <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #721c24;">Margin Call Warning</h3>
        <p><strong>Margin Level:</strong> ${data.marginLevel || "N/A"}%</p>
        <p><strong>Used Margin:</strong> $${data.usedMargin || "N/A"}</p>
        <p><strong>Equity:</strong> $${data.equity || "N/A"}</p>
        <p style="color: #721c24; font-weight: bold;">Action required: Add funds or reduce positions to avoid liquidation.</p>
      </div>
    `;
  }

  private static generatePriceAlertContent(data: any): string {
    return `
      <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0c5460;">Price Alert Triggered</h3>
        <p><strong>Symbol:</strong> ${data.symbol || "N/A"}</p>
        <p><strong>Alert Price:</strong> $${data.alertPrice || "N/A"}</p>
        <p><strong>Current Price:</strong> $${data.currentPrice || "N/A"}</p>
        <p><strong>Condition:</strong> ${data.condition || "N/A"}</p>
      </div>
    `;
  }

  // Get preferred channels based on notification type and user preferences
  private static getPreferredChannels(
    type: string,
    preferences: NotificationPreferences,
  ): ("in_app" | "email" | "sms" | "push")[] {
    const channels: ("in_app" | "email" | "sms" | "push")[] = [];

    let prefConfig: { inApp: boolean; email: boolean };

    switch (type) {
      case "trade_confirmation":
        prefConfig = preferences.tradeConfirmations;
        break;
      case "balance_alert":
        prefConfig = preferences.balanceAlerts;
        break;
      case "price_alert":
        prefConfig = preferences.priceAlerts;
        break;
      case "margin_call":
        prefConfig = preferences.marginCalls;
        break;
      case "system":
        prefConfig = preferences.systemNotifications;
        break;
      default:
        prefConfig = { inApp: true, email: false };
    }

    if (prefConfig.inApp) channels.push("in_app");
    if (prefConfig.email) channels.push("email");

    // Default to in-app if no channels selected
    if (channels.length === 0) channels.push("in_app");

    return channels;
  }

  // Batch notification sending for admin alerts
  static async sendBatchNotifications(
    userIds: number[],
    notificationData: Omit<NotificationData, "userId">,
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.createNotification({ ...notificationData, userId }),
    );

    await Promise.all(promises);
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) return false;

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: number): Promise<number> {
    try {
      const [affectedRows] = await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId, isRead: false } },
      );

      return affectedRows;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return 0;
    }
  }

  // Get user notifications with pagination
  static async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<{
    notifications: INotification[];
    total: number;
    pagination: any;
  }> {
    try {
      const offset = (page - 1) * limit;
      const whereClause: any = { userId };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const { count, rows } = await Notification.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        notifications: rows,
        total: count,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalNotifications: count,
          limit,
          unreadOnly,
        },
      };
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return {
        notifications: [],
        total: 0,
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalNotifications: 0,
          limit,
          unreadOnly,
        },
      };
    }
  }

  // Delete old notifications (cleanup utility)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await Notification.destroy({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
          isRead: true,
        },
      });

      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old notifications:", error);
      return 0;
    }
  }

  // Trigger balance alert if balance is low
  static async checkAndTriggerBalanceAlert(
    userId: number,
    currentBalance: number,
    totalBalance: number,
  ): Promise<void> {
    const percentage = (currentBalance / totalBalance) * 100;

    if (percentage < 20) {
      await this.createNotification({
        userId,
        type: "balance_alert",
        title: "Low Balance Alert",
        message: `Your account balance is below 20%. Current balance: $${currentBalance.toFixed(2)} (${percentage.toFixed(1)}%)`,
        data: {
          currentBalance: currentBalance.toFixed(2),
          percentage: percentage.toFixed(1),
        },
      });
    }
  }

  // Trigger margin call if margin level is critical
  static async checkAndTriggerMarginCall(
    userId: number,
    marginLevel: number,
    usedMargin: number,
    equity: number,
  ): Promise<void> {
    if (marginLevel < 100) {
      await this.createNotification({
        userId,
        type: "margin_call",
        title: "Margin Call Warning",
        message: `Your margin level is ${marginLevel.toFixed(1)}%. Please add funds or reduce positions to avoid liquidation.`,
        data: {
          marginLevel: marginLevel.toFixed(1),
          usedMargin: usedMargin.toFixed(2),
          equity: equity.toFixed(2),
        },
      });
    }
  }

  // Trigger price alert
  static async triggerPriceAlert(
    userId: number,
    symbol: string,
    alertPrice: number,
    currentPrice: number,
    condition: "above" | "below",
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: "price_alert",
      title: `Price Alert: ${symbol}`,
      message: `${symbol} has ${condition} your alert price of $${alertPrice}. Current price: $${currentPrice}`,
      data: {
        symbol,
        alertPrice,
        currentPrice,
        condition,
      },
    });
  }
}
