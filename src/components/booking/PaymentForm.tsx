'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export interface CardData {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
}

interface PaymentFormProps {
  amount: number
  onSubmit: (cardData: CardData) => void
  loading?: boolean
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CardData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  })

  const [errors, setErrors] = useState<Partial<CardData>>({})

  const maskCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .slice(0, 19)
  }

  const maskExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(?=\d)/, '$1/')
      .slice(0, 5)
  }

  const maskCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let maskedValue = value

    if (name === 'cardNumber') {
      maskedValue = maskCardNumber(value)
    } else if (name === 'expiryDate') {
      maskedValue = maskExpiryDate(value)
    } else if (name === 'cvv') {
      maskedValue = maskCVV(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: maskedValue,
    }))

    if (errors[name as keyof CardData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CardData> = {}

    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Número do cartão é obrigatório'
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nome do titular é obrigatório'
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Data de expiração é obrigatória'
    }
    if (!formData.cvv) {
      newErrors.cvv = 'CVV é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <Card title="Informações de Pagamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Display */}
        <div className="bg-black text-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-300 mb-1">Valor a pagar</p>
          <p className="text-3xl font-bold">R$ {amount.toFixed(2)}</p>
        </div>

        {/* Card Number */}
        <Input
          label="Número do Cartão"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          placeholder="0000 0000 0000 0000"
          error={errors.cardNumber}
          maxLength={19}
        />

        {/* Cardholder Name */}
        <Input
          label="Nome do Titular"
          name="cardholderName"
          value={formData.cardholderName}
          onChange={handleChange}
          placeholder="Seu Nome Completo"
          error={errors.cardholderName}
        />

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Validade (MM/YY)"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            error={errors.expiryDate}
            maxLength={5}
          />

          <Input
            label="CVV"
            name="cvv"
            type="password"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="000"
            error={errors.cvv}
            maxLength={4}
          />
        </div>

        {/* Processing Message */}
        {loading && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-700 font-medium">
              Processando seu pagamento...
            </p>
          </div>
        )}

        {/* Pay Button */}
        <Button
          variant="primary"
          size="lg"
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          Pagar R$ {amount.toFixed(2)}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Seus dados são seguros e criptografados.
        </p>
      </form>
    </Card>
  )
}
