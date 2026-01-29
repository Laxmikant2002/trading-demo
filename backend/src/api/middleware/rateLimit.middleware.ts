import { Request, Response, NextFunction } from "express";

const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip || "127.0.0.1";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const userRequests = requests.get(ip) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (now > userRequests.resetTime) {
    userRequests.count = 1;
    userRequests.resetTime = now + windowMs;
  } else {
    userRequests.count++;
  }

  requests.set(ip, userRequests);

  if (userRequests.count > maxRequests) {
    return res.status(429).json({ error: "Too many requests" });
  }

  next();
};
