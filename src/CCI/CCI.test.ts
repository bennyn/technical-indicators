import {CCI} from './CCI';

describe('CCI', () => {
  it('calculates the Commodity Channel Index (CCI)', () => {
    // Test data verified with:
    // https://tulipindicators.org/cci
    const candles = [
      {high: 83.85, low: 83.07, close: 83.61},
      {high: 83.9, low: 83.11, close: 83.15},
      {high: 83.33, low: 82.49, close: 82.84},
      {high: 84.3, low: 82.3, close: 83.99},
      {high: 84.84, low: 84.15, close: 84.55},
      {high: 85.0, low: 84.11, close: 84.36},
      {high: 85.9, low: 84.03, close: 85.53},
      {high: 86.58, low: 85.39, close: 86.54},
      {high: 86.98, low: 85.76, close: 86.89},
      {high: 88.0, low: 87.17, close: 87.77},
      {high: 87.87, low: 87.01, close: 87.29},
    ];
    const expectations = ['166.67', '82.02', '95.50', '130.91', '99.16', '116.34', '71.93'];
    const cci = new CCI(5);
    for (const candle of candles) {
      cci.update(candle);
      if (cci.isStable) {
        const expected = expectations.shift();
        expect(cci.getResult().toFixed(2)).toBe(expected!);
      }
    }
    const actual = cci.getResult().toFixed(2);
    expect(actual).toBe('71.93');
  });
});
