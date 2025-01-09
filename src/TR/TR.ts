import Big from 'big.js';
import {BigIndicatorSeries, NumberIndicatorSeries} from '../Indicator.js';
import {getMaximum} from '../util/getMaximum.js';
import type {HighLowClose, HighLowCloseNumber} from '../util/HighLowClose.js';

/**
 * True Range (TR)
 * Type: Volatility
 *
 * The True Range (TR) was developed by **John Welles Wilder, Jr.**. The range (R) is a candle's highest price minus
 * it's lowest price. The true range extends it to yesterday's closing price if it was outside of the current range.
 *
 * Low return values indicate a sideways trend with little volatility.
 *
 * @see https://www.linnsoft.com/techind/true-range-tr
 */
export class TR extends BigIndicatorSeries<HighLowClose> {
  private previousCandle?: HighLowClose;
  private twoPreviousCandle?: HighLowClose;

  update(candle: HighLowClose, replace: boolean): Big {
    const high = new Big(candle.high);
    const highLow = high.minus(candle.low);

    if (this.previousCandle && replace) {
      this.previousCandle = this.twoPreviousCandle;
    }

    if (this.previousCandle) {
      const highClose = high.minus(this.previousCandle.close).abs();
      const lowClose = new Big(candle.low).minus(this.previousCandle.close).abs();
      this.twoPreviousCandle = this.previousCandle;
      this.previousCandle = candle;
      return this.setResult(getMaximum([highLow, highClose, lowClose]), replace);
    }
    this.twoPreviousCandle = this.previousCandle;
    this.previousCandle = candle;

    return this.setResult(highLow, replace);
  }
}

export class FasterTR extends NumberIndicatorSeries<HighLowCloseNumber> {
  private previousCandle?: HighLowCloseNumber;
  private twoPreviousCandle?: HighLowCloseNumber;

  update(candle: HighLowCloseNumber, replace: boolean): number {
    const {high, low} = candle;
    const highLow = high - low;

    if (this.previousCandle && replace) {
      this.previousCandle = this.twoPreviousCandle;
    }

    if (this.previousCandle) {
      const highClose = Math.abs(high - this.previousCandle.close);
      const lowClose = Math.abs(low - this.previousCandle.close);
      this.twoPreviousCandle = this.previousCandle;
      this.previousCandle = candle;
      return this.setResult(Math.max(highLow, highClose, lowClose), replace);
    }
    this.twoPreviousCandle = this.previousCandle;
    this.previousCandle = candle;
    return this.setResult(highLow, replace);
  }
}
