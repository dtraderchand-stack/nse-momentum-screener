export function sortByChange(quotes) {

  return quotes
    .filter(stock => stock.change !== undefined)
    .sort((a, b) => b.change - a.change);

}

export function getTopGainers(quotes, limit = 100) {

  const sorted = sortByChange(quotes);

  return sorted.slice(0, limit);

}
