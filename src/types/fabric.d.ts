
// Type definitions for fabric.js objects and options
export interface FabricObjectOptions {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeDashArray?: number[];
  selectable?: boolean;
  evented?: boolean;
  originX?: string;
  originY?: string;
  id?: string;
  type?: string;
}

export interface FabricCanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface FabricTextOptions extends FabricObjectOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
}

export interface FabricCircleOptions extends FabricObjectOptions {
  radius?: number;
}

export interface FabricImageOptions extends FabricObjectOptions {
  crossOrigin?: string;
}

export interface FabricDataURLOptions {
  format?: string;
  quality?: number;
  multiplier?: number;
}

export type FabricEventCallback = (event?: unknown) => void;

declare module 'fabric' {
  export const fabric: {
    Canvas: new (element: HTMLCanvasElement | string, options?: FabricCanvasOptions) => FabricCanvas;
    Rect: new (options?: FabricObjectOptions) => FabricObject;
    Circle: new (options?: FabricCircleOptions) => FabricObject;
    Text: new (text: string, options?: FabricTextOptions) => FabricObject;
    Image: {
      fromURL: (url: string, callback: (img: FabricObject) => void, options?: FabricImageOptions) => void;
    };
    Object: typeof FabricObject;
  };

  export interface FabricCanvas {
    add(...objects: FabricObject[]): FabricCanvas;
    remove(...objects: FabricObject[]): FabricCanvas;
    renderAll(): void;
    getObjects(): FabricObject[];
    clear(): void;
    getContext(): CanvasRenderingContext2D;
    getActiveObject(): FabricObject | null;
    setActiveObject(object: FabricObject): FabricCanvas;
    on(event: string, callback: FabricEventCallback): void;
    off(event: string, callback: FabricEventCallback): void;
    dispose(): void;
    toDataURL(options?: FabricDataURLOptions): string;
    sendToBack(object: FabricObject): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    width?: number;
    height?: number;
    backgroundColor?: string;
    freeDrawingBrush: {
      color: string;
      width: number;
    };
    isDrawingMode: boolean;
  }
  
  export interface FabricObject {
    set(options: Partial<FabricObjectOptions>): FabricObject;
    scale(value: number): void;
    id?: string;
    type?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeDashArray?: number[];
    selectable?: boolean;
    evented?: boolean;
    originX?: string;
    originY?: string;
    radius?: number;
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
  }
}

declare namespace fabric {
  class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: FabricCanvasOptions);
    add(...objects: FabricObject[]): Canvas;
    remove(...objects: FabricObject[]): Canvas;
    renderAll(): void;
    getObjects(): FabricObject[];
    clear(): void;
    getContext(): CanvasRenderingContext2D;
    getActiveObject(): FabricObject | null;
    setActiveObject(object: FabricObject): Canvas;
    on(event: string, callback: FabricEventCallback): void;
    off(event: string, callback: FabricEventCallback): void;
    dispose(): void;
    toDataURL(options?: FabricDataURLOptions): string;
    sendToBack(object: FabricObject): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    width?: number;
    height?: number;
    backgroundColor?: string;
    freeDrawingBrush: {
      color: string;
      width: number;
    };
    isDrawingMode: boolean;
  }
  
  class Object {
    constructor(options?: FabricObjectOptions);
    set(options: Partial<FabricObjectOptions>): Object;
    scale(value: number): void;
    id?: string;
    type?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeDashArray?: number[];
    selectable?: boolean;
    evented?: boolean;
    originX?: string;
    originY?: string;
  }

  class Circle extends Object {
    constructor(options?: FabricCircleOptions);
    radius?: number;
  }

  class Rect extends Object {
    constructor(options?: FabricObjectOptions);
  }

  class Text extends Object {
    constructor(text: string, options?: FabricTextOptions);
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
  }
}
