import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !['RECEPTION', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { reservationId, notes } = await request.json()
    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservationId' }, { status: 400 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Reservation must be confirmed for check-in' }, { status: 400 })
    }

    const checkin = await prisma.receptionCheckin.create({
      data: {
        reservationId,
        checkedInBy: session.user.id,
        checkedInAt: new Date(),
        notes: notes || null,
      }
    })

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({ success: true, data: checkin }, { status: 201 })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 })
  }
}
