declare module 'fabric' {
  export const fabric: {
    Canvas: any;
    Rect: any;
    Circle: any;
    Text: any;
    Image: {
      fromURL: (url: string, callback: (img: any) => void) => void;
    };
    Object: any;
  };
}
