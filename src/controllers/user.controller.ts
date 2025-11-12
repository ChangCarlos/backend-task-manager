import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await userService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.login(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    return res.json(profile);
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const updatedProfile = await userService.updateProfile(userId, req.body);
    return res.json(updatedProfile);
  } catch (error) {
    return next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
