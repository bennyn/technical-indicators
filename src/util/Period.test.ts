import {Period} from './Period';

describe('Period', () => {
  describe('isStable', () => {
    it('returns the lowest and highest value during the period when it is stable', () => {
      // Test data verified with:
      // https://tulipindicators.org/min
      const prices = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const expectations = [
        '81.06',
        '81.06',
        '82.84',
        '82.84',
        '82.84',
        '82.84',
        '82.84',
        '83.99',
        '84.36',
        '84.36',
        '85.53',
      ];
      const period = new Period(5);
      for (const price of prices) {
        period.update(price);
        if (period.isStable) {
          const expected = expectations.shift();
          expect(period.lowest?.toFixed(2)).toBe(expected);
        }
      }
      expect(period.highest?.toFixed(2)).toBe('85.53');
    });
  });
});
