import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id')
    console.log("🚀 ~ GET ~ tenantId:", tenantId)
    if(!tenantId){
        return NextResponse.json({ error: 'Tenant Id is required' }, { status: 404 })
    }
    const notes = await prisma.note.findMany({
      where: { tenantId },
      include: { author: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id')
    const userId = request.headers.get('user-id')
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check note limit for free plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId! },
      include: { notes: true },
    })

    if (tenant?.plan === 'FREE' && tenant.notes.length >= 3) {
      return NextResponse.json({ error: 'Free plan limit reached. Upgrade to Pro.' }, { status: 403 })
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        authorId: userId!,
        tenantId: tenantId!,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}