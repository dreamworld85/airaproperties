/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  L: any;
  google: any;
  Razorpay: any;
}
