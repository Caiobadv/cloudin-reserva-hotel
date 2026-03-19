'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

type FilterStatus = 'all' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export default function MyReservationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/my-reservations');
    }
  }, [status, router]);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reservations/my');
        if (!response.ok) {
          throw new Error('Erro ao carregar reservas');
        }
        const result = await response.json();
        setReservations(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar reservas'
        );
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchReservations();
    }
  }, [status]);

  const handleCancelReservation = async (reservationId: string) => {
    setCancelingId(reservationId);

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao cancelar reserva');
      }

      // Update local state
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'CANCELLED' } : res
        )
      );
      setConfirmCancel(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Erro ao cancelar reserva'
      );
    } finally {
      setCancelingId(null);
    }
  };

  const filteredReservations = reservations.filter((res) => {
    if (filterStatus === 'all') return true;
    return res.status === filterStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  };

  const canCancelReservation = (res: Reservation) => {
    const reservationDate = new Date(res.date);
    const now = new Date();
    // Can only cancel if reservation is in the future and is confirmed
    return reservationDate > now && res.status === 'CONFIRMED';
  };

  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
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

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Faça login para ver suas reservas</p>
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
          <h1 className="text-3xl font-bold text-black mb-8">Minhas Reservas</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-300 pb-4">
            {(['all', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-4 py-2 font-semibold rounded transition-colors ${
                    filterStatus === tab
                      ? 'bg-black text-white'
                      : 'bg-white text-black border border-black hover:bg-gray-100'
                  }`}
                >
                  {tab === 'all'
                    ? 'Todas'
                    : tab === 'CONFIRMED'
                    ? 'Confirmadas'
                    : tab === 'CANCELLED'
                    ? 'Canceladas'
                    : 'Concluídas'}
                </button>
              )
            )}
          </div>

          {/* Empty State */}
          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {reservations.length === 0
                  ? 'Você ainda não tem reservas'
                  : `Nenhuma reserva ${filterStatus === 'all' ? '' : filterStatus}`}
              </p>
              {reservations.length === 0 && (
                <a
                  href="/"
                  className="inline-block bg-black text-white py-2 px-6 rounded font-semibold hover:bg-gray-800 transition-colors"
                >
                  Fazer uma Reserva
                </a>
              )}
            </div>
          )}

          {/* Reservations Grid */}
          {filteredReservations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-black rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Código</p>
                      <p className="font-bold text-black text-lg font-mono">
                        {reservation.code}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${getStatusBadgeColor(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6 border-t border-gray-300 pt-4">
                    <div>
                      <p className="text-xs text-gray-600">Sala</p>
                      <p className="font-semibold text-black">
                        {reservation.room?.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Data</p>
                      <p className="font-semibold text-black">
                        {formatDate(reservation.date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Horário</p>
                      <p className="font-semibold text-black">
                        {reservation.startTime} - {reservation.endTime}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Valor</p>
                      <p className="font-semibold text-black">
                        R$ {reservation.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {canCancelReservation(reservation) && (
                    <>
                      {confirmCancel === reservation.id ? (
                        <div className="space-y-2">
                          <p className="text-sm text-black font-semibold mb-3">
                            Tem certeza que deseja cancelar?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleCancelReservation(reservation.id)
                              }
                              disabled={cancelingId === reservation.id}
                              className="flex-1 bg-red-600 text-white py-2 px-3 rounded font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 text-sm"
                            >
                              {cancelingId === reservation.id
                                ? 'Cancelando...'
                                : 'Cancelar'}
                            </button>
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="flex-1 border border-black text-black py-2 px-3 rounded font-semibold hover:bg-gray-100 transition-colors text-sm"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancel(reservation.id)}
                          className="w-full border border-red-600 text-red-600 py-2 px-4 rounded font-semibold hover:bg-red-50 transition-colors"
                        >
                          Cancelar Reserva
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
