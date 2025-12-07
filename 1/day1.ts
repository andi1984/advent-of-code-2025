import { readFileSync, writeFile } from "node:fs";

class Dial {
  static #START_POINT: number = 50;
  static #MIN_POINT: number = 0;
  static #MAX_POINT: number = 99;

  #point: number;
  #zerioCrossings: number = 0;

  constructor() {
    this.#point = Dial.#START_POINT;
  }

  get zeroCrossings(): number {
    return this.#zerioCrossings;
  }

  set zeroCrossings(value: number) {
    this.#zerioCrossings = value;
  }

  get point(): number {
    return this.#point;
  }

  set point(value: number) {
    if (value < Dial.#MIN_POINT || value > Dial.#MAX_POINT) {
      throw new Error(
        `Point must be between ${Dial.#MIN_POINT} and ${
          Dial.#MAX_POINT
        }. Value is ${value}.`
      );
    }
    this.#point = value;
  }

  countZeroCrossings(
    from: number,
    amount: number,
    direction: "R" | "L"
  ): number {
    let crossings = 0;
    for (let i = 1; i < amount; i++) {
      let currentPoint: number;
      if (direction === "R") {
        currentPoint = (from + i) % (Dial.#MAX_POINT + 1);
      } else {
        currentPoint = (from - i) % (Dial.#MAX_POINT + 1);
        if (currentPoint < Dial.#MIN_POINT) {
          currentPoint = Dial.#MAX_POINT + currentPoint + 1; // we need to count 0 inclusive
        }
      }
      if (currentPoint === 0) {
        crossings++;
      }
    }
    return crossings;
  }

  turnRight(amount: number): void {
    this.zeroCrossings =
      this.zeroCrossings + this.countZeroCrossings(this.point, amount, "R");
    this.point = (this.point + amount) % (Dial.#MAX_POINT + 1);
  }

  turnLeft(amount: number): void {
    this.zeroCrossings =
      this.zeroCrossings + this.countZeroCrossings(this.point, amount, "L");
    const targetPosition = (this.point - amount) % (Dial.#MAX_POINT + 1);
    if (targetPosition < Dial.#MIN_POINT) {
      this.point = Dial.#MAX_POINT + 1 + targetPosition; // we need to count 0 inclusive
    } else {
      this.point = targetPosition;
    }
  }
}

(() => {
  const dial = new Dial();

  readFileSync("./input.txt", "utf-8")
    .trim()
    .split("\n")
    .forEach((line: string) => {
      const [direction, amountStr] = line.match(/^([RL])(.*)$/)?.slice(1) ?? [];
      const amount = Number(amountStr);

      if (direction === "R") {
        dial.turnRight(amount);
      } else if (direction === "L") {
        dial.turnLeft(amount);
      } else {
        throw new Error(`Invalid direction: ${direction}`);
      }

      writeFile("./output.txt", dial.point + "\n", { flag: "a+" }, (err) => {
        if (err) {
          console.error("Error writing to output file:", err);
        }
      });
    });

  console.log(`Total zero crossings: ${dial.zeroCrossings}`);
})();
