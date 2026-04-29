import type { AssistantMessage, AssistantMessageEvent } from "./schema";
import { Effect } from "effect";

/**
 * Generic event stream class for async iteration
 */
export class EventStream<T, R = T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private waiting: ((value: IteratorResult<T>) => void)[] = [];
  private done = false;
  private finalResultPromise: Promise<R>;
  private resolveFinalResult!: (result: R) => void;

  constructor(
    private isComplete: (event: T) => boolean,
    private extractResult: (event: T) => R,
  ) {
    this.finalResultPromise = new Promise((resolve) => {
      this.resolveFinalResult = resolve;
    });
  }

  push(event: T): void {
    if (this.done) return;

    if (this.isComplete(event)) {
      this.done = true;
      this.resolveFinalResult(this.extractResult(event));
    }

    const waiter = this.waiting.shift();
    if (waiter) {
      waiter({ value: event, done: false });
    } else {
      this.queue.push(event);
    }
  }

  end(result?: R): void {
    this.done = true;
    if (result !== undefined) {
      this.resolveFinalResult(result);
    }

    while (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      waiter({ value: undefined as any, done: true });
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    while (true) {
      if (this.queue.length > 0) {
        yield this.queue.shift()!;
      } else if (this.done) {
        return;
      } else {
        const result = await new Promise<IteratorResult<T>>((resolve) =>
          this.waiting.push(resolve),
        );
        if (result.done) return;
        yield result.value;
      }
    }
  }

  result(): Promise<R> {
    return this.finalResultPromise;
  }
}

export class AssistantMessageEventStream extends EventStream<
  AssistantMessageEvent,
  AssistantMessage
> {
  constructor() {
    super(
      //isComplete: check if the event is the final event
      (event) => event.type === "done" || event.type === "error",
      //extractResult: extract the result from the event
      (event) => {
        if (event.type === "done") {
          return event.message;
        } else if (event.type === "error") {
          return event.error;
        }
        // Never reached, but required by the type system
        throw new Error("Unexpected event type for final result");
      },
    );
  }
}

/**
 * Create a new AssistantMessageEventStream effect.
 *
 * @example
 * Effect.runPromise(Effect.gen(function*() {
 *   const stream = yield* makeAssistantMessageEventStream();
 *
 *   yield* Effect.promise(async () => {
 *     for await (const event of stream) {
 *       console.log(event);
 *     }
 *   });
 *
 *   const result = yield* Effect.promise(() => stream.result());
 *   console.log(result);
 * }));
 */
export const makeAssistantMessageEventStream = (): Effect.Effect<
  AssistantMessageEventStream,
  never,
  never
> => Effect.sync(() => new AssistantMessageEventStream());
