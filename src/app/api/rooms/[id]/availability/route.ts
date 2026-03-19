import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlots(): string[] {
  const slots: string[] = []
  for (let hour = 8; hour <= 21; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
}

function isTimeInRange(slotTime: string, startTime: string, endTime: string): boolean {
  return slotTime >= startTime && slotTime < endTime
}

function isPastSlot(date: string, slotTime: string): boolean {
  const now = new Date()
  const [year, month, day] = date.split('-').map(Number)
  const [hour] = slotTime.split(':').map(Number)
  const slotDate = new Date(year, month - 1, day, hour, 0, 0)
  return slotDate <= now
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing date parameter (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Check day of week (0=Sun, 6=Sat) — Sunday is closed
    const [year, month, day] = date.split('-').map(Number)
    const dayOfWeek = new Date(year, month - 1, day).getDay()
    if (dayOfWeek === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          slots: generateSlots().map(time => ({ time, status: 'blocked' }))
        }
      })
    }

    // Fields are Strings in SQLite schema: date="YYYY-MM-DD", startTime="HH:00", endTime="HH:00"
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId: params.id,
        date: date,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    })

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        roomId: params.id,
        date: date,
      }
    })

    const allSlots = generateSlots()

    const slots = allSlots.map((slotTime) => {
      if (isPastSlot(date, slotTime)) {
        return { time: slotTime, status: 'past' }
      }

      const isBlocked = blockedSlots.some((blocked) =>
        isTimeInRange(slotTime, blocked.startTime, blocked.endTime)
      )
      if (isBlocked) {
        return { time: slotTime, status: 'blocked' }
      }

      const isBooked = reservations.some((res) =>
        isTimeInRange(slotTime, res.startTime, res.endTime)
      )
      if (isBooked) {
        return { time: slotTime, status: 'booked' }
      }

      return { time: slotTime, status: 'available' }
    })

    return NextResponse.json({
      success: true,
      data: { date, slots }
    })
  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
