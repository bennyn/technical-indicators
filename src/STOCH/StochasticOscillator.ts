import {Indicator} from '../Indicator';
import Big from 'big.js';
import {SMA} from '../SMA/SMA';
import {ATRCandle} from '../ATR/ATR';
import {MovingAverageTypeContext} from '../MA/MovingAverageTypeContext';
import {MovingAverage} from '../MA/MovingAverage';
import {getMaximum} from '../util/getMaximum';
import {getMinimum} from '../util/getMinimum';
import {NotEnoughDataError} from '../error';

export interface StochasticResult {
  d: Big;
  k: Big;
}

/**
 * Stochastic Oscillator (STOCH)
 * Type: Momentum
 *
 * The Stochastic Oscillator was developed by George Lane and is range-bound between 0 and 100. The Stochastic
 * Oscillator attempts to predict price turning points. A value of 80 indicates that the asset is on the verge of being
 * overbought. By default a Simple Moving Average (SMA) is used. When the momentum starts to slow, the Stochastic
 * Oscillator values start to turn down.
 *
 * The %K values represent the relation between current close to the period's price range (high/low). It is sometimes
 * referred as the "fast" stochastic indicator (fastk). The %D values represent a Moving Average of the %K values. It
 * is sometimes referred as the "slow" stochastic indicator.
 *
 * In the case of an uptrend, prices tend to make higher highs, and the settlement price usually tends to be in the
 * upper end of that time period's trading range.
 *
 * @see https://en.wikipedia.org/wiki/Stochastic_oscillator
 * @see https://www.investopedia.com/terms/s/stochasticoscillator.asp
 */
export class StochasticOscillator implements Indicator<StochasticResult> {
  public readonly d: MovingAverage;

  private readonly candles: ATRCandle[] = [];
  private result?: StochasticResult;

  constructor(
    public readonly periodK: number,
    public readonly periodD: number,
    Indicator: MovingAverageTypeContext = SMA
  ) {
    this.d = new Indicator(periodD);
  }

  getResult(): StochasticResult {
    if (!this.result) {
      throw new NotEnoughDataError();
    }

    return this.result;
  }

  update(candle: ATRCandle): StochasticResult | void {
    this.candles.push(candle);

    if (this.candles.length > this.periodK) {
      this.candles.shift();
    }

    if (this.candles.length === this.periodK) {
      const highest = getMaximum(this.candles.map(candle => candle.high));
      const lowest = getMinimum(this.candles.map(candle => candle.low));
      let fastK = new Big(100).mul(new Big(candle.close).minus(lowest));
      const divisor = new Big(highest).minus(lowest);
      fastK = fastK.div(divisor.eq(0) ? 1 : divisor);
      const dResult = this.d.update(fastK);
      if (dResult) {
        return (this.result = {
          k: fastK,
          d: dResult,
        });
      }
    }
  }

  get isStable(): boolean {
    return this.result !== undefined;
  }
}
