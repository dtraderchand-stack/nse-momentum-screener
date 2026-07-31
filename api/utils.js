export function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

export function formatSymbol(symbol) {
  return `NSE:${symbol}-EQ`;
}

export function calculateCandleBody(open, close) {
  return Math.abs(((close - open) / open) * 100);
}

export function calculateTradedValue(volume, close) {
  return volume * close;
}
