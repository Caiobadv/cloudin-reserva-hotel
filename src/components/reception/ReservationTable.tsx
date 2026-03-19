'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface Reservation {
  id: string
  code: string
  clientName: string
  clientPhone: string
  roomName: string
  date: Date | string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
}

interface ReservationTableProps {
  reservations: Reservation[]
  onCheckIn: (reservationId: string) => void | Promise<void>
}

export const ReservationTable: React.FC<ReservationTableProps> = ({
  reservations,
  onCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        reservation.code.toLowerCase().includes(searchLower) ||
        reservation.clientName.toLowerCase().includes(searchLower) ||
        reservation.clientPhone.includes(searchTerm) ||
        reservation.roomName.toLowerCase().includes(searchLower)
      )
    })
  }, [reservations, searchTerm])

  const handleCheckIn = async (reservationId: string) => {
    setLoadingId(reservationId)
    try {
      await onCheckIn(reservationId)
    } finally {
      setLoadingId(null)
    }
  }

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input
        placeholder="Buscar por código, cliente, telefone ou sala..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Sala
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Horário
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-black">
                      {reservation.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {reservation.clientName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {reservation.clientPhone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {reservation.roomName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>
                        <p>{formatDateTime(reservation.date)}</p>
                        <p className="text-xs text-gray-600">
                          {reservation.startTime} - {reservation.endTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={reservation.status}>
                        {reservation.status === 'CONFIRMED'
                          ? 'Confirmado'
                          : reservation.status === 'PENDING'
                          ? 'Pendente'
                          : reservation.status === 'CANCELLED'
                          ? 'Cancelado'
                          : reservation.status === 'COMPLETED'
                          ? 'Concluído'
                          : 'Não Compareceu'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {reservation.status === 'CONFIRMED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCheckIn(reservation.id)}
                          loading={loadingId === reservation.id}
                        >
                          Check-in
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma reserva encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <Card key={reservation.id} padding="md">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-black">
                      {reservation.clientName}
                    </p>
                    <p className="text-xs text-gray-600">
                      Código: {reservation.code}
                    </p>
                  </div>
                  <Badge variant={reservation.status}>
                    {reservation.status === 'CONFIRMED'
                      ? 'Confirmado'
                      : reservation.status === 'PENDING'
                      ? 'Pendente'
                      : reservation.status === 'CANCELLED'
                      ? 'Cancelado'
                      : reservation.status === 'COMPLETED'
                      ? 'Concluído'
                      : 'Não Compareceu'}
                  </Badge>
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <div className="text-sm">
                    <p className="text-gray-600">Sala</p>
                    <p className="font-semibold text-black">
                      {reservation.roomName}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Data e Hora</p>
                    <p className="font-semibold text-black">
                      {formatDateTime(reservation.date)} {reservation.startTime} -
                      {reservation.endTime}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Telefone</p>
                    <p className="font-semibold text-black">
                      {reservation.clientPhone}
                    </p>
                  </div>
                </div>

                {reservation.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleCheckIn(reservation.id)}
                    loading={loadingId === reservation.id}
                    className="w-full"
                  >
                    Check-in
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card padding="md" className="text-center">
            <p className="text-gray-500">Nenhuma reserva encontrada</p>
          </Card>
        )}
      </div>
    </div>
  )
}
