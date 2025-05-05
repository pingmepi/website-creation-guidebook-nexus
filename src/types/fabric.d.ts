
declare module 'fabric' {
  export const fabric: {
    Canvas: any;
    Rect: any;
    Circle: any;
    Text: any;
    Image: {
      fromURL: (url: string, callback: (img: any) => void, options?: {crossOrigin?: string}) => void;
    };
    Object: any;
    IText: any;
    Point: any;
    Group: any;
    Path: any;
    Line: any;
    Polygon: any;
    Polyline: any;
    Triangle: any;
    Ellipse: any;
  };

  // Add explicit exports for newer import syntax
  export class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    add(...objects: any[]): this;
    remove(...objects: any[]): this;
    clear(): this;
    renderAll(): this;
    setWidth(value: number): this;
    setHeight(value: number): this;
    dispose(): void;
    freeDrawingBrush: {
      width: number;
      color: string;
    };
    isDrawingMode: boolean;
    backgroundColor: string;
    width?: number;
    height?: number;
    getObjects(): any[];
    getActiveObject(): any;
    setActiveObject(object: any): this;
    discardActiveObject(): this;
    sendToBack(object: any): this;
    toDataURL(options?: { format?: string, quality?: number, multiplier?: number }): string;
    on(event: string, callback: (e?: any) => void): this;
    off(event: string, callback?: (e?: any) => void): this;
  }

  export class Rect {
    constructor(options?: any);
    set(options: any): this;
  }

  export class Circle {
    constructor(options?: any);
    set(options: any): this;
  }

  export class Text {
    constructor(text: string, options?: any);
    set(options: any): this;
  }

  export class IText {
    constructor(text: string, options?: any);
    set(options: any): this;
  }

  export class Image {
    static fromURL(url: string, callback: (img: any) => void, options?: {crossOrigin?: string}): void;
    set(options: any): this;
    scale(value: number): this;
    width?: number;
    height?: number;
  }
}
