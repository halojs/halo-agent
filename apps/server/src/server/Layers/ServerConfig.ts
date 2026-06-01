import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as NodeOS from "node:os";
import { undefinedToOption } from "~/utils";
import {
  RuntimeMode,
  ServerConfig,
  type ServerConfigShape,
  type ServerPaths,
} from "../Services/ServerConfig";

export const DEFAULT_PORT = 3603;
export const DEFAULT_CONFIG_DIR_NAME = ".halo";

const EnvServerConfig = Config.all({
  enableTracing: Config.boolean("HALO_ENABLE_TRACING").pipe(Config.withDefault(false)),
  logLevel: Config.logLevel("HALO_LOG_LEVEL").pipe(Config.withDefault(LogLevel.Info)),
  traceLevel: Config.logLevel("HALO_TRACE_LEVEL").pipe(Config.withDefault(LogLevel.Trace)),
  traceTiming: Config.boolean("HALO_TRACE_TIMING").pipe(Config.withDefault(true)),
  home: Config.string("HALO_HOME").pipe(Config.option, Config.map(Option.getOrUndefined)),
  mode: Schema.Config("HALO_MODE", RuntimeMode).pipe(
    Config.option,
    Config.map(Option.getOrUndefined),
  ),
  host: Config.string("HALO_HOST").pipe(Config.option, Config.map(Option.getOrUndefined)),
  port: Config.port("HALO_PORT").pipe(Config.option, Config.map(Option.getOrUndefined)),
});

const resolveServerPaths = Effect.fn(function* (
  homeDir: ServerConfigShape["homeDir"],
): Effect.fn.Return<ServerPaths, never, Path.Path> {
  const { join } = yield* Path.Path;
  const dataDir = join(homeDir, "userdata");

  return {
    dataDir,
    dbPath: join(dataDir, "db.sqlite"),
    modelsPath: join(dataDir, "models.json"),
    settingsPath: join(dataDir, "settings.json"),
  };
});

const ensureServerDirectories = Effect.fn(function* (serverPaths: ServerPaths) {
  const { makeDirectory } = yield* FileSystem.FileSystem;
  const { dirname } = yield* Path.Path;

  yield* Effect.all(
    [
      makeDirectory(serverPaths.dataDir, { recursive: true }),
      makeDirectory(dirname(serverPaths.dbPath), { recursive: true }),
      makeDirectory(dirname(serverPaths.modelsPath), { recursive: true }),
      makeDirectory(dirname(serverPaths.settingsPath), { recursive: true }),
    ],
    {
      concurrency: "unbounded",
    },
  );
});

const resolveClientDirectory = Effect.fn(function* () {
  const { join, resolve } = yield* Path.Path;
  const { exists } = yield* FileSystem.FileSystem;

  const bundledClient = resolve(join(import.meta.dirname, "client"));
  const bundledStat = yield* exists(join(bundledClient, "index.html")).pipe(
    Effect.orElseSucceed(() => false),
  );
  if (bundledStat) {
    return bundledClient;
  }

  const monorepoClient = resolve(join(import.meta.dirname, "../../web/dist"));
  const monorepoStat = yield* exists(join(monorepoClient, "index.html")).pipe(
    Effect.orElseSucceed(() => false),
  );
  if (monorepoStat) {
    return monorepoClient;
  }

  return undefined;
});

const expandHomePath = Effect.fn(function* (input: string) {
  const { join } = yield* Path.Path;
  if (input === "~") {
    return NodeOS.homedir();
  }
  if (input.startsWith("~/") || input.startsWith("~\\")) {
    return join(NodeOS.homedir(), input.slice(2));
  }
  return input;
});

const resolveHomeDir = Effect.fn(function* (input: string | undefined) {
  const { join, resolve } = yield* Path.Path;
  if (!input || input.trim().length === 0) {
    return join(NodeOS.homedir(), DEFAULT_CONFIG_DIR_NAME);
  }
  return resolve(yield* expandHomePath(input.trim()));
});

export const makeServerConfig = () =>
  Effect.gen(function* () {
    const env = yield* EnvServerConfig;
    const homeDir = yield* resolveHomeDir(Option.getOrUndefined(undefinedToOption(env.home)));
    const mode: RuntimeMode = Option.getOrElse(undefinedToOption(env.mode), () => "web");
    const host = Option.getOrElse(undefinedToOption(env.host), () =>
      mode === "desktop" ? "127.0.0.1" : undefined,
    );
    const port = Option.match(undefinedToOption(env.port), {
      onSome: (value) => value,
      onNone: () => DEFAULT_PORT,
    });

    const serverPaths = yield* resolveServerPaths(homeDir);
    yield* ensureServerDirectories(serverPaths);
    const clientDir = yield* resolveClientDirectory();

    const config: ServerConfigShape = {
      logLevel: env.logLevel,
      traceLevel: env.traceLevel,
      traceTimingEnabled: env.traceTiming,
      mode,
      host,
      port,
      homeDir,
      clientDir,
      ...serverPaths,
    };
    return config;
  });

export const ServerConfigLive = Layer.effect(ServerConfig, makeServerConfig());
