
interface ISimpleCollection<T extends object> {
  add(item: T): ISimpleCollection<T>;

  delete(item: T): void;

  forEach(func: (item: T) => void): void;
}


class WeakMapCollection<T extends object> implements ISimpleCollection<T> {
  private weakMap: WeakMap<object,T> = new WeakMap<object,T>();

  private keys: Set<object> = new Set<object>();

  public add(item: T): ISimpleCollection<T> {
    let key = {};
    this.keys.add(key);
    this.weakMap.set(key, item);
    return this;
  }

  public delete(item: T): void {
    this.keys.forEach(key => {
      if (!this.weakMap.has(key)) {
        this.keys.delete(key);
      } else if (this.weakMap.get(key) === item) {
        this.weakMap.delete(key);
        this.keys.delete(key);
      }
    });
  }

  public forEach(func: (item: T) => void): void {
    this.keys.forEach(key => {
      if (!this.weakMap.has(key)) {
        this.keys.delete(key);
      } else {
        func(<T>this.weakMap.get(key));
      }
    })
  }
}


class SetCollection<T extends object> implements ISimpleCollection<T> {
  private set: Set<T> = new Set<T>();

  public add(item: T): ISimpleCollection<T> {
    this.set.add(item);
    return this;
  }

  public delete(item: T): void {
    this.set.delete(item);
  }

  public forEach(func: (item: T) => void): void {
    this.set.forEach(func);
  }
}


class ArrayCollection<T extends object> implements ISimpleCollection<T> {
  private items: T[] = [];

  add(item: T): ISimpleCollection<T> {
    this.delete(item);
    this.items.push(item);
    return this;
  }

  delete(item: T): void {
    this.items = this.items.filter(itm => itm !== item);
  }

  forEach(func: (item: T) => void): void {
    for (let item of this.items) {
      func(item);
    }
  }
}


function createCollection<T extends object>(weak: boolean = true): ISimpleCollection<T> {
  if (weak) {
    try {
      return new WeakMapCollection<T>();
    } catch (e) { }
  }

  try {
    return new SetCollection<T>();
  } catch (e) { }

  return new ArrayCollection<T>();
}


export class Event {
  private handlers: ISimpleCollection<() => void>;

  private registeredCount: number = 0;

  private weak: boolean;

  constructor(weak: boolean = true) {
    this.weak = weak;
    this.clearHandlers();
  }

  public once(handler: () => void): () => void {
    let h = (): void => {
      handler();
      this.unregister(h);
    };

    return this.register(h);
  }

  public register(handler: () => void): () => void {
    this.handlers.add(handler);
    this.registeredCount++;
    return handler;
  }

  public unregister(hander: () => void): void {
    this.handlers.delete(hander);

    if (this.registeredCount > 0) {
      this.registeredCount--;
    }
  }

  public emit(): void {
    this.handlers.forEach(handler => handler());
  }

  public clearHandlers(): void {
    this.handlers = createCollection<() => void>(this.weak);
    this.registeredCount = 0;
  }
}


export class EventWithArg<T> {
  private handlers: ISimpleCollection<(e: T) => void>;

  private registeredCount: number = 0;

  private weak: boolean;

  constructor(weak: boolean = true) {
    this.weak = weak;
    this.clearHandlers();
  }

  public once(handler: (e: T) => void): (e: T) => void {
    let h = (e: T): void => {
      handler(e);
      this.unregister(h);
    };

    return this.register(h);
  }

  public register(handler: (e: T) => void): (e: T) => void {
    this.handlers.add(handler);
    this.registeredCount++;
    return handler;
  }

  public unregister(hander: (e: T) => void): void {
    this.handlers.delete(hander);

    if (this.registeredCount > 0) {
      this.registeredCount--;
    }
  }

  public emit(e: T): void {
    this.handlers.forEach(handler => handler(e));
  }

  public clearHandlers(): void {
    this.handlers = createCollection<(e: T) => void>(this.weak);
    this.registeredCount = 0;
  }
}
