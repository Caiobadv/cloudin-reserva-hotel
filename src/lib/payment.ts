export async function simulatePayment(
  amount: number,
  cardLast4: string
): Promise<{ success: boolean; transactionId: string }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 95% approval rate
  const approved = Math.random() > 0.05

  const transactionId = `TXN-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`

  return { success: approved, transactionId }
}
