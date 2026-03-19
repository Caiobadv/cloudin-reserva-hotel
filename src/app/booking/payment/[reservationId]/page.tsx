'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Reservation {
  id: string;
  code: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  status: string;
  room: { name: string };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const reservationId = params.reservationId as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/booking/payment/${reservationId}`);
    }
  }, [status, reservationId, router]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reservations/${reservationId}`);
        if (!response.ok) throw new Error('Reserva não encontrada');
        const result = await response.json();
        setReservation(result.data || result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar reserva');
      } finally {
        setLoading(false);
      }
    };
    if (reservationId) fetchReservation();
  }, [reservationId]);

  const maskCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  const maskExpiry = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
  const maskCvv = (v: string) => v.replace(/\D/g, '').slice(0, 4);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      setError('Preencha todos os campos do cartão');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName: cardHolder,
          expiry,
          cvv,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      if (result.data?.payment?.status === 'APPROVED') {
        router.push(`/booking/confirmation/${reservationId}`);
      } else {
        setError('Pagamento recusado. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
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

  if (!reservation) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-600">{error || 'Reserva não encontrada'}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Finalizar Pagamento</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo */}
            <div className="border border-black rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-6">Resumo da Reserva</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600">Código</p>
                  <p className="text-xl font-bold">{reservation.code}</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600">Sala</p>
                  <p className="font-semibold">{reservation.room?.name}</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-semibold">{formatDate(reservation.date)}</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-semibold">{reservation.startTime} - {reservation.endTime}</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="font-semibold">{reservation.durationHours}h</p>
                </div>
                <div className="bg-black text-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-300 mb-1">Valor Total</p>
                  <p className="text-3xl font-bold">R$ {reservation.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="border border-black rounded-lg p-6">
              <h2 className="text-xl font-bold text-black mb-6">Dados do Cartão</h2>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(maskCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Nome do Titular</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nome como no cartão"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Validade</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(maskExpiry(e.target.value))}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(maskCvv(e.target.value))}
                      placeholder="000"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                {processing && (
                  <div className="bg-gray-100 border border-gray-300 rounded p-3 text-center">
                    <p className="text-sm text-gray-700">Processando pagamento...</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-black text-white py-3 px-4 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {processing ? 'Processando...' : `Pagar R$ ${reservation.totalPrice.toFixed(2)}`}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Pagamento simulado — nenhuma cobrança real será feita.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
