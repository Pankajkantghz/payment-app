export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = Number(process.env.PORT || 3000);
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/paytm";
export const DEMO_FUNDING_ENABLED = process.env.ENABLE_DEMO_FUNDING === "true";

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters");
}
