'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  image?: string;
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error('Falha ao carregar salas');
        }
        const result = await response.json();
        setRooms(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
              Sua sala de reunião perfeita
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Reserve a sala ideal para sua reunião de forma rápida e fácil
            </p>
          </div>
        </section>

        {/* Rooms Section */}
        <section className="bg-white py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-12 text-center">
              Salas Disponíveis
            </h2>

            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Carregando salas...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">Erro: {error}</p>
              </div>
            )}

            {!loading && !error && rooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">Nenhuma sala disponível no momento</p>
              </div>
            )}

            {!loading && !error && rooms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-black rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {room.image && (
                      <div className="w-full h-40 bg-gray-200 rounded mb-4 overflow-hidden">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-black mb-2">
                      {room.name}
                    </h3>
                    <p className="text-gray-700 mb-4">{room.description}</p>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Capacidade:</span> {room.capacity} pessoas
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Preço:</span> R$ {room.pricePerHour.toFixed(2)}/hora
                      </p>
                    </div>
                    <Link
                      href={`/rooms/${room.id}`}
                      className="block w-full bg-black text-white py-2 px-4 rounded font-semibold text-center hover:bg-gray-800 transition-colors"
                    >
                      Ver Disponibilidade
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
