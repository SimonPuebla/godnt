/**
 * Escalating pricing engine.
 * Price for message n = $1.00 * 1.20^(n-1)
 * First message: $1.00
 * Second: $1.20
 * Third: $1.44
 * etc.
 *
 * TODO: Connect to payment processor (Stripe recommended)
 */

export function getMessagePrice(messageCount: number): number {
  // messageCount = number of previous messages sent to this side
  return 1.0 * Math.pow(1.2, messageCount)
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function getPriceLadder(startCount: number, steps = 4): Array<{ n: number; price: string }> {
  return Array.from({ length: steps }, (_, i) => ({
    n: startCount + i + 1,
    price: formatPrice(getMessagePrice(startCount + i)),
  }))
}
