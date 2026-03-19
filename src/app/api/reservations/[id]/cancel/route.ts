import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (reservation.status !== 'CONFIRMED' && reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cannot cancel this reservation' }, { status: 400 })
    }

    // Check 2 hour cancellation deadline
    const now = new Date()
    const [year, month, day] = reservation.date.split('-').map(Number)
    const [hour] = reservation.startTime.split(':').map(Number)
    const startDateTime = new Date(year, month - 1, day, hour, 0, 0)
    const deadlineMs = startDateTime.getTime() - 2 * 60 * 60 * 1000

    if (now.getTime() > deadlineMs) {
      return NextResponse.json(
        { error: 'Não é possível cancelar com menos de 2 horas de antecedência' },
        { status: 400 }
      )
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: { room: true }
    })

    return NextResponse.json({ success: true, data: updatedReservation })
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 })
  }
}
