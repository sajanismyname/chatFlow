import type { NextFunction, Request, Response } from "express";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, "../../uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "text/plain": ".txt",
};

const hasValidSignature = (buffer: Buffer, mimeType: string): boolean => {
    const startsWith = (...bytes: number[]) =>
        bytes.every((byte, index) => buffer[index] === byte);

    switch (mimeType) {
        case "image/jpeg":
            return startsWith(0xff, 0xd8, 0xff);
        case "image/png":
            return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
        case "image/gif":
            return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
        case "image/webp":
            return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
                buffer.subarray(8, 12).toString("ascii") === "WEBP";
        case "application/pdf":
            return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
        case "application/zip":
            return startsWith(0x50, 0x4b, 0x03, 0x04) ||
                startsWith(0x50, 0x4b, 0x05, 0x06) ||
                startsWith(0x50, 0x4b, 0x07, 0x08);
        case "image/heic":
        case "image/heif": {
            const brand = buffer.subarray(8, 12).toString("ascii");
            return buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
                ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
        }
        default:
            return false;
    }
};

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    if (!allowedTypes[file.mimetype]) {
        cb(new Error("Unsupported file type"));
        return;
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
});

export const uploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    upload.single("file")(req, res, (err: unknown) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    res.status(413).json({
                        message: "Files must be 10 MB or smaller",
                    });
                    return;
                }
                res.status(400).json({
                    message: err.message,
                });
                return;
            }

            if (err instanceof Error) {
                res.status(400).json({
                    message: err.message,
                });
                return;
            }

            res.status(500).json({
                message: "Failed to upload file",
            });
            return;
        }

        next();
    });
};

const handleUploadedFile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const file = req.file;

        if (!file) {
            res.status(400).json({
                message: "File data, name and type are required",
            });
            return;
        }

        if (!allowedTypes[file.mimetype]) {
            res.status(400).json({
                message: "Unsupported file type",
            });
            return;
        }

        if (!file.buffer || file.buffer.length === 0) {
            res.status(400).json({
                message: "Empty files are not allowed",
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE || file.buffer.length > MAX_FILE_SIZE) {
            res.status(413).json({
                message: "Files must be 10 MB or smaller",
            });
            return;
        }

        /*
         * Verify the actual file signature.
         *
         * text/plain does not have a reliable magic number,
         * so it is handled separately.
         */
        if (file.mimetype !== "text/plain") {
            if (!hasValidSignature(file.buffer, file.mimetype)) {
                res.status(400).json({
                    message: "File content does not match its declared type",
                });
                return;
            }
        }

        await mkdir(uploadDirectory, { recursive: true });

        // Extension comes ONLY from our trusted MIME map.
        const extension = allowedTypes[file.mimetype];

        // Never use the client's filename for the stored filename.
        const storedName = `${crypto.randomUUID()}${extension}`;

        await writeFile(
            path.join(uploadDirectory, storedName),
            file.buffer
        );

        res.status(201).json({
            url: `${req.protocol}://${req.get("host")}/uploads/${storedName}`,
            fileName: path.basename(file.originalname || `file${extension}`),
            mimeType: file.mimetype,
            size: file.size,
        });
    } catch (error) {
        console.error("File upload failed:", error);

        res.status(500).json({
            message: "Failed to upload file",
        });
    }
};

export const uploadFile = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.file) {
        uploadMiddleware(req, res, () => {
            void handleUploadedFile(req, res);
        });
        return;
    }

    await handleUploadedFile(req, res);
};