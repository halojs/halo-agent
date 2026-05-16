/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string;
  readonly APP_BUILT_TIME: string;
}

declare global {
  interface Window {}
}
