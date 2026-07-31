import {
  MIN_CHANGE,
  MAX_CHANGE,
  MIN_CANDLE_BODY,
  MIN_TRADED_VALUE
} from "./config.js";

export function filterStocks(stocks) {

  return stocks.filter(stock => {

    return (
      stock.change >= MIN_CHANGE &&
      stock.change < MAX_CHANGE &&
      stock.body >= MIN_CANDLE_BODY &&
      stock.value >= MIN_TRADED_VALUE
    );

  });

}
