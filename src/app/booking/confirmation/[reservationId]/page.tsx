'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

interface Reservation {
  id: string;
  code: string;
  room: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  durationHours: number;
  status: string;
}

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const reservationId = params.reservationId as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/booking/confirmation/${reservationId}`);
    }
  }, [status, reservationId, router]);

  // Fetch reservation details
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reservations/${reservationId}`);
        if (!response.ok) {
          throw new Error('Reserva não encontrada');
        }
        const result = await response.json();
        setReservation(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar reserva');
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId]);

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

  if (error || !reservation) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-600">Erro: {error || 'Reserva não encontrada'}</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Format date from "YYYY-MM-DD" string
  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow py-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Checkmark Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-black mb-2">
            Reserva Confirmada!
          </h1>
          <p className="text-gray-600 mb-8">
            Sua reserva foi realizada com sucesso.
          </p>

          {/* Reservation Code */}
          <div className="bg-gray-100 border border-black rounded-lg p-8 mb-8">
            <p className="text-sm text-gray-600 mb-2">Código da Reserva</p>
            <p className="text-5xl font-bold text-black mb-4 font-mono">
              {reservation.code}
            </p>
            <p className="text-sm text-gray-600">
              Guarde este código para consultar sua reserva
            </p>
          </div>

          {/* Reservation Summary */}
          <div className="border border-black rounded-lg p-8 mb-8 text-left">
            <h2 className="text-xl font-bold text-black mb-6">Resumo da Reserva</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <span className="text-gray-600">Sala</span>
                <span className="font-semibold text-black">{reservation.room?.name}</span>
              </div>

              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <span className="text-gray-600">Data</span>
                <span className="font-semibold text-black">
                  {formatDate(reservation.date)}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <span className="text-gray-600">Horário</span>
                <span className="font-semibold text-black">
                  {reservation.startTime} - {reservation.endTime}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <span className="text-gray-600">Duração</span>
                <span className="font-semibold text-black">
                  {reservation.durationHours} hora(s)
                </span>
              </div>

              <div className="flex justify-between items-start bg-gray-100 -m-4 p-4 rounded">
                <span className="text-gray-600">Valor Total</span>
                <span className="text-2xl font-bold text-black">
                  R$ {reservation.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/my-reservations"
              className="flex-1 bg-black text-white py-3 px-6 rounded font-semibold hover:bg-gray-800 transition-colors text-center"
            >
              Ver Minhas Reservas
            </Link>
            <Link
              href="/"
              className="flex-1 border border-black text-black py-3 px-6 rounded font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Fazer Nova Reserva
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
