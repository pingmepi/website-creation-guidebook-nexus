
declare module 'fabric' {
  export const fabric: {
    Canvas: new (element: HTMLCanvasElement | string, options?: any) => FabricCanvas;
    Rect: new (options?: any) => FabricObject;
    Circle: new (options?: any) => FabricObject;
    Text: new (text: string, options?: any) => FabricObject;
    Image: {
      fromURL: (url: string, callback: (img: any) => void, options?: any) => void;
    };
    Object: any;
  };

  export interface FabricCanvas {
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
    set(options: any): any;
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
    constructor(options?: any);
    set(options: any): any;
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
    constructor(options?: any);
    radius?: number;
  }
  
  class Rect extends Object {
    constructor(options?: any);
  }
  
  class Text extends Object {
    constructor(text: string, options?: any);
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
  }
}
