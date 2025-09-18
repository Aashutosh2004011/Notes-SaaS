import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant Id is required' }, { status: 404 })
    }
    
    const { id } = await params
    const note = await prisma.note.findFirst({
      where: { id, tenantId },
      include: { author: { select: { email: true } } },
    })
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json(note)
  } catch (error) {
    console.error('Get note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('tenant-id')
    const { title, content } = await request.json()
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant Id is required' }, { status: 404 })
    }
    
    const { id } = await params
    const note = await prisma.note.findFirst({
      where: { id, tenantId },
    })
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content },
    })
    
    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('tenant-id')
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant Id is required' }, { status: 404 })
    }
    
    const { id } = await params
    const note = await prisma.note.findFirst({
      where: { id, tenantId },
    })
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    await prisma.note.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}