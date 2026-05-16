export const IS_DEV = import.meta.env.DEV;
export const IS_DESKTOP = false;

export const APP_BASE_NAME = "Halo";
export const APP_STAGE_LABEL = IS_DEV ? "Dev" : "Alpha";
export const APP_DISPLAY_NAME = `${APP_BASE_NAME} (${APP_STAGE_LABEL})`;
export const APP_VERSION = import.meta.env.APP_VERSION || "0.0.0";
export const APP_BUILT_TIME = import.meta.env.APP_BUILT_TIME;
