export function chunkArray(array, size) {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export function formatSymbol(symbol) {
  return `NSE:${symbol}-EQ`;
}

export function sortByChange(quotes) {
  return quotes.sort((a, b) => b.change - a.change);
}

export function topGainers(quotes, count) {
  return quotes.slice(0, count);
}

export function filterByChange(quotes, min, max) {
  return quotes.filter(
    stock => stock.change >= min && stock.change < max
  );
}

export function candleBody(open, close) {
  return Math.abs(((close - open) / open) * 100);
}

export function tradedValue(volume, close) {
  return volume * close;
}
