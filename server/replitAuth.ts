import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import type { PassportStatic } from "passport";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

/** Call this from server/index.ts once */
export function configurePassport(passport: PassportStatic) {
  // If you already had strategies, keep them. For now, just serialize whole user.
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  // TODO: add your real strategy (Replit auth, Google, etc.)
}

/** Defensive helper: works with Passport *or* plain session */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // If passport is present and a user is authed
  const hasPassportAuth =
    typeof (req as any).isAuthenticated === "function" &&
    (req as any).isAuthenticated();

  // Or we set a user on the session (dev mode / custom login)
  const sessUser = (req.session as any)?.user;
  const user = hasPassportAuth ? (req as any).user : sessUser;

  if (user && (!user.expires_at || Date.now() < new Date(user.expires_at).getTime())) {
    // attach to req for downstream handlers
    (req as any).user = user;
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
}

/** Dev login to unblock local building (remove in prod) */
export function devLogin(req: Request, res: Response) {
  const user = {
    id: "dev-user",
    email: "dev@example.com",
    name: "Dev User",
    // one-week session
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  (req.session as any).user = user;
  return res.json(user);
}

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL || "https://replit.com/oidc";
    return await client.discovery(
      new URL(issuerUrl),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, async (err: any, user: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.redirect("/api/login");
      }
      
      if (!user) {
        return res.redirect("/api/login");
      }

      try {
        // Log the user in with passport session
        req.logIn(user, async (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.redirect("/api/login");
          }

          // Get user claims from the authenticated user
          const claims = user.claims;
          if (!claims) {
            console.error("No claims found in user object");
            return res.redirect("/api/login");
          }

          // Find the user in the database
          const dbUser = await storage.getUser(claims.sub);
          if (!dbUser) {
            console.error("User not found in database");
            return res.redirect("/api/login");
          }

          // Generate JWT token for the frontend
          const jwt = await import('jsonwebtoken');
          const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
          const token = jwt.sign(
            { 
              id: dbUser.id, 
              role: dbUser.role,
              email: dbUser.email 
            },
            jwtSecret,
            { expiresIn: '24h' }
          );

          // Set JWT as httpOnly cookie
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });

          // Redirect to dashboard
          res.redirect("/");
        });
      } catch (error) {
        console.error("Callback processing error:", error);
        res.redirect("/api/login");
      }
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
