import dotenv from "dotenv"

dotenv.config({
    path:"src/.env",
    overrride: true
})

export const config={
    PORT: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    GMAIL_EMAIL:process.env.GMAIL_EMAIL,
    GMAIL_PASS:process.env.GMAIL_PASS,
    ENVIRONMENT: process.env.ENVIRONMENT,
    JWT_SECRET:process.env.JWT_SECRET
}