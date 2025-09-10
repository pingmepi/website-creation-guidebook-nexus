import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock the 'fabric' module so tests don't touch real Canvas APIs in JSDOM
vi.mock('fabric', () => {
  const mockEventBus: Record<string, Function[]> = {};

  class MockFabricObject {
    id?: string;
    name?: string;
    type?: string;
    text?: string;
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    originX?: string;
    originY?: string;
    scaleX?: number;
    scaleY?: number;
    constructor(props: Record<string, any> = {}) {
      Object.assign(this, props);
    }
    set(props: Record<string, any>) { Object.assign(this, props); }
  }

  class MockImage extends MockFabricObject {
    constructor(imgEl: any) {
      super({ type: 'image', width: imgEl?.width || 100, height: imgEl?.height || 100 });
    }
    scale(_s: number) {}
  }

  let lastCanvas: any = null;

  class MockCanvas {
    width: number;
    height: number;
    backgroundColor?: string;
    isDrawingMode = false;
    // Provide a truthy contextContainer to simulate Fabric internals
    contextContainer: Record<string, unknown> = {};
    freeDrawingBrush: { width: number; color: string } | null = { width: 1, color: '#000' };
    private _objects: MockFabricObject[] = [];
    constructor(_el: any, opts: any) {
      this.width = opts?.width ?? 300;
      this.height = opts?.height ?? 300;
      this.backgroundColor = opts?.backgroundColor;
      lastCanvas = this;
    }
    add(obj: MockFabricObject) { this._objects.push(obj); this._emit('object:added', { target: obj }); }
    remove(obj: MockFabricObject) { this._objects = this._objects.filter(o => o !== obj); this._emit('object:removed', { target: obj }); }
    clear() { this._objects = []; }
    dispose() { /* noop */ }
    renderAll() { /* noop */ }
    getObjects() { return this._objects.slice(); }
    setActiveObject(_obj: MockFabricObject) { /* noop */ }
    bringToFront(_obj: MockFabricObject) { /* noop */ }
    sendToBack(_obj: MockFabricObject) { /* noop */ }
    toDataURL(): string { return 'data:image/png;base64,MOCK_DATA'; }
    on(evt: string, handler: Function) { (mockEventBus[evt] ||= []).push(handler); }
    off(evt: string, handler: Function) { mockEventBus[evt] = (mockEventBus[evt] || []).filter(h => h !== handler); }
    _emit(evt: string, payload?: any) { (mockEventBus[evt] || []).forEach(fn => fn(payload)); }
  }

  class MockRect extends MockFabricObject { constructor(props: any) { super({ type: 'rect', ...props }); } }
  class MockText extends MockFabricObject { constructor(text: string, props: any) { super({ type: 'text', text, ...props }); } }
  class MockCircle extends MockFabricObject { constructor(props: any) { super({ type: 'circle', ...props }); } }

  class MockFabricImage extends MockImage {
    static fromURL(src: string, cb: (img: any) => void, _opts?: any) {
      setTimeout(() => {
        if (!src || src.includes('invalid')) {
          throw new Error('Invalid image URL');
        }
        const el = { width: 200, height: 150 };
        cb(new MockFabricImage(el as any));
      }, 0);
    }
  }

  const fabric = {
    Canvas: MockCanvas as any,
    Rect: MockRect as any,
    Text: MockText as any,
    Circle: MockCircle as any,
    Image: MockFabricImage as any,
    __getLastCanvas: () => lastCanvas,
  } as any;

  return { fabric };
});

// Provide a trivial getContext to avoid crashes if anything hits real canvas
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function() {
    return {
      clearRect: () => {},
      fillRect: () => {},
      drawImage: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: () => ({ width: 0 }),
    } as any;
  },
});

// Polyfill Image to trigger onload in tests (for SimplifiedCanvas preload)
class TestImage {
  width = 200;
  height = 150;
  onload: null | ((ev?: any) => any) = null;
  onerror: null | ((ev?: any) => any) = null;
  _src = '';
  set src(val: string) {
    this._src = val;
    // simulate async load
    setTimeout(() => {
      if (val.includes('invalid')) {
        this.onerror && this.onerror(new Event('error'));
      } else {
        this.onload && this.onload(new Event('load'));
      }
    }, 0);
  }
  get src() { return this._src; }
}
// @ts-ignore
globalThis.Image = TestImage as any;

// Polyfill ResizeObserver used by Radix in tests
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
globalThis.ResizeObserver = ResizeObserverMock;

// Silence noisy logs during tests
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('ReactDOMTestUtils') ||
    args[0].includes('act')
  )) {
    return;
  }
  originalError(...args);
};

