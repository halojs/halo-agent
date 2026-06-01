import { FileSystem, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import * as ConfigError from "effect/ConfigError";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as LogLevel from "effect/LogLevel";
import * as NodeOS from "node:os";
import {
  DEFAULT_CONFIG_DIR_NAME,
  DEFAULT_PORT,
  ServerConfigLive,
} from "../src/server/Layers/ServerConfig";
import { ServerConfig } from "../src/server/Services/ServerConfig";

type ConfigEntry = readonly [string, string];

const withConfig =
  (entries: ReadonlyArray<ConfigEntry>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(new Map(entries))));

const loadServerConfig = (entries: ReadonlyArray<ConfigEntry> = []) =>
  ServerConfig.pipe(Effect.provide(ServerConfigLive), withConfig(entries));

const resolveWithTempHome = (entries: ReadonlyArray<ConfigEntry> = []) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const home = yield* fs.makeTempDirectoryScoped({ prefix: "halo-config-" });
    return yield* loadServerConfig([["HALO_HOME", home], ...entries]);
  });

it.layer(NodeContext.layer)("ServerConfig", (it) => {
  it.scoped("uses default values when env is unset", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome();
      expect(config.port).toBe(DEFAULT_PORT);
      expect(config.mode).toBe("web");
      expect(config.host).toBeUndefined();
      expect(config.logLevel).toEqual(LogLevel.Info);
      expect(config.traceLevel).toEqual(LogLevel.Trace);
      expect(config.traceTimingEnabled).toBe(true);
    }),
  );

  it.scoped("uses HALO_LOG_LEVEL from config", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([["HALO_LOG_LEVEL", "Debug"]]);
      expect(config.logLevel).toEqual(LogLevel.Debug);
    }),
  );

  it.scoped("uses HALO_TRACE_LEVEL from config", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([["HALO_TRACE_LEVEL", "OFF"]]);
      expect(config.traceLevel).toEqual(LogLevel.None);
    }),
  );

  it.scoped("uses HALO_TRACE_TIMING from config", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([["HALO_TRACE_TIMING", "false"]]);
      expect(config.traceTimingEnabled).toBe(false);
    }),
  );

  it.scoped("uses HALO_PORT from config", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([["HALO_PORT", "9090"]]);
      expect(config.port).toBe(9090);
    }),
  );

  it.scoped("uses desktop mode default host", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([["HALO_MODE", "desktop"]]);
      expect(config.mode).toBe("desktop");
      expect(config.host).toBe("127.0.0.1");
    }),
  );

  it.scoped("uses HALO_HOST over desktop default host", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome([
        ["HALO_MODE", "desktop"],
        ["HALO_HOST", "0.0.0.0"],
      ]);
      expect(config.host).toBe("0.0.0.0");
    }),
  );

  it.scoped("resolves paths under HALO_HOME", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const home = yield* fs.makeTempDirectoryScoped({ prefix: "halo-config-" });
      const config = yield* loadServerConfig([["HALO_HOME", home]]);
      expect(config.homeDir).toBe(path.resolve(home));
      expect(config.dataDir).toBe(path.join(config.homeDir, "userdata"));
      expect(config.dbPath).toBe(path.join(config.homeDir, "userdata", "db.sqlite"));
    }),
  );

  it.effect("uses default home directory under user homedir", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const config = yield* loadServerConfig();
      expect(config.homeDir).toBe(path.join(NodeOS.homedir(), DEFAULT_CONFIG_DIR_NAME));
    }),
  );

  it.scoped("creates server directories under HALO_HOME", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const config = yield* resolveWithTempHome();
      expect(yield* fs.exists(config.dataDir)).toBe(true);
    }),
  );

  it.scoped("resolves server paths under HALO_HOME", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const homeDir = yield* fs.makeTempDirectoryScoped({ prefix: "halo-paths-" });
      const config = yield* loadServerConfig([["HALO_HOME", homeDir]]);
      expect(config.dataDir).toBe(path.join(homeDir, "userdata"));
      expect(config.dbPath).toBe(path.join(homeDir, "userdata", "db.sqlite"));
      expect(config.modelsPath).toBe(path.join(homeDir, "userdata", "models.json"));
      expect(config.settingsPath).toBe(path.join(homeDir, "userdata", "settings.json"));
    }),
  );

  it.scoped("fails with ConfigError for invalid HALO_MODE", () =>
    Effect.gen(function* () {
      const error = yield* resolveWithTempHome([["HALO_MODE", "invalid"]]).pipe(Effect.flip);
      expect(ConfigError.isConfigError(error)).toBe(true);
    }),
  );

  it.scoped("fails with ConfigError for invalid HALO_PORT", () =>
    Effect.gen(function* () {
      const error = yield* resolveWithTempHome([["HALO_PORT", "not-a-port"]]).pipe(Effect.flip);
      expect(ConfigError.isConfigError(error)).toBe(true);
    }),
  );
});
