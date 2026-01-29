import { createClient } from "redis";

export class UserCache {
  private client = createClient();

  async setUserSession(userId: string, session: any) {
    await this.client.set(`user:${userId}`, JSON.stringify(session));
  }

  async getUserSession(userId: string) {
    const session = await this.client.get(`user:${userId}`);
    return session ? JSON.parse(session) : null;
  }

  async deleteUserSession(userId: string) {
    await this.client.del(`user:${userId}`);
  }
}
