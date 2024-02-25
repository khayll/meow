const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://api.binance.com/api/v3/klines';
const interval = '1d'; // 1 day interval
const initialStartTime = new Date('2017-07-14T12:00:00Z').getTime(); // Start time in milliseconds
const oneDayInMs = 24 * 60 * 60 * 1000; // One day in milliseconds
const chunkSizeInDays = 500; // Number of days per chunk
const chunkSizeInMs = chunkSizeInDays * oneDayInMs; // Convert chunk size to milliseconds
const outputDir = path.join(__dirname, 'data');

const getKlines = async (symbol, startTime, endTime) => {
  try {
    const response = await axios.get(baseUrl, {
      params: {
        symbol: symbol,
        interval: interval,
        startTime: startTime,
        endTime: endTime,
        limit: 1000, // Adjust if necessary, max is 1000
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const downloadKlines = async (symbol) => {
  let startTime = initialStartTime;
  let endTime = startTime + chunkSizeInMs; // End time for the first chunk
  let chunkCounter = 1; // Counter to name the files uniquely

  let returnedIntervals = undefined;
  let totalIntervals = 0;

  while (returnedIntervals > 0 || returnedIntervals === undefined) {
    console.log(`Fetching data for symbol ${symbol} chunk ${chunkCounter}...`);
    const klines = await getKlines(symbol, startTime, endTime);
    returnedIntervals = klines.length;
    totalIntervals += returnedIntervals;
    console.log(`Fetched ${returnedIntervals} intervals of data for chunk ${chunkCounter}`);

    // Save data to a unique file for each chunk
    const fileName = `${symbol}_klines_chunk_${chunkCounter}_${new Date(startTime).toISOString()}_to_${new Date(endTime).toISOString()}.json`;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(klines));
    console.log(`Data for symbol ${symbol} chunk ${chunkCounter} saved to ${fileName}`);

    startTime = endTime + 1; // Set start time for the next chunk to end time of the last chunk + 1 millisecond
    endTime = startTime + chunkSizeInMs; // Set new end time for the next chunk
    chunkCounter++; // Increment the chunk counter
  }

  console.log(`Total intervals of data for symbol ${symbol} fetched: ${totalIntervals}`);
  console.log('All data downloaded and saved successfully.');
};

const downlodSymbols = async (symbols) => {
  symbols.map(async (symbol) => {
    await downloadKlines(symbol);
  });
}

downlodSymbols([
  'BTCUSDT',
  'ETHUSDT',
  'LTCUSDT',
  'BNBUSDT',
  'NEOUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'TRXUSDT',
  'XLMUSDT',
  'EOSUSDT',
]);
