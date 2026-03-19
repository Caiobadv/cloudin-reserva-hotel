import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReservationCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, date, startTime, endTime } = await request.json()

    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Validate times
    if (startTime >= endTime) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
    }

    // Calculate duration and price
    const startHour = parseInt(startTime.split(':')[0])
    const endHour = parseInt(endTime.split(':')[0])
    const durationHours = endHour - startHour
    const totalPrice = durationHours * room.pricePerHour

    // Check for conflicts — fields are Strings: date="YYYY-MM-DD", startTime="HH:00"
    const existingReservations = await prisma.reservation.findMany({
      where: {
        roomId,
        date,
        status: { in: ['CONFIRMED', 'PENDING'] },
      }
    })

    const hasConflict = existingReservations.some((res) => {
      return res.startTime < endTime && res.endTime > startTime
    })

    if (hasConflict) {
      return NextResponse.json({ error: 'Este horário já está reservado.' }, { status: 409 })
    }

    // Check blocked slots
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: { roomId, date }
    })

    const isBlocked = blockedSlots.some((slot) => {
      return slot.startTime < endTime && slot.endTime > startTime
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'Este horário está bloqueado.' }, { status: 409 })
    }

    // Create reservation
    const code = generateReservationCode()

    const reservation = await prisma.reservation.create({
      data: {
        code,
        userId: session.user.id,
        roomId,
        date,
        startTime,
        endTime,
        durationHours,
        totalPrice,
        status: 'PENDING',
      },
      include: { room: true }
    })

    return NextResponse.json({ success: true, data: reservation }, { status: 201 })
  } catch (error) {
    console.error('Create reservation error:', error)
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !['ADMIN', 'RECEPTION'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const statusParam = searchParams.get('status')

    const where: any = {}
    if (dateParam) where.date = dateParam
    if (statusParam) where.status = statusParam.toUpperCase()

    const reservations = await prisma.reservation.findMany({
      where,
      include: { user: true, room: true },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json({ success: true, data: reservations })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}
