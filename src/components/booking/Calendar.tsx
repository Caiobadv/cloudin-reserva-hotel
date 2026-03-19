'use client'

import React, { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selectedDate?: Date | null
  onSelectDate: (date: Date) => void
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())

  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()))

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleSelectDay = (day: Date) => {
    if (!isBefore(startOfDay(day), startOfDay(new Date()))) {
      onSelectDate(day)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mês anterior"
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-black">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Próximo mês"
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-semibold h-8 flex items-center justify-center',
              day === 'Dom' ? 'text-gray-400' : 'text-black'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDay = isToday(day)
          const isPastDay = isBefore(startOfDay(day), startOfDay(new Date()))
          const isSunday = day.getDay() === 0

          return (
            <button
              key={day.toString()}
              onClick={() => handleSelectDay(day)}
              disabled={isPastDay || isSunday}
              className={cn(
                'h-10 rounded-lg font-medium transition-all duration-200',
                'flex items-center justify-center text-sm',
                !isCurrentMonth && 'text-gray-300',
                isPastDay && 'text-gray-300 cursor-not-allowed',
                isSunday && !isPastDay && 'text-gray-300 cursor-not-allowed',
                isSelected && 'bg-black text-white border-2 border-black',
                isTodayDay &&
                  !isSelected &&
                  'border-2 border-black text-black bg-white',
                !isSelected &&
                  !isTodayDay &&
                  !isPastDay &&
                  !isSunday &&
                  'border-2 border-gray-200 text-black hover:border-black'
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
