export interface TimeParts {
  secString: string;
  decimals: string;
}

export class Util {

  /*
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  static timeParts(time: number): TimeParts {
    // Each entry is [minimum number of digits if not first, separator before, value]
    let hours: number = Math.floor(time / (60 * 60 * 1000));
    let minutes: number = Math.floor(time / (     60 * 1000)) % 60;
    let seconds: number = Math.floor(time / (          1000)) % 60;

    /**
     * @param {number} number
     * @param {number} numDigitsAfterPadding
     */
    function pad(number: number, numDigitsAfterPadding: number): string {
      let output: string = "" + number;
      while (output.length < numDigitsAfterPadding) {
        output = "0" + output;
      }
      return output;
    }

    let secString: string;
    if (hours > 0) {
      secString = "" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    } else if (minutes > 0) {
      secString = "" + minutes + ":" + pad(seconds, 2);
    } else {
      secString = "" + seconds;
    }

    let centiseconds: number = Math.floor((time % 1000) / 10);

    return {
      secString: secString,
      decimals: "" + pad(centiseconds, 2)
    };
  }

  static formatTime(time: number): string {
    if (time === null) {
      return "---"
    }

    let parts = this.timeParts(time);
    return parts.secString + "." + parts.decimals;
  }

  static findIndex(array, item) {
    let low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid] < item ? low = mid + 1 : high = mid
    }
    return low;
  }
}
