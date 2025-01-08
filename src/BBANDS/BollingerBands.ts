import type {BigSource} from 'big.js';
import Big from 'big.js';
import {NotEnoughDataError} from '../error/NotEnoughDataError.js';
import {TechnicalIndicator} from '../Indicator.js';
import {SMA} from '../SMA/SMA.js';
import type {BandsResult, FasterBandsResult} from '../util/BandsResult.js';
import {getFasterAverage, getFasterStandardDeviation, getStandardDeviation} from '../util/index.js';

/**
 * Bollinger Bands (BBANDS)
 * Type: Volatility
 *
 * Bollinger Bands (BBANDS), developed by John A. Bollinger, are set as an envelope around a moving average. Narrow
 * bands indicate a sideways trend (ranging markets). To determine a breakout direction, [Investopia.com
 * suggests](https://www.investopedia.com/articles/technical/04/030304.asp) to use the relative strength index (RSI)
 * along with one or two volume-based indicators such as the intraday intensity index (developed by David Bostian) or
 * the accumulation/distribution index (developed by Larry William).
 *
 * When the upper and lower bands expand, there can be "M" and "W" formations. The "W" formation indicates a bullish
 * movement and the "M" formation indicates a bearish movement.
 *
 * @see https://www.investopedia.com/terms/b/bollingerbands.asp
 */
export class BollingerBands extends TechnicalIndicator<BandsResult, BigSource> {
  public readonly prices: Big[] = [];

  /**
   * @param interval - The time period to be used in calculating the Middle Band
   * @param deviationMultiplier - The number of standard deviations away from the Middle Band that the Upper and Lower
   *   Bands should be
   */
  constructor(
    public readonly interval: number,
    public readonly deviationMultiplier: number = 2
  ) {
    super();
  }

  update(price: BigSource): void | BandsResult {
    this.prices.push(new Big(price));

    if (this.prices.length > this.interval) {
      this.prices.shift();

      const middle = SMA.getResultFromBatch(this.prices);
      const standardDeviation = getStandardDeviation(this.prices, middle);

      return (this.result = {
        lower: middle.sub(standardDeviation.times(this.deviationMultiplier)),
        middle,
        upper: middle.add(standardDeviation.times(this.deviationMultiplier)),
      });
    }
  }

  getResult(): BandsResult {
    if (this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }
}

export class FasterBollingerBands extends TechnicalIndicator<FasterBandsResult, BigSource> {
  public readonly prices: number[] = [];

  constructor(
    public readonly interval: number,
    public readonly deviationMultiplier: number = 2
  ) {
    super();
  }

  update(price: number): void | FasterBandsResult {
    this.prices.push(price);

    if (this.prices.length > this.interval) {
      this.prices.shift();

      const middle = getFasterAverage(this.prices);
      const standardDeviation = getFasterStandardDeviation(this.prices, middle);

      return (this.result = {
        lower: middle - standardDeviation * this.deviationMultiplier,
        middle,
        upper: middle + standardDeviation * this.deviationMultiplier,
      });
    }
  }

  getResult(): FasterBandsResult {
    if (this.result === undefined) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }
}
