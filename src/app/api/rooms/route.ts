import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true
      }
    })

    return NextResponse.json(
      { success: true, data: rooms },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
