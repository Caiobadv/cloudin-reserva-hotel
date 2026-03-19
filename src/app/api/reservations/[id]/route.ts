import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        room: true,
        user: true,
        payment: true
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check access: owner, reception, or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    const isOwner = reservation.userId === session.user.id
    const isReceptionOrAdmin = user && ['RECEPTION', 'ADMIN'].includes(user.role)

    if (!isOwner && !isReceptionOrAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: reservation
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}
