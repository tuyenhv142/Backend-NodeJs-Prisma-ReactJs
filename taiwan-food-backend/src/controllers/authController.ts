import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { prisma } from "../prisma/client";
import { LoginSchema, RegisterSchema } from "../schemas/authSchema";

export const getPreAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.body.ApiKey;
    if (apiKey !== process.env.SERVER_API_KEY) {
      return sendError(res, "Api key is incorrect", 403);
    }
    //create a pre auth token with device info and short expiration time (e.g. 7 days)
    const preAuthToken = jwt.sign(
      { device: "authorized_app" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    sendSuccess(res, { preAuthToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(
        res,
        "Data is invalid",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    //Use Prisma check user is valid
    const user = await prisma.user.findFirst({
      where: { name: parsed.data.username },
    });
    if (!user || user.password !== parsed.data.password) {
      return sendError(res, "Username or password is incorrect", 401);
    }

    const accessToken = jwt.sign(
      { userId: user.id, userName: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    sendSuccess(res, {
      accessToken,
      user: { id: user.id, name: user.name, imageUrl: user.imageUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(
        res,
        "Data is invalid",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    // try {
    //   jwt.verify(parsed.data.preAuthToken, process.env.JWT_SECRET as string);
    // } catch (err) {
    //   return sendError(res, 'Token is expired or invalid', 401);
    // }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { name: parsed.data.name },
    });
    if (existingUser) {
      return sendError(res, "Username is already taken", 409);
    }
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: parsed.data.name,
        password: parsed.data.password,
        imageUrl: parsed.data.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    sendSuccess(
      res,
      { id: newUser.id, name: newUser.name, imageUrl: newUser.imageUrl },
      201,
    );
  } catch (error) {
    next(error);
  }
};
