import { useEffect, useRef, useState } from "react";

class Debounce {
  timeout?: NodeJS.Timeout;
  callback: (...args: any[]) => any;
  delay: number;

  constructor(fn: (...args: any[]) => any, delay: number) {
    this.callback = fn;
    this.delay = delay;
  }

  debounce(buffer: Debounce[], index: number) {
    this.cancel();
    this.timeout = setTimeout(() => {
      this.callback();
      this.clear(buffer, index);
    }, this.delay);
  }

  cancel() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  clear(buffer: Debounce[], index: number) {
    buffer.splice(index, 1);
  }

  call(buffer: Debounce[], index: number) {
    this.cancel();
    this.callback();
    this.clear(buffer, index);
  }

  stop(buffer: Debounce[], index: number) {
    this.cancel();
    this.clear(buffer, index);
  }

  findDebounce(callback: (...args: any[]) => any, delay: number) {
    const callbackIsEqual = this.callback.toString() === callback.toString();
    const delayIsEqual = this.delay === delay;
    return callbackIsEqual && delayIsEqual;
  }
}

export function useDebounce() {
  const ref = useRef({
    buffer: [] as Debounce[],
    debounce(callback: (...args: any[]) => void, delay: number) {
      let index = this.buffer.findIndex((item) => item.findDebounce(callback, delay));
      if (index !== -1) {
        this.buffer[index].debounce(this.buffer, index);
      } else {
        index = this.buffer.push(new Debounce(callback, delay)) - 1;
        this.buffer[index].debounce(this.buffer, index);
      }
      const buffer = this.buffer;
      return {
        call() {
          buffer[index].call(buffer, index);
        },
        cancel() {
          buffer[index].stop(buffer, index);
        },
      };
    },
  });

  return ref.current.debounce.bind(ref.current);
}
