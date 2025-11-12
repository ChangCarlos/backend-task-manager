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
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    } as const;
    
    res.cookie('token', result.token, cookieOptions);
    
    return res.json({ user: result.user });
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

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    });
    
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    return next(error);
  }
}
