
declare module 'fabric' {
  export const fabric: {
    Canvas: new (element: HTMLCanvasElement | string, options?: any) => any;
    Rect: new (options?: any) => any;
    Circle: new (options?: any) => any;
    Text: new (text: string, options?: any) => any;
    Image: {
      fromURL: (url: string, callback: (img: any) => void, options?: any) => void;
    };
    Object: any;
  };
  
  export class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    add(...objects: any[]): any;
    remove(...objects: any[]): any;
    renderAll(): void;
    getObjects(): any[];
    clear(): void;
    getContext(): CanvasRenderingContext2D;
    getActiveObject(): any;
    setActiveObject(object: any): any;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    dispose(): void;
    toDataURL(options?: any): string;
    sendToBack(object: any): void;
    getWidth(): number;
    getHeight(): number;
    setWidth(width: number): void;
    setHeight(height: number): void;
    freeDrawingBrush: {
      color: string;
      width: number;
    };
    isDrawingMode: boolean;
  }
  
  export class Circle {
    constructor(options?: any);
    set(options: any): any;
    scale(value: number): void;
  }
  
  export class Rect {
    constructor(options?: any);
    set(options: any): any;
    scale(value: number): void;
  }
  
  export class Text {
    constructor(text: string, options?: any);
    set(options: any): any;
    scale(value: number): void;
  }
}
