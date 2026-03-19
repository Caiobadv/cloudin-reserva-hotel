'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar } from '@/components/booking/Calendar';
import { TimeSlots } from '@/components/booking/TimeSlots';
import { Button } from '@/components/ui/Button';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
}

interface SlotData {
  time: string;
  status: 'available' | 'booked' | 'blocked' | 'past';
}

export default function RoomBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/rooms/${roomId}`);
    }
  }, [status, roomId, router]);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) throw new Error('Sala não encontrada');
        const result = await response.json();
        setRoom(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar sala');
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchRoom();
  }, [roomId]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setSlotsLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/rooms/${roomId}/availability?date=${dateStr}`);
        if (!response.ok) throw new Error('Erro ao carregar disponibilidade');
        const result = await response.json();
        setTimeSlots(result.data?.slots || []);
        setSelectedSlots([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar slots');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, roomId]);

  const handleToggleSlot = (time: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      }
      if (prev.length >= 4) return prev; // max 4 hours
      return [...prev, time].sort();
    });
  };

  const sortedSelectedSlots = [...selectedSlots].sort();
  const startTime = sortedSelectedSlots[0] || '';
  const lastSlot = sortedSelectedSlots[sortedSelectedSlots.length - 1] || '';
  const endHour = lastSlot ? parseInt(lastSlot.split(':')[0]) + 1 : 0;
  const endTime = lastSlot ? `${String(endHour).padStart(2, '0')}:00` : '';
  const duration = selectedSlots.length;
  const totalPrice = duration * (room?.pricePerHour || 0);

  const handleConfirmBooking = async () => {
    if (!selectedDate || selectedSlots.length === 0 || !room) {
      setError('Selecione uma data e horários');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          date: dateStr,
          startTime,
          endTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar reserva');
      }

      const reservationId = result.data?.id || result.id;
      router.push(`/booking/payment/${reservationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">{error || 'Sala não encontrada'}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Reservar: {room.name}</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Calendar and Slots */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Info */}
              <div className="border border-black rounded-lg p-6">
                <h2 className="text-2xl font-bold text-black mb-4">{room.name}</h2>
                <p className="text-gray-700 mb-4">{room.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Capacidade</p>
                    <p className="font-semibold text-black">{room.capacity} pessoas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor/hora</p>
                    <p className="font-semibold text-black">
                      R$ {room.pricePerHour.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="border border-black rounded-lg p-6">
                <h3 className="text-xl font-bold text-black mb-4">Selecionar Data</h3>
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="border border-black rounded-lg p-6">
                  <h3 className="text-xl font-bold text-black mb-4">
                    Horários Disponíveis
                  </h3>
                  {slotsLoading ? (
                    <p className="text-gray-600">Carregando horários...</p>
                  ) : (
                    <TimeSlots
                      slots={timeSlots}
                      selectedSlots={selectedSlots}
                      onToggleSlot={handleToggleSlot}
                      maxSlots={4}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Summary */}
            <div>
              <div className="border border-black rounded-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-black mb-4">Resumo da Reserva</h3>

                {selectedSlots.length === 0 ? (
                  <p className="text-gray-500">Selecione uma data e horários para ver o resumo.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Sala:</span>
                      <span className="font-semibold">{room.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-semibold">
                        {selectedDate?.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Horário:</span>
                      <span className="font-semibold">{startTime} - {endTime}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Duração:</span>
                      <span className="font-semibold">{duration}h</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Valor/hora:</span>
                      <span className="font-semibold">R$ {room.pricePerHour.toFixed(2)}</span>
                    </div>

                    <div className="bg-gray-100 border-2 border-black rounded-lg p-4 flex justify-between items-center mt-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-bold">R$ {totalPrice.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                      className="w-full bg-black text-white py-3 px-4 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-4"
                    >
                      {submitting ? 'Processando...' : 'Confirmar e Pagar'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
