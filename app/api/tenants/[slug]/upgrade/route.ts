import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userRole = request.headers.get('user-role')
    const tenantId = request.headers.get('tenant-id')

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug, id: tenantId! },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId! },
      data: { plan: 'PRO' },
    })

    return NextResponse.json({ message: 'Upgraded to Pro plan successfully', tenant: updatedTenant })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}