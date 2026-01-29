import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import { TokenPayload } from "../../utils/jwt";

interface AuthRequest extends Request {
  user?: TokenPayload;
}

export { AuthRequest };

// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "your-secret-key",
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: TokenPayload, done) => {
    try {
      const user = await User.findByPk(payload.userId);
      if (user) {
        return done(null, payload);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: TokenPayload | false) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: "Access denied" });
      }
      (req as AuthRequest).user = user;
      next();
    },
  )(req, res, next);
};

export default passport;
