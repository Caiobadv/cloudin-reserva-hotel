import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    // Verify blocked slot exists
    const blockedSlot = await prisma.blockedSlot.findUnique({
      where: { id: params.id }
    })

    if (!blockedSlot) {
      return NextResponse.json(
        { error: 'Blocked slot not found' },
        { status: 404 }
      )
    }

    // Delete blocked slot
    await prisma.blockedSlot.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Blocked slot deleted'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete blocked slot error:', error)
    return NextResponse.json(
      { error: 'Failed to delete blocked slot' },
      { status: 500 }
    )
  }
}
