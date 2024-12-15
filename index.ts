import https from "https";

interface IBinancePrices {
  symbol: string;
  price: number;
}

function fetchData(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", (err) => reject(`Ошибка сети: ${err.message}`));
  });
}

async function fetchBinancePrices(): Promise<IBinancePrices[]> {
  const API_URL = "https://api.binance.com/api/v3/ticker/price";

  try {
    const response = await fetchData(API_URL);
    const rawData: { symbol: string; price: string }[] = JSON.parse(response);

    return rawData.map((item) => ({
      symbol: item.symbol,
      price: parseFloat(item.price),
    }));
  } catch (error) {
    throw new Error(`Ошибка при запросе к апишке: ${error}`);
  }
}

async function main() {
  try {
    const prices = await fetchBinancePrices();

    if (!prices.length) {
      console.log("Запрос прошел но получен пустой список");
      return;
    }

    const sortedPrices = prices.sort((a, b) => a.price - b.price);
    const cheapest = sortedPrices.slice(0, 5);
    const mostExpensive = sortedPrices.slice(-5).reverse();
    const averagePrice =
      prices.reduce((sum, item) => sum + item.price, 0) / prices.length;

    console.log("Самые дешёвые пары:");
    cheapest.forEach((item) => console.log(`${item.symbol}: ${item.price}`));

    console.log("Cамые дорогие пары:");
    mostExpensive.forEach((item) =>
      console.log(`${item.symbol}: ${item.price}`)
    );

    console.log(`Средняя цена: ${averagePrice}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Произошла ошибка: ${error.message}`);
    } else {
      console.error(`Произошла неизвестная ошибка: ${error}`);
    }
  }
}

main();
