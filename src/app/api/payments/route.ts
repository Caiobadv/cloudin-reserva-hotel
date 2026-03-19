import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { simulatePayment } from '@/lib/payment'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reservationId, cardNumber, cardName, expiry, cvv } = await request.json()

    if (!reservationId || !cardNumber || !cardName || !expiry || !cvv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Reservation is not pending payment' }, { status: 400 })
    }

    const last4 = cardNumber.slice(-4)

    // simulatePayment(amount, cardLast4) — returns { success, transactionId }
    const paymentResult = await simulatePayment(reservation.totalPrice, last4)

    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount: reservation.totalPrice,
        simulatedCardLast4: last4,
        status: paymentResult.success ? 'APPROVED' : 'REJECTED',
        transactionId: paymentResult.transactionId,
        processedAt: new Date(),
      }
    })

    if (paymentResult.success) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        payment,
        reservation: {
          id: reservation.id,
          code: reservation.code,
          status: paymentResult.success ? 'CONFIRMED' : 'PENDING'
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}
