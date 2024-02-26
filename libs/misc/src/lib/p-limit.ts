/* eslint-disable @typescript-eslint/no-explicit-any */
// https://github.com/sindresorhus/yocto-queue/blob/main/index.js

export interface LimitFunction {
  /**
      The number of promises that are currently running.
      */
  readonly activeCount: number;

  /**
      The number of promises that are waiting to run (i.e. their internal `fn` was not called yet).
      */
  readonly pendingCount: number;

  /**
      Discard pending promises that are waiting to run.
      This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.
      Note: This does not cancel promises that are already running.
      */
  clearQueue: () => void;

  /**
      @param fn - Promise-returning/async function.
      @param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
      @returns The promise returned by calling `fn(...arguments)`.
      */
  <Arguments extends unknown[], ReturnType>(
    fn: (...args: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...args: Arguments
  ): Promise<ReturnType>;
}

/*
  How it works:
  `this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
  */

class Node {
  value;
  next: any;

  constructor(value: any) {
    this.value = value;
  }
}

class Queue {
  #head: any;
  #tail: any;
  #size: any;

  constructor() {
    this.clear();
  }

  enqueue(value: any) {
    const node = new Node(value);

    if (this.#head) {
      this.#tail.next = node;
      this.#tail = node;
    } else {
      this.#head = node;
      this.#tail = node;
    }

    this.#size++;
  }

  dequeue() {
    const current = this.#head;
    if (!current) {
      return;
    }

    this.#head = this.#head.next;
    this.#size--;
    return current.value;
  }

  clear() {
    this.#head = undefined;
    this.#tail = undefined;
    this.#size = 0;
  }

  get size() {
    return this.#size;
  }

  *[Symbol.iterator]() {
    let current = this.#head;

    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

export function pLimit(concurrency: any): Promise<LimitFunction> {
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up');
  }

  const queue = new Queue();
  let activeCount = 0;

  const next = () => {
    activeCount--;

    if (queue.size > 0) {
      queue.dequeue()();
    }
  };

  const run = async (fn: any, resolve: any, args: any) => {
    activeCount++;

    const result = (async () => fn(...args))();

    resolve(result);

    try {
      await result;
    } catch {
      //
    }

    next();
  };

  const enqueue = (fn: any, resolve: any, args: any) => {
    queue.enqueue(run.bind(undefined, fn, resolve, args));

    (async () => {
      // This function needs to wait until the next microtask before comparing
      // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
      // when the run function is dequeued and called. The comparison in the if-statement
      // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
      await Promise.resolve();

      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()();
      }
    })();
  };

  const generator = (fn: any, ...args: any) =>
    new Promise((resolve) => {
      enqueue(fn, resolve, args);
    });

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.size,
    },
    clearQueue: {
      value: () => {
        queue.clear();
      },
    },
  });

  return generator as unknown as Promise<LimitFunction>;
}
