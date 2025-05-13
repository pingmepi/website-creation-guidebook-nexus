
declare namespace fabric {
  class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    add(...objects: Object[]): Canvas;
    remove(...objects: Object[]): Canvas;
    clear(): Canvas;
    renderAll(): Canvas;
    setActiveObject(object: Object): Canvas;
    getActiveObject(): Object | null;
    getObjects(): Object[];
    getContext(): CanvasRenderingContext2D;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): Canvas;
    setHeight(height: number): Canvas;
    dispose(): void;
    toDataURL(options?: any): string;
    isDrawingMode: boolean;
    freeDrawingBrush: {
      width: number;
      color: string;
    };
    off(eventName?: string, handler?: Function): Canvas;
    on(eventName: string, handler: Function): Canvas;
    sendToBack(object: Object): Canvas;
  }

  class Object {
    id?: string;
    type: string;
    left: number;
    top: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    selectable?: boolean;
    evented?: boolean;
    opacity?: number;
    visible?: boolean;
    hasControls?: boolean;
    hasBorders?: boolean;
    hasRotatingPoint?: boolean;
    transparentCorners?: boolean;
    originX?: 'center' | 'left' | 'right';
    originY?: 'center' | 'top' | 'bottom';
    set(properties: any): Object;
    get(property: string): any;
    scale(value: number): Object;
  }

  class Rect extends Object {
    constructor(options?: any);
  }

  class Circle extends Object {
    constructor(options?: any);
    radius: number;
  }

  class Text extends Object {
    constructor(text: string, options?: any);
    text: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
  }

  class Image extends Object {
    constructor(element: HTMLImageElement, options?: any);
    static fromURL(url: string, callback: (image: Image) => void, options?: any): void;
  }
}

// Export the fabric namespace for use in TypeScript files
declare module 'fabric' {
  export = fabric;
}
