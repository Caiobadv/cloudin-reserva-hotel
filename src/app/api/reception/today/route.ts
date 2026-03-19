import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !['RECEPTION', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const today = dateParam || new Date().toISOString().split('T')[0]

    const reservations = await prisma.reservation.findMany({
      where: {
        date: today,
        status: { in: ['CONFIRMED', 'PENDING', 'COMPLETED'] }
      },
      include: {
        user: true,
        room: true,
        checkin: true
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json({ success: true, data: reservations })
  } catch (error) {
    console.error('Get today reservations error:', error)
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}
