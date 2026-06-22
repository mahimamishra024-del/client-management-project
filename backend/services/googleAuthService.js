import { google } from "googleapis";
import fs from "fs";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "config", "token.json");

export const getAuthUrl = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email", // ✅ needed to check email
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
};

export const getTokensFromCode = async (code) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (err) {
    console.error("❌ Token Exchange Error:", err.message);
    throw err;
  }
};

export const saveTokens = async (tokens) => {
  try {
    const dirPath = path.dirname(TOKEN_PATH);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log("💾 Token saved at:", TOKEN_PATH);
    return true;
  } catch (err) {
    console.error("❌ Failed to save token:", err.message);
    throw err;
  }
};

export const getGoogleClient = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`No token found at ${TOKEN_PATH}. Please authenticate first.`);
  }
  const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oauth2Client.setCredentials(tokenData);
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) tokenData.refresh_token = tokens.refresh_token;
    tokenData.access_token = tokens.access_token;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
  });
  return oauth2Client;
};

export const isGoogleConnected = async () => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) return false;
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    return !!tokenData.access_token;
  } catch {
    return false;
  }
};