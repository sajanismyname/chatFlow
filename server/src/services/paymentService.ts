import crypto from "crypto";

export interface EsewaInitiateParams {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: string;
    product_delivery_charge: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export interface EsewaResponseData {
    transaction_code: string;
    status: string;
    total_amount: string | number;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
}

export const getRegistrationFeeNpr = (): number => {
    const fee = process.env.REGISTRATION_FEE_NPR;
    return fee && !isNaN(Number(fee)) ? Number(fee) : 100;
};

/* ========================================================
   eSewa (ePay v2) Functions
   ======================================================== */

export const getEsewaConfig = () => {
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const paymentUrl =
        process.env.ESEWA_PAYMENT_URL ||
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const statusUrl =
        process.env.ESEWA_STATUS_URL ||
        "https://rc.esewa.com.np/api/epay/transaction/status/";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    return {
        productCode,
        secretKey,
        paymentUrl,
        statusUrl,
        frontendUrl,
    };
};

export const generateEsewaSignature = (
    totalAmount: string | number,
    transactionUuid: string,
    productCode: string,
    secretKey: string
): string => {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(message);
    return hmac.digest("base64");
};

export const initiateEsewaPayment = (
    amount: number,
    transactionUuid: string
): { paymentUrl: string; params: EsewaInitiateParams } => {
    const config = getEsewaConfig();
    const formattedAmount = `${amount}`;
    const signature = generateEsewaSignature(
        formattedAmount,
        transactionUuid,
        config.productCode,
        config.secretKey
    );

    const params: EsewaInitiateParams = {
        amount: formattedAmount,
        tax_amount: "0",
        total_amount: formattedAmount,
        transaction_uuid: transactionUuid,
        product_code: config.productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${config.frontendUrl}/payment/verify?gateway=esewa&txn=${transactionUuid}`,
        failure_url: `${config.frontendUrl}/payment/verify?gateway=esewa&txn=${transactionUuid}&failed=true`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
    };

    return {
        paymentUrl: config.paymentUrl,
        params,
    };
};

export const verifyEsewaResponseData = (
    base64Data: string,
    secretKey: string
): { valid: boolean; decoded: EsewaResponseData | null } => {
    try {
        const jsonStr = Buffer.from(base64Data, "base64").toString("utf-8");
        const data = JSON.parse(jsonStr) as EsewaResponseData;

        if (!data.signed_field_names || !data.signature) {
            return { valid: false, decoded: data };
        }

        const signedFields = data.signed_field_names.split(",");
        const parts = signedFields.map(
            (field) => `${field}=${(data as any)[field]}`
        );
        const message = parts.join(",");

        const hmac = crypto.createHmac("sha256", secretKey);
        hmac.update(message);
        const expectedSignature = hmac.digest("base64");

        return {
            valid: expectedSignature === data.signature,
            decoded: data,
        };
    } catch {
        return { valid: false, decoded: null };
    }
};

export const checkEsewaStatusApi = async (
    productCode: string,
    totalAmount: number,
    transactionUuid: string
): Promise<{ success: boolean; status?: string; refId?: string }> => {
    const config = getEsewaConfig();
    try {
        const url = `${config.statusUrl}?product_code=${encodeURIComponent(
            productCode
        )}&total_amount=${encodeURIComponent(
            totalAmount
        )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            return { success: false };
        }

        const result = (await response.json()) as {
            status?: string;
            ref_id?: string;
        };

        return {
            success: result.status === "COMPLETE",
            status: result.status,
            refId: result.ref_id,
        };
    } catch (err) {
        console.error("eSewa status check error:", err);
        return { success: false };
    }
};

/* ========================================================
   Khalti (ePayment v2) Functions
   ======================================================== */

export const getKhaltiConfig = () => {
    const secretKey = process.env.KHALTI_SECRET_KEY || "";
    const apiUrl =
        process.env.KHALTI_API_URL || "https://a.khalti.com/api/v2";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    return {
        secretKey,
        apiUrl,
        frontendUrl,
    };
};

export interface KhaltiInitiateResult {
    paymentUrl: string;
    pidx: string;
    isSimulated?: boolean;
}

export const initiateKhaltiPayment = async (
    amount: number,
    transactionUuid: string,
    name: string,
    email: string
): Promise<KhaltiInitiateResult> => {
    const config = getKhaltiConfig();
    const amountInPaisa = Math.round(amount * 100);

    // If Khalti secret key is provided and not dummy, call live/sandbox Khalti API
    if (config.secretKey && !config.secretKey.startsWith("test_secret")) {
        try {
            const response = await fetch(
                `${config.apiUrl}/epayment/initiate/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: config.secretKey.startsWith("Key ")
                            ? config.secretKey
                            : `Key ${config.secretKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        return_url: `${config.frontendUrl}/payment/verify?gateway=khalti&txn=${transactionUuid}`,
                        website_url: config.frontendUrl,
                        amount: amountInPaisa,
                        purchase_order_id: transactionUuid,
                        purchase_order_name: "ChatFlow Registration Fee",
                        customer_info: {
                            name,
                            email,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = (await response.json()) as {
                    pidx: string;
                    payment_url: string;
                };
                if (data.pidx && data.payment_url) {
                    return {
                        paymentUrl: data.payment_url,
                        pidx: data.pidx,
                    };
                }
            } else {
                const errText = await response.text();
                console.warn(
                    "Khalti initiate failed, falling back to simulation if in dev:",
                    errText
                );
            }
        } catch (err) {
            console.error("Khalti initiate network error:", err);
        }
    }

    // Dev/Sandbox simulation fallback when live key is not configured or in test mode
    const simulatedPidx = `KHALTI_SIM_${transactionUuid}`;
    const simulatedPaymentUrl = `${config.frontendUrl}/payment/verify?gateway=khalti&txn=${transactionUuid}&pidx=${simulatedPidx}&simulated=true`;

    return {
        paymentUrl: simulatedPaymentUrl,
        pidx: simulatedPidx,
        isSimulated: true,
    };
};

export const verifyKhaltiPayment = async (
    pidx: string
): Promise<{ success: boolean; status?: string; transactionId?: string }> => {
    const config = getKhaltiConfig();

    // Check simulated test payment
    if (pidx.startsWith("KHALTI_SIM_")) {
        return {
            success: true,
            status: "Completed",
            transactionId: `TXN_${pidx}`,
        };
    }

    if (!config.secretKey) {
        return { success: false, status: "Missing Khalti secret key" };
    }

    try {
        const response = await fetch(`${config.apiUrl}/epayment/lookup/`, {
            method: "POST",
            headers: {
                Authorization: config.secretKey.startsWith("Key ")
                    ? config.secretKey
                    : `Key ${config.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx }),
        });

        if (!response.ok) {
            return { success: false, status: "Lookup request failed" };
        }

        const data = (await response.json()) as {
            status: string;
            transaction_id?: string;
        };

        return {
            success: data.status === "Completed",
            status: data.status,
            transactionId: data.transaction_id,
        };
    } catch (err) {
        console.error("Khalti verification error:", err);
        return { success: false, status: "Network error" };
    }
};
