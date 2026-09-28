import "dotenv/config";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured.");
}

const JWT_SECRET: string = secret;

export default JWT_SECRET;
