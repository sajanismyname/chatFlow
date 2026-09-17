import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";
import {google} from "googleapis"
import { googleClient } from "../config/google.js";

const userRepository = AppDataSource.getRepository(User)

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

        if (!data.id) {
        res.status(400).json({
            message: "Google user ID is missing",
        });

        return;
        }

        const existingUser = await userRepository.findOne({
            where:{
                googleId:data.id
            }
        })

        if(existingUser){
        res.json({
            message: "User already exists",
            user: existingUser,
        });

        return;
        }

        const newUser = userRepository.create({
            googleId: data.id,
            email: data.email!,
            name: data.name!,
            avatar: data.picture,
        })

        const savedUser =await userRepository.save(newUser)

        res.json({
        message: "User created successfully",
        user: savedUser,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message: "Google authentication failed",
        });
    }
};