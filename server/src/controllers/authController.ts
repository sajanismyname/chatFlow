import crypto from "crypto";
import bcrypt from "bcrypt"
import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource.js";
import { RefreshToken } from "../entities/refreshToken.js";
import { PasswordResetToken } from "../entities/PasswordResetToken.js";
import { User } from "../entities/User.js";
import {google} from "googleapis"
import { googleClient } from "../config/google.js";
import { generateAccessToken } from "../utils/jwt.js";
import { createRefreshToken } from "../services/refreshTokenService.js";
import {sendPasswordResetEmail} from "../services/emailServices.js";
import { QueryFailedError } from "typeorm/browser/error/index.js";


const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const passwordResetTokenRepository =
    AppDataSource.getRepository(PasswordResetToken);

export const login = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        const normalEmail = email?.trim().toLowerCase();

        if (!email || !password) {
            res.status(400).json({
                message: "Email and password are required",
            });
            return;
        }

        const user = await userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email: normalEmail })
            .getOne();

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        if (!user.password) {
            res.status(401).json({
                message: "This account uses Google login",
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const accessToken = generateAccessToken(user.id);

        const { rawToken } = await createRefreshToken(
            user.id
        );


        res.cookie("refreshToken", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:"/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            accessToken,
            user,
        });
    } catch (error) {
        if(
            error instanceof QueryFailedError &&
            (error as any).code === "23505"
        ) {
            res.status(409).json({
                message: "User already exists",
            });
            return;
        }
    }
};

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const normalEmail = email?.trim().toLowerCase();

        if (!name || !email || !password) {
            res.status(400).json({
                message: "Name, email and password are required",
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                message: "Password must be at least 8 characters",
            });
            return;
        }

        if (name.trim().length < 2) {
            res.status(400).json({
                message: "Name must be at least 2 characters",
            });
            return;
        }

        const existingUser = await userRepository.findOne({
            where: { email: normalEmail },
        });

        if (existingUser) {
            res.status(409).json({
                message: "User already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepository.create({
            name,
            email: normalEmail,
            password: hashedPassword,
        });

        const savedUser = await userRepository.save(user);

        const accessToken = generateAccessToken(savedUser.id);

        const { rawToken } = await createRefreshToken(
            savedUser.id
        );

        res.cookie("refreshToken", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:"/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "Registration successful",
            accessToken,
            user: savedUser,
        });
    } catch (error) {
        if(
            error instanceof QueryFailedError &&
            (error as any).code === "23505"
        ) {
            res.status(409).json({
                message: "User already exists",
            });
            return;
        }
    }
};

export const getCurrentUser = async (
    req: Request,
    res: Response
): Promise<void> =>{
    try {
        const userId=req.user?.id

        if(!userId){
            res.status(404).json({
                message: "user not found",
            })
            return;
        }

        const user = await userRepository.findOne({
            where:{
                id:userId,
            },
            select:{
                id:true,
                googleId:true,
                email:true,
                name:true,
                avatar:true
            }
        })

        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            user,
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Failed to fetch current user",
        });
    }
}

export const getUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try{
        const users = await userRepository.find()

        res.status(200).json({
            users,
        });
    } catch (error) {
    console.error(error);

    res.status(500).json({
        message: "Failed to fetch users",
    });
    }
}

export const googleLogin = (
    req: Request,
    res: Response
    ): void => {
    const url = googleClient.generateAuthUrl({
        access_type: "online",
        scope: [
        "openid",
        "profile",
        "email",
        ],
    });

    res.redirect(url);
};

export const googleCallback = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { code } = req.query;

        if (typeof code !== "string") {
            res.status(400).json({
                message: "Authorization code missing",
            });
            return;
        }

        const { tokens } = await googleClient.getToken(code);

        googleClient.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: googleClient,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        const email = data.email!.trim().toLowerCase();

        if (!data.id) {
            res.status(400).json({
                message: "Google user ID is missing",
            });
            return;
        }

            let user = await userRepository.findOne({
                where: {
                    googleId: data.id,
                },
            });

            if (!data.email) {
                res.status(400).json({
                    message: "Google account email is unavailable",
                });
                return;
            }

            // If Google ID was not found, check whether the email
            // already belongs to an existing account.
            if (!user && data.email) {
                user = await userRepository.findOne({
                    where: {
                        email: email,
                    },
                });

                // Existing email account found.
                // Link that account to the Google account.
                if (user) {
                    user.googleId = data.id;
                    user.avatar = data.picture ?? user.avatar;

                    await userRepository.save(user);
                }
            }

            // If neither Google ID nor email exists,
            // create a completely new account.
            if (!user) {
                const newUser = userRepository.create({
                    googleId: data.id,
                    email: email,
                    name: data.name!,
                    avatar: data.picture,
                });

                user = await userRepository.save(newUser);
            }

        const {rawToken} =await createRefreshToken(user.id);

        res.cookie("refreshToken", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:"/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Google authentication failed",
        });
    }
};

export const refreshAccessToken = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const rawToken = req.cookies.refreshToken;

        if (!rawToken) {
            res.status(401).json({
                message: "Refresh token missing",
            });
            return;
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const queryRunner = AppDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const storedToken = await queryRunner.manager.findOne(
                RefreshToken,
                {
                    where: { tokenHash },
                    lock: {
                        mode: "pessimistic_write",
                    },
                }
            );

            if (!storedToken) {
                await queryRunner.rollbackTransaction();

                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                res.status(401).json({
                    message: "Invalid refresh token",
                });

                return;
            }

            if (
                storedToken.revokedAt ||
                storedToken.expiresAt < new Date()
            ) {
                await queryRunner.rollbackTransaction();

                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });

                res.status(401).json({
                    message: "Refresh token invalid or expired",
                });

                return;
            }

            storedToken.revokedAt = new Date();

            await queryRunner.manager.save(
                RefreshToken,
                storedToken
            );

            const rawNewToken = crypto
                .randomBytes(64)
                .toString("hex");

            const newTokenHash = crypto
                .createHash("sha256")
                .update(rawNewToken)
                .digest("hex");

            const expiresAt = new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            );

            const newRefreshToken =
                queryRunner.manager.create(RefreshToken, {
                    tokenHash: newTokenHash,
                    userId: storedToken.userId,
                    expiresAt,
                    revokedAt: null,
                });

            await queryRunner.manager.save(
                RefreshToken,
                newRefreshToken
            );

            const user = await queryRunner.manager.findOne(
                User,
                {
                    where: {
                        id: storedToken.userId,
                    },
                }
            );

            if (!user) {
                await queryRunner.rollbackTransaction();

                res.status(401).json({
                    message: "User not found",
                });
                return;
            }

            await queryRunner.commitTransaction();

            const newAccessToken =
                generateAccessToken(user.id);

            res.cookie("refreshToken", rawNewToken, {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                accessToken: newAccessToken,
                user,
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    } catch (error) {
        console.error("Refresh token error:", error);

        res.status(500).json({
            message: "Failed to refresh access token",
        });
    }
};

export const logout = async (
    req:Request,
    res:Response
):Promise<void> =>{
    try {
        const rawToken = req.cookies.refreshToken;

        if(rawToken){
            const tokenHash = crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");

            await refreshTokenRepository.update(
                { tokenHash },
                { revokedAt: new Date() }
            );
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:"/"
        });

        res.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Logout failed",
        });
    }
}

export const updateProfile =async (
    req:Request,
    res:Response
): Promise<void> =>{
    try {
        const userId = req.user?.id
        const {name, avatar}=req.body

        const user = await userRepository.findOne({
            where:{
                id:userId
            }
        })

            if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
        }

        if (name !== undefined) {
            const trimmedName = name.trim();

            if(trimmedName.length === 0){
                res.status(400).json({
                message: "Name cannot be empty",
                });
                return;
            }
            if(trimmedName.length > 100){
                res.status(400).json({
                message: "Name cannot exceed 100 characters",
                });
                return;
            }

            user.name = trimmedName;
        }

        if (avatar !== undefined) {
        user.avatar = avatar;
        }

        await userRepository.save(user);

        res.status(200).json({
        message: "Profile updated successfully",
        user: {
            id: user.id,
            googleId: user.googleId,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        },
        });

    } catch (error) {
        console.error("Update profile error:", error);

    res.status(500).json({
        message: "Failed to update profile",
    });
    }
}

export const forgotPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {

        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                message: "Email is required",
            });
            return;
        }

        const user = await userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        if (!user || !user.password) {


            res.status(200).json({
                message:
                    "If an account exists with that email, a password reset link has been sent.",
            });

            return;
        }

        await refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken)
            .set({revokedAt: new Date()})
            .where(
                "userId= :userId", {
                    userId: user.id
                }
            )
            .andWhere("revokedAt IS NULL")
            .execute()


        const rawToken = crypto
            .randomBytes(32)
            .toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
        );

        const resetToken =
            passwordResetTokenRepository.create({
                tokenHash,
                userId: user.id,
                expiresAt,
                usedAt: null,
            });


        await passwordResetTokenRepository.save(
            resetToken
        );

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;


        await sendPasswordResetEmail(
            user.email,
            resetUrl
        );


        res.status(200).json({
            message:
                "If an account exists with that email, a password reset link has been sent.",
        });

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Unable to process password reset request",
        });
    }
};


export const resetPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            res.status(400).json({
                message:
                    "Reset token and new password are required",
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                message:
                    "Password must be at least 8 characters",
            });
            return;
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetToken =
            await passwordResetTokenRepository.findOne({
                where: {
                    tokenHash,
                },
            });

        if (!resetToken) {
            res.status(400).json({
                message: "Invalid or expired reset token",
            });
            return;
        }

        if (resetToken.usedAt) {
            res.status(400).json({
                message: "Reset token has already been used",
            });
            return;
        }

        if (resetToken.expiresAt < new Date()) {
            res.status(400).json({
                message: "Reset token has expired",
            });
            return;
        }

        const user = await userRepository.findOne({
            where: {
                id: resetToken.userId,
            },
        });

        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await userRepository.save(user);

        await refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken)
            .set({revokedAt: new Date()})
            .where(
                "userId= :userId", {
                    userId: user.id
                }
            )
            .andWhere("revokedAt IS NULL")
            .execute()

        resetToken.usedAt = new Date();

        await passwordResetTokenRepository.save(
            resetToken
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        })

        res.status(200).json({
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error(
            "Reset password error:",
            error
        );

        res.status(500).json({
            message: "Failed to reset password",
        });
    }
};