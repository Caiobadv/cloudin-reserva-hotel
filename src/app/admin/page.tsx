'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Room {
  id: string;
  name: string;
}

interface BlockedSlot {
  id: string;
  room: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blockForm, setBlockForm] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [blocking, setBlocking] = useState(false);

  // Check authorization
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsRes, blockedRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/admin/blocked-slots'),
        ]);

        if (roomsRes.ok) {
          const roomsResult = await roomsRes.json();
          setRooms(roomsResult.data || []);
        }
        if (blockedRes.ok) {
          const blockedResult = await blockedRes.json();
          setBlockedSlots(blockedResult.data || []);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar dados'
        );
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const handleBlockTimeSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !blockForm.roomId ||
      !blockForm.date ||
      !blockForm.startTime ||
      !blockForm.endTime
    ) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setBlocking(true);

    try {
      const response = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: blockForm.roomId,
          date: blockForm.date,
          startTime: blockForm.startTime,
          endTime: blockForm.endTime,
          reason: blockForm.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao bloquear horário');
      }

      const result = await response.json();
      setBlockedSlots((prev) => [result.data, ...prev]);
      setBlockForm({
        roomId: '',
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
      });
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Erro ao bloquear horário'
      );
    } finally {
      setBlocking(false);
    }
  };

  const handleDeleteBlockedSlot = async (slotId: string) => {
    if (!confirm('Tem certeza que deseja desbloquear este horário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blocked-slots/${slotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao desbloquear horário');
      }

      setBlockedSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Erro ao desbloquear horário'
      );
    }
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
    (status === 'authenticated' && session?.user?.role !== 'ADMIN')
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
          <h1 className="text-3xl font-bold text-black mb-8">Painel Administrativo</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Block Time Slot Section */}
          <div className="border border-black rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">
              Bloquear Horário
            </h2>

            <form onSubmit={handleBlockTimeSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Sala
                </label>
                <select
                  value={blockForm.roomId}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, roomId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-black rounded font-medium text-black"
                  required
                >
                  <option value="">Selecione uma sala</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={blockForm.date}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Hora Início
                </label>
                <Input
                  type="time"
                  value={blockForm.startTime}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Hora Fim
                </label>
                <Input
                  type="time"
                  value={blockForm.endTime}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, endTime: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Motivo
                </label>
                <Input
                  type="text"
                  placeholder="Limpeza, Manutenção, etc"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={blocking}
                  className="w-full bg-black text-white py-2 px-4 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {blocking ? 'Bloqueando...' : 'Bloquear'}
                </Button>
              </div>
            </form>
          </div>

          {/* Blocked Slots Section */}
          {blockedSlots.length > 0 && (
            <div className="border border-black rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                Horários Bloqueados
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Sala
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Data</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Horário
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Motivo
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedSlots.map((slot, index) => (
                      <tr
                        key={slot.id}
                        className={
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }
                      >
                        <td className="px-4 py-3 text-black font-semibold">
                          {slot.room?.name}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {formatDate(slot.date)}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {slot.reason || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteBlockedSlot(slot.id)}
                            className="text-red-600 font-semibold hover:text-red-800 transition-colors"
                          >
                            Desbloquear
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
