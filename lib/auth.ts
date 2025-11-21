import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const SESSION_COOKIE = "educonexa_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

type SessionPayload = {
  userId: string
}

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado")
  }
  return process.env.JWT_SECRET
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signSession(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" })
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret())
    if (typeof payload === "string") return null
    return { userId: (payload as SessionPayload).userId }
  } catch {
    return null
  }
}

export async function setSessionCookie(userId: string) {
  const token = signSession(userId)
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return token
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifySession(token)
  if (!payload?.userId) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}
