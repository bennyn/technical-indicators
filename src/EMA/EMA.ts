import {Big, BigSource} from '../index.js';
import {FasterMovingAverage, MovingAverage} from '../MA/MovingAverage.js';
import {NotEnoughDataError} from '../error/index.js';

/**
 * Exponential Moving Average (EMA)
 * Type: Trend
 *
 * Compared to SMA, the EMA puts more emphasis on the recent prices to reduce lag. Due to its responsiveness to price changes, it rises faster and falls faster than the SMA when the price is inclining or declining.
 *
 * @see https://www.investopedia.com/terms/e/ema.asp
 */
export class EMA extends MovingAverage {
  private pricesCounter = 0;
  private readonly weightFactor: number;

  constructor(public readonly interval: number) {
    super(interval);
    this.weightFactor = 2 / (this.interval + 1);
  }

  update(_price: BigSource): Big {
    this.pricesCounter++;
    const price = new Big(_price);

    // If it's the first update there is no previous result and a default has to be set.
    if (this.result === undefined) {
      this.result = price;
    }

    return this.setResult(price.times(this.weightFactor).add(this.result.times(1 - this.weightFactor)));
  }

  override getResult(): Big {
    if (this.pricesCounter < this.interval) {
      throw new NotEnoughDataError();
    }

    return this.result!;
  }

  override get isStable(): boolean {
    try {
      this.getResult();
      return true;
    } catch {
      return false;
    }
  }

  getResultFromBatch(prices: BigSource[]): Big {
    let result: Big | null = null;
    const weightFactor = 2 / (prices.length + 1);
    prices.forEach(price => {
      if (result) {
        result = new Big(price).times(weightFactor).add(result.times(1 - weightFactor));
      } else {
        result = new Big(price);
      }
    });
    return result || new Big(0);
  }
}

export class FasterEMA extends FasterMovingAverage {
  private pricesCounter = 0;
  private readonly weightFactor: number;

  constructor(public readonly interval: number) {
    super(interval);
    this.weightFactor = 2 / (this.interval + 1);
  }

  update(price: number): number {
    this.pricesCounter++;

    // If it's the first update there is no previous result and a default has to be set.
    if (this.result === undefined) {
      this.result = price;
    }

    return this.setResult(price * this.weightFactor + this.result * (1 - this.weightFactor));
  }

  override getResult(): number {
    if (this.pricesCounter < this.interval) {
      throw new NotEnoughDataError();
    }

    return this.result!;
  }

  override get isStable(): boolean {
    try {
      this.getResult();
      return true;
    } catch {
      return false;
    }
  }

  getResultFromBatch(prices: number[]): number {
    let result: number | undefined;
    const weightFactor = 2 / (prices.length + 1);
    prices.forEach(price => {
      if (result !== undefined) {
        result = price * weightFactor + result * (1 - weightFactor);
      } else {
        result = price;
      }
    });

    return result!;
  }
}
