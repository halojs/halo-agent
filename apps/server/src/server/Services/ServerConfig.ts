import * as Context from "effect/Context";
import * as Schema from "effect/Schema";

export const RuntimeMode = Schema.Literal("web", "desktop");
export type RuntimeMode = typeof RuntimeMode.Type;

export class ServerConfig extends Context.Tag("@halo/server/Services/ServerConfig")<
  ServerConfig,
  ServerConfigShape
>() {}

export interface ServerConfigShape extends ServerPaths {
  readonly mode: RuntimeMode;
  readonly host: string | undefined;
  readonly port: number;
  readonly homeDir: string;
  readonly clientDir: string | undefined;
}

export interface ServerPaths {
  readonly dataDir: string;
  readonly dbPath: string;
  readonly modelsPath: string;
  readonly settingsPath: string;
}
