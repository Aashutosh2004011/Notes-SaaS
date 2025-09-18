import { getUserFromToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    
    if (!user) {
      return Response.json({ error: 'Invalid token or user not found' }, { status: 401 })
    }

    return Response.json(user)
  } catch (error) {
    console.error('Auth me error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}