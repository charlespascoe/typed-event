# Strongly-Typed Events for TypeScript

Brings C#-like events to TypeScript, as classic JavaScript events mechanisms like EventEmitter aren't type safe.

The events optionally support weak-referenced handlers, which can help prevent memory leaks by allowing the garbage collector to delete objects when there's only an event referencing it.

# Installation

`$ npm install --save typed-event`

# Usage

A simple event on a class:

```typescript

import { Event } from 'typed-event';

class Foo {
  public readonly barEvent: Event = new Event();

  public bar() {
    this.barEvent.emit();
  }
}

let foo = new Foo();

foo.barEvent.register(() => console.log('bar!'));

foo.bar();

// Outputs:
// bar!
```

You can also specify an event that has an argument:

```typescript
import { EventWithArgs } from 'typed-event';

class FooArg {
  public readonly barEvent: EventWithArgs<string> = new EventWithArgs<string>();

  public bar(msg: string) {
    this.barEvent.emit(msg);
  }
}

let fooArg = new FooArg();

fooArg.barEvent.register((msg: string) => console.log(msg));

fooArg.bar('Hello, world!');

// Outputs:
// Hello, world!
```

You can also register event handlers that only get run once:

```typescript
let foo = new Foo();

foo.barEvent.once(() => console.log('This will only get run once!'))

foo.bar();
foo.bar();
foo.bar();
```

To unregister an event, pass the event handler function into `unregister`. If you're using lambdas, `register` and `once` will return the handler.

```typescript
let foo = new Foo();

let handler = foo.barEvent.register(() => console.log('Handler!'));

foor.bar();

foo.barEvent.unregister(handler);

foo.bar();
```

## Weak Referencing

Events currently default to [weakly referencing](https://en.wikipedia.org/wiki/Weak_reference) event handlers if the platform supports it, otherwise falling back to strong referencing. This allows the handlers and objects associated with them to be removed by the garbage collector if there are no strong references to them. However, you may want strong referencing for self-contained event handlers such as loggers. To disable weak referencing, pass in `false` to the event handler constructor:

```typescript
Event barEvent: Event = new Event(false);
Event bargEvent: EventWithArgs<T> = new EventWithArgs<T>(false);
```
