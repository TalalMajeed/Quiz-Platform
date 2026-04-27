import { cookies } from "next/headers";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/user";

const SESSION_COOKIE = "quiz_platform_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const HASH_ITERATIONS = 100_000;
const SESSION_SECRET =
  process.env.AUTH_SECRET || "development-auth-secret-change-me";
const DEFAULT_ADMIN_EMAIL = "talal@ecello.net";
const DEFAULT_ADMIN_PASSWORD = "Ether360";
const DEFAULT_ADMIN_NAME = "Talal";

type SessionPayload = {
  userId: string;
  role: "admin" | "student";
  expiresAt: number;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, "sha512").toString(
    "hex"
  );
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const candidate = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    64,
    "sha512"
  ).toString("hex");

  return timingSafeEqual(Buffer.from(storedHash), Buffer.from(candidate));
}

function signPayload(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(body);
  return `${body}.${signature}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = signPayload(body);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: "admin" | "student") {
  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(payload.expiresAt),
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  return decode(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findById(session.userId).lean();
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email || "",
    username: user.username || "",
    role: user.role as "admin" | "student",
  };
}

export async function ensureDefaultAdmin() {
  await connectToDatabase();
  const admin = await User.findOneAndUpdate(
    { email: DEFAULT_ADMIN_EMAIL },
    {
      $set: {
        name: DEFAULT_ADMIN_NAME,
        role: "admin",
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      },
      $setOnInsert: {
        createdByAdmin: false,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return admin;
}

export function normalizeRedirectPath(
  candidate: string | null | undefined,
  fallback: string
) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  return candidate;
}

function getLoginRedirectPath(redirectToPath?: string, adminOnly = false) {
  const loginPath = adminOnly ? "/admin/login" : "/login";

  if (!redirectToPath) {
    return loginPath;
  }

  return `${loginPath}?redirectTo=${encodeURIComponent(redirectToPath)}`;
}

export function getPostLoginRedirect(
  role: "admin" | "student",
  redirectToPath?: string | null
) {
  const fallback = role === "admin" ? "/admin" : "/quizzes";
  const normalized = normalizeRedirectPath(redirectToPath, fallback);

  if (role === "student" && normalized.startsWith("/admin")) {
    return fallback;
  }

  if (role === "admin" && !normalized.startsWith("/admin")) {
    return fallback;
  }

  return normalized;
}

export async function requireUser(redirectToPath?: string, adminOnly = false) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(getLoginRedirectPath(redirectToPath, adminOnly));
  }
  return user;
}

export async function requireAdmin(redirectToPath?: string) {
  await ensureDefaultAdmin();
  const user = await requireUser(redirectToPath, true);
  if (user.role !== "admin") {
    redirect("/quizzes");
  }
  return user;
}

export async function requireStudent(redirectToPath?: string) {
  const user = await requireUser(redirectToPath);
  if (user.role !== "student") {
    redirect("/admin");
  }
  return user;
}
