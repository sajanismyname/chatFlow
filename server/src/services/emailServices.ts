import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});


export const sendPasswordResetEmail = async (
    email: string,
    resetUrl: string
): Promise<void> => {

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Reset your ChatFlow password",

        text: `
You requested a password reset for your ChatFlow account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">

                <h2>Reset your ChatFlow password</h2>

                <p>
                    You requested a password reset for your ChatFlow account.
                </p>

                <p>
                    Click the button below to reset your password.
                </p>

                <p>
                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 10px 18px;
                            background: #000;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

            </div>
        `,
    });
};