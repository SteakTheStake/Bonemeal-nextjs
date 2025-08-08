import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

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
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupDiscordAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const discordStrategy = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    callbackURL: process.env.DISCORD_CALLBACK_URL || '/api/auth/discord/callback',
    scope: ['identify', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Upsert user in database
      const userData = {
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        email: profile.email || undefined,
        avatar: profile.avatar || undefined,
      };
      
      const user = await storage.upsertUserByDiscordId(userData);
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  });

  passport.use(discordStrategy);

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User not found in database, return null (user will be logged out)
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(null, false); // Return false instead of error to prevent session corruption
    }
  });

  // Auth routes
  app.get('/api/auth/discord', passport.authenticate('discord'));

  app.get('/api/auth/discord/callback',
    passport.authenticate('discord', {
      failureRedirect: '/',
    }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export const isOptionallyAuthenticated: RequestHandler = (req, res, next) => {
  // This middleware allows both authenticated and unauthenticated users
  next();
};