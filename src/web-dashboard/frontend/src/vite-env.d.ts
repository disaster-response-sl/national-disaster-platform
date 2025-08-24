/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference path="./types/jsx.d.ts" />

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
