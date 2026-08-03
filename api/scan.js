import quotesHandler from "./quotes.js";

export default async function handler(req, res) {
  return quotesHandler(req, res);
}
