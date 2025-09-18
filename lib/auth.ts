// lib/auth.ts
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { prisma } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'helloitsmeaashutoshsingh'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JwtPayload {
  userId: string
  tenantId: string
  role: string
  email: string
}

// Extend JWTPayload to include our custom fields
interface CustomJWTPayload extends JWTPayload {
  userId: string
  tenantId: string
  role: string
  email: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const jwtPayload: CustomJWTPayload = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
    email: payload.email,
  }

  return await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify(token, secret)
  
  // Type assertion with validation
  const customPayload = payload as CustomJWTPayload
  
  if (!customPayload.userId || !customPayload.tenantId || !customPayload.role || !customPayload.email) {
    throw new Error('Invalid token payload')
  }

  return {
    userId: customPayload.userId,
    tenantId: customPayload.tenantId,
    role: customPayload.role,
    email: customPayload.email,
  }
}

// NEW FUNCTION: Get user from token
export const getUserFromToken = async (token: string) => {
  try {
    // First verify the token and get the payload
    const tokenPayload = await verifyToken(token)
    
    // Then fetch the current user data from database with tenant info
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        tenant: true // This will include the tenant information
      }
    })
    
    if (!user) {
      return null
    }
    
    // Return user data in the format your frontend expects
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
        plan: user.tenant.plan
      }
    }
  } catch (error) {
    console.error('getUserFromToken error:', error)
    return null
  }
}