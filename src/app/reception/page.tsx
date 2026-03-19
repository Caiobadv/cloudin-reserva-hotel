'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReservationTable } from '@/components/reception/ReservationTable';
import { Input } from '@/components/ui/Input';

interface Reservation {
  id: string;
  code: string;
  user: { name: string; phone: string };
  room: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  checkin: object | null;
}

export default function ReceptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/reception');
    } else if (
      status === 'authenticated' &&
      session?.user?.role !== 'RECEPTION' &&
      session?.user?.role !== 'ADMIN'
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/reservations?date=${selectedDate}`
        );
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
  }, [selectedDate, status]);

  // Filter reservations based on search term
  useEffect(() => {
    const filtered = reservations.filter(
      (res) =>
        res.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReservations(filtered);
  }, [searchTerm, reservations]);

  const handleCheckIn = async (reservationId: string) => {
    setCheckingInId(reservationId);

    try {
      const response = await fetch('/api/reception/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer check-in');
      }

      // Update local state
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, checkin: { timestamp: new Date().toISOString() } } : res
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Erro ao fazer check-in'
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
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

  if (
    status === 'unauthenticated' ||
    (status === 'authenticated' &&
      session?.user?.role !== 'RECEPTION' &&
      session?.user?.role !== 'ADMIN')
  ) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Acesso negado</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">
                Painel da Recepção
              </h1>
              <p className="text-gray-600">
                Hoje: {formatDate(selectedDate)}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-black mb-2">
                Selecionar Data
              </label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-black mb-2">
                Buscar (nome ou código)
              </label>
              <Input
                id="search"
                type="text"
                placeholder="João Silva ou RES-12345"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Reservation Table */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 border border-gray-300 rounded-lg">
              <p className="text-gray-600">
                {reservations.length === 0
                  ? 'Nenhuma reserva para este dia'
                  : 'Nenhuma reserva encontrada'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-black rounded-lg">
              <table className="w-full">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Código</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Hóspede
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Telefone</th>
                    <th className="px-4 py-3 text-left font-semibold">Sala</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Horário
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation, index) => (
                    <tr
                      key={reservation.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-black">
                        {reservation.code}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {reservation.user?.name}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {reservation.user?.phone}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {reservation.room?.name}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {reservation.startTime} - {reservation.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            reservation.checkin !== null
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reservation.checkin !== null ? 'Realizado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {reservation.checkin === null && (
                          <button
                            onClick={() => handleCheckIn(reservation.id)}
                            disabled={checkingInId === reservation.id}
                            className="bg-black text-white py-2 px-4 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 text-sm"
                          >
                            {checkingInId === reservation.id
                              ? 'Processando...'
                              : 'Check-in'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600">
            <p>
              Total de reservas: <span className="font-semibold">{filteredReservations.length}</span> |
              Check-ins realizados:{' '}
              <span className="font-semibold">
                {filteredReservations.filter((r) => r.checkin !== null).length}
              </span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
