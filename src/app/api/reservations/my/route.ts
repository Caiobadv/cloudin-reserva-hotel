import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        room: true,
        payment: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: reservations
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get my reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}
