'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type TimeSlotStatus = 'available' | 'booked' | 'blocked' | 'past'

export interface TimeSlot {
  time: string
  status: TimeSlotStatus
}

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedSlots?: string[]
  onToggleSlot: (time: string) => void
  maxSlots?: number
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  slots,
  selectedSlots = [],
  onToggleSlot,
  maxSlots = 4,
}) => {
  const getStatusStyles = (status: TimeSlotStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-black text-white border-2 border-black'
    }

    switch (status) {
      case 'available':
        return 'bg-white text-black border-2 border-gray-300 hover:border-black cursor-pointer'
      case 'booked':
        return 'bg-gray-200 text-gray-700 cursor-not-allowed'
      case 'blocked':
        return 'bg-gray-200 text-gray-700 cursor-not-allowed'
      case 'past':
        return 'bg-gray-100 text-gray-400 cursor-not-allowed'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: TimeSlotStatus) => {
    switch (status) {
      case 'booked':
        return 'Ocupado'
      case 'blocked':
        return 'Indisponível'
      case 'past':
        return 'Encerrado'
      default:
        return ''
    }
  }

  const handleToggle = (slot: TimeSlot) => {
    if (slot.status !== 'available') return

    const isSelected = selectedSlots.includes(slot.time)

    if (!isSelected && selectedSlots.length >= maxSlots) {
      return
    }

    onToggleSlot(slot.time)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.time)
          const isDisabled = slot.status !== 'available'

          return (
            <button
              key={slot.time}
              onClick={() => handleToggle(slot)}
              disabled={isDisabled}
              className={cn(
                'py-3 px-2 rounded-lg font-semibold transition-all duration-200',
                'text-center text-sm whitespace-nowrap',
                getStatusStyles(slot.status, isSelected)
              )}
            >
              {slot.time}
              {slot.status !== 'available' && (
                <div className="text-xs mt-1">{getStatusLabel(slot.status)}</div>
              )}
            </button>
          )
        })}
      </div>

      {selectedSlots.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-black">{selectedSlots.length}</span> horário(s)
            selecionado(s)
            {selectedSlots.length < maxSlots && (
              <span> (máximo {maxSlots})</span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedSlots.map((time) => (
              <span key={time} className="bg-black text-white px-2 py-1 rounded text-xs">
                {time}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
