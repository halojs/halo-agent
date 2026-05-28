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
  resolveServerConfig,
  resolveServerPaths,
} from "../src/config";

type ConfigEntry = readonly [string, string];

const withConfig =
  (entries: ReadonlyArray<ConfigEntry>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(Effect.withConfigProvider(ConfigProvider.fromMap(new Map(entries))));

const resolveWithTempHome = (entries: ReadonlyArray<ConfigEntry> = []) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const home = yield* fs.makeTempDirectoryScoped({ prefix: "halo-config-" });
    return yield* resolveServerConfig.pipe(withConfig([["HALO_HOME", home], ...entries]));
  });

it.layer(NodeContext.layer)("config", (it) => {
  it.scoped("uses default values when env is unset", () =>
    Effect.gen(function* () {
      const config = yield* resolveWithTempHome();
      expect(config.port).toBe(DEFAULT_PORT);
      expect(config.mode).toBe("web");
      expect(config.host).toBeUndefined();
      expect(config.logLevel).toEqual(LogLevel.Info);
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
      const config = yield* resolveServerConfig.pipe(withConfig([["HALO_HOME", home]]));
      expect(config.homeDir).toBe(path.resolve(home));
      expect(config.dataDir).toBe(path.join(config.homeDir, "data"));
      expect(config.dbPath).toBe(path.join(config.homeDir, "data", "db.sqlite"));
      expect(config.attachmentsDir).toBe(path.join(config.homeDir, "attachments"));
    }),
  );

  it.effect("uses default home directory under user homedir", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const config = yield* resolveServerConfig;
      expect(config.homeDir).toBe(path.join(NodeOS.homedir(), DEFAULT_CONFIG_DIR_NAME));
    }),
  );

  it.scoped("creates server directories under HALO_HOME", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const config = yield* resolveWithTempHome();
      expect(yield* fs.exists(config.dataDir)).toBe(true);
      expect(yield* fs.exists(config.debugDir)).toBe(true);
      expect(yield* fs.exists(config.sessionsDir)).toBe(true);
    }),
  );

  it.scoped("resolveServerPaths joins paths under homeDir", () =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      const homeDir = yield* fs.makeTempDirectoryScoped({ prefix: "halo-paths-" });
      const paths = yield* resolveServerPaths(homeDir);
      expect(paths.dbPath).toBe(path.join(homeDir, "data", "db.sqlite"));
      expect(paths.modelsPath).toBe(path.join(homeDir, "data", "models.json"));
      expect(paths.serverLogPath).toBe(path.join(homeDir, "debug", "server.log"));
      expect(paths.settingsPath).toBe(path.join(homeDir, "settings.json"));
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
