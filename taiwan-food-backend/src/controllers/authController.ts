import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { authService } from "../services/authService";
import { LoginSchema, RegisterSchema } from "../schemas/authSchema";

export const getPreAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.getPreAuthToken(req.body.ApiKey);
    sendSuccess(res, result);
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
      return sendError(res, "Data is invalid", 400, parsed.error.flatten().fieldErrors);
    }

    const result = await authService.login(
      parsed.data.username,
      parsed.data.password,
    );
    sendSuccess(res, result);
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
      return sendError(res, "Data is invalid", 400, parsed.error.flatten().fieldErrors);
    }

    const result = await authService.register(parsed.data);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};
