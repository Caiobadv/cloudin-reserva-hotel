'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface BookingSummaryProps {
  room: {
    name: string
    id: string
  }
  date: Date
  startTime: string
  endTime: string
  duration: number
  totalPrice: number
  onConfirm: () => void
  loading?: boolean
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  room,
  date,
  startTime,
  endTime,
  duration,
  totalPrice,
  onConfirm,
  loading = false,
}) => {
  const pricePerHour = totalPrice / duration

  return (
    <Card title="Resumo da Reserva" className="space-y-4">
      {/* Booking Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700">Sala:</span>
          <span className="font-semibold text-black">{room.name}</span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700">Data:</span>
          <span className="font-semibold text-black">
            {format(date, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700">Horário:</span>
          <span className="font-semibold text-black">
            {startTime} - {endTime}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700">Duração:</span>
          <span className="font-semibold text-black">
            {duration} {duration === 1 ? 'hora' : 'horas'}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700">Valor por hora:</span>
          <span className="font-semibold text-black">
            R$ {pricePerHour.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total Price - Prominent */}
      <div className="bg-gray-100 border-2 border-black rounded-lg p-4 flex justify-between items-center">
        <span className="text-lg font-bold text-black">Total:</span>
        <span className="text-2xl font-bold text-black">
          R$ {totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Confirm Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onConfirm}
        loading={loading}
        className="w-full"
      >
        {loading ? 'Processando...' : 'Confirmar Reserva'}
      </Button>
    </Card>
  )
}
