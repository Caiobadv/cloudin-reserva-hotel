import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { roomId, date, startTime, endTime, reason } = await request.json()

    // Validate required fields
    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Validate string format and times
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:00' },
        { status: 400 }
      )
    }

    // Compare times to ensure start < end
    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)

    if (startHour >= endHour) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      )
    }

    // Create blocked slot with String fields
    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        roomId,
        date,
        startTime,
        endTime,
        reason: reason || '',
        blockedBy: session.user.id
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: blockedSlot
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create blocked slot error:', error)
    return NextResponse.json(
      { error: 'Failed to create blocked slot' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const roomIdParam = searchParams.get('roomId')
    const dateParam = searchParams.get('date')

    const where: any = {}

    if (roomIdParam) {
      where.roomId = roomIdParam
    }

    if (dateParam) {
      where.date = dateParam
    }

    const blockedSlots = await prisma.blockedSlot.findMany({
      where,
      include: {
        room: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: blockedSlots
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get blocked slots error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked slots' },
      { status: 500 }
    )
  }
}
