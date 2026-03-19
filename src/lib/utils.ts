export function generateReservationCode(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const randomHex = Math.floor(Math.random() * 0x10000)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  return `CLD-${year}${month}${day}-${randomHex}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatTime(time: string): string {
  return time
}

export function cn(
  ...classes: (string | undefined | false)[]
): string {
  return classes.filter(Boolean).join(' ')
}

export const OPERATING_HOURS = {
  start: 8,
  end: 22,
  days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
}

export const BOOKING_RULES = {
  minHours: 1,
  maxHours: 4,
  minAdvanceHours: 1,
  maxAdvanceDays: 30,
  cancelDeadlineHours: 2,
  pricePerHour: 50,
}

export function getAvailableSlots(date: Date): string[] {
  const slots: string[] = []
  const dayOfWeek = date.getDay()

  // Check if day is in operating days
  if (!OPERATING_HOURS.days.includes(dayOfWeek)) {
    return slots
  }

  for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }

  return slots
}

export function isSlotInPast(date: string, time: string): boolean {
  const [day, month, year] = date.split('/').map(Number)
  const [hour] = time.split(':').map(Number)

  const slotDateTime = new Date(year, month - 1, day, hour, 0, 0)
  const now = new Date()

  return slotDateTime < now
}
