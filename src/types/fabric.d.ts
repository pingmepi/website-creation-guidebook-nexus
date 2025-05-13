
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
}
