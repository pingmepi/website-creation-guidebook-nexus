import { beforeAll, afterAll, vi } from 'vitest';

// Utilities to help test Fabric.js based components in a JSDOM environment
// These mocks keep tests deterministic and avoid accessing real DOM canvas APIs

export const setupFabricMocks = () => {
  // Basic mock for fabric objects used by our components
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
    set(props: Record<string, any>) {
      Object.assign(this, props);
    }
  }

  class MockImage extends MockFabricObject {
    constructor(imgEl: any) {
      super({ type: 'image', width: imgEl?.width || 100, height: imgEl?.height || 100 });
    }
    scale(_s: number) { /* noop */ }
  }

  let lastCanvas: any = null;

  class MockCanvas {
    width: number;
    height: number;
    backgroundColor?: string;
    isDrawingMode = false;
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

  const fabricMock = {
    Canvas: MockCanvas as any,
    Rect: MockRect as any,
    Text: MockText as any,
    Image: MockFabricImage as any,
    // Handy for tests that want to access current canvas
    __getLastCanvas: () => lastCanvas,
    lastCanvas: null as any
  } as any;

  const originalFabric = (globalThis as any).fabric;
  (globalThis as any).fabric = fabricMock;

  // Vitest lifecycle helpers to restore after all tests in a suite
  beforeAll(() => {
    vi.stubGlobal('fabric', fabricMock);
  });
  afterAll(() => {
    (globalThis as any).fabric = originalFabric;
  });

  return { fabricMock };
};

// Helper to wait for timers and microtasks in tests
export const flushTimers = async () => {
  await Promise.resolve();
  vi.runAllTimers();
  await Promise.resolve();
};

