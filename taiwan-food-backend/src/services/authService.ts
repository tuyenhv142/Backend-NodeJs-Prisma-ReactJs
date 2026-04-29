import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { AppError } from "../core/appError";
import { logger } from "../core/logger";

const JWT_SECRET = () => process.env.JWT_SECRET as string;
const SERVER_API_KEY = () => process.env.SERVER_API_KEY as string;

const TOKEN_EXPIRY = "7d";
const BCRYPT_ROUNDS = 12;

// ── Public interface ──────────────────────────────
export interface TokenPair {
  accessToken: string;
  user: { id: number; name: string; imageUrl: string | null };
}

export interface PreAuthResult {
  preAuthToken: string;
}

// ── Service ───────────────────────────────────────
export const authService = {
  async getPreAuthToken(apiKey: string): Promise<PreAuthResult> {
    if (apiKey !== SERVER_API_KEY()) {
      throw AppError.forbidden("API Key is incorrect");
    }

    const preAuthToken = jwt.sign(
      { device: "authorized_app" },
      JWT_SECRET(),
      { expiresIn: TOKEN_EXPIRY },
    );

    logger.info("Pre-auth token issued");
    return { preAuthToken };
  },

  async login(username: string, password: string): Promise<TokenPair> {
    const user = await prisma.user.findFirst({
      where: { name: username },
    });

    if (!user) {
      throw AppError.unauthorized("Username or password is incorrect");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw AppError.unauthorized("Username or password is incorrect");
    }

    const accessToken = jwt.sign(
      { userId: user.id, userName: user.name },
      JWT_SECRET(),
      { expiresIn: TOKEN_EXPIRY },
    );

    return {
      accessToken,
      user: { id: user.id, name: user.name, imageUrl: user.imageUrl },
    };
  },

  async register(params: {
    name: string;
    password: string;
    imageUrl?: string | null;
  }): Promise<{ id: number; name: string; imageUrl: string | null }> {
    const existingUser = await prisma.user.findFirst({
      where: { name: params.name },
    });

    if (existingUser) {
      throw AppError.conflict("Username is already taken");
    }

    const hashedPassword = await bcrypt.hash(params.password, BCRYPT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        name: params.name,
        password: hashedPassword,
        imageUrl: params.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: newUser.id,
      name: newUser.name,
      imageUrl: newUser.imageUrl,
    };
  },
};
