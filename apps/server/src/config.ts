import { FileSystem, Path } from "@effect/platform";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as LogLevel from "effect/LogLevel";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as NodeOS from "node:os";

export const DEFAULT_PORT = 3603;
export const DEFAULT_CONFIG_DIR_NAME = ".halo";

export const RuntimeMode = Schema.Literal("web", "desktop");
export type RuntimeMode = typeof RuntimeMode.Type;

export class ServerConfig extends Context.Tag("@halo/server/ServerConfig")<
  ServerConfig,
  ServerConfigShape
>() {}

export interface ServerConfigShape extends ServerPaths {
  readonly mode: RuntimeMode;
  readonly cwd: string;
  readonly host: string | undefined;
  readonly port: number;
  readonly homeDir: string;
  readonly staticDir: string | undefined;
  readonly logLevel: LogLevel.LogLevel;
}

export interface ServerPaths {
  /** 附件目录, `~/.halo/attachments` */
  readonly attachmentsDir: string;
  /** 缓存目录, `~/.halo/cache` */
  readonly cacheDir: string;
  /** 数据目录, `~/.halo/data` */
  readonly dataDir: string;
  /** 调试目录, `~/.halo/debug` */
  readonly debugDir: string;
  /** 钩子目录, `~/.halo/hooks` */
  readonly hooksDir: string;
  /** 插件目录, `~/.halo/plugins` */
  readonly pluginsDir: string;
  /** 会话目录, `~/.halo/sessions` */
  readonly sessionsDir: string;
  /** 技能目录, `~/.halo/skills` */
  readonly skillsDir: string;
  /** 主题目录, `~/.halo/themes` */
  readonly themesDir: string;
  /** 工具目录, `~/.halo/tools` */
  readonly toolsDir: string;
  /** 工作树目录, `~/.halo/worktree` */
  readonly worktreeDir: string;
  /** 认证文件, `~/.halo/auth.json` */
  readonly authPath: string;
  /** 数据库文件, `~/.halo/data/db.sqlite` */
  readonly dbPath: string;
  /** 模型文件, `~/.halo/models.json` */
  readonly modelsPath: string;
  /** 服务器日志文件, `~/.halo/debug/server.log` */
  readonly serverLogPath: string;
  /** 设置文件, `~/.halo/settings.json` */
  readonly settingsPath: string;
}

export const resolveServerPaths = Effect.fn(function* (
  homeDir: ServerConfigShape["homeDir"],
): Effect.fn.Return<ServerPaths, never, Path.Path> {
  const { join } = yield* Path.Path;
  const dataDir = join(homeDir, "data");
  const debugDir = join(homeDir, "debug");

  return {
    attachmentsDir: join(homeDir, "attachments"),
    cacheDir: join(homeDir, "cache"),
    dataDir,
    debugDir,
    hooksDir: join(homeDir, "hooks"),
    pluginsDir: join(homeDir, "plugins"),
    sessionsDir: join(homeDir, "sessions"),
    skillsDir: join(homeDir, "skills"),
    themesDir: join(homeDir, "themes"),
    toolsDir: join(homeDir, "tools"),
    worktreeDir: join(homeDir, "worktree"),
    authPath: join(homeDir, "auth.json"),
    dbPath: join(dataDir, "db.sqlite"),
    modelsPath: join(dataDir, "models.json"),
    serverLogPath: join(debugDir, "server.log"),
    settingsPath: join(homeDir, "settings.json"),
  };
});

const ensureServerDirs = Effect.fn(function* (serverPaths: ServerPaths) {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.all(
    [
      fs.makeDirectory(serverPaths.attachmentsDir, { recursive: true }),
      fs.makeDirectory(serverPaths.cacheDir, { recursive: true }),
      fs.makeDirectory(serverPaths.dataDir, { recursive: true }),
      fs.makeDirectory(serverPaths.debugDir, { recursive: true }),
      fs.makeDirectory(serverPaths.hooksDir, { recursive: true }),
      fs.makeDirectory(serverPaths.pluginsDir, { recursive: true }),
      fs.makeDirectory(serverPaths.sessionsDir, { recursive: true }),
      fs.makeDirectory(serverPaths.skillsDir, { recursive: true }),
      fs.makeDirectory(serverPaths.themesDir, { recursive: true }),
      fs.makeDirectory(serverPaths.toolsDir, { recursive: true }),
      fs.makeDirectory(serverPaths.worktreeDir, { recursive: true }),
    ],
    { concurrency: "unbounded" },
  );
});

const resolveStaticDir = Effect.fn(function* () {
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

const EnvServerConfig = Config.all({
  home: Config.string("HALO_HOME").pipe(Config.option, Config.map(Option.getOrUndefined)),
  mode: Schema.Config("HALO_MODE", RuntimeMode).pipe(
    Config.option,
    Config.map(Option.getOrUndefined),
  ),
  host: Config.string("HALO_HOST").pipe(Config.option, Config.map(Option.getOrUndefined)),
  port: Config.port("HALO_PORT").pipe(Config.option, Config.map(Option.getOrUndefined)),
  logLevel: Config.logLevel("HALO_LOG_LEVEL").pipe(Config.withDefault(LogLevel.Info)),
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

const fromUndefinedOr = <A>(a: A): Option.Option<Exclude<A, undefined>> =>
  a === undefined ? Option.none() : Option.some(a as Exclude<A, undefined>);

export const resolveServerConfig = Effect.gen(function* () {
  const env = yield* EnvServerConfig;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const homeDir = yield* resolveHomeDir(Option.getOrUndefined(fromUndefinedOr(env.home)));
  const mode: RuntimeMode = Option.getOrElse(fromUndefinedOr(env.mode), () => "web");
  const host = Option.getOrElse(fromUndefinedOr(env.host), () =>
    mode === "desktop" ? "127.0.0.1" : undefined,
  );
  const port = Option.match(fromUndefinedOr(env.port), {
    onSome: (value) => value,
    onNone: () => DEFAULT_PORT,
  });
  const rawCwd = process.cwd();
  const cwd = path.resolve(yield* expandHomePath(rawCwd.trim()));
  yield* fs.makeDirectory(cwd, { recursive: true });
  const serverPaths = yield* resolveServerPaths(homeDir);
  yield* ensureServerDirs(serverPaths);
  const staticDir = yield* resolveStaticDir();
  const logLevel = env.logLevel;

  const config: ServerConfigShape = {
    staticDir,
    logLevel,
    mode,
    cwd,
    homeDir,
    host,
    port,
    ...serverPaths,
  };

  return config;
});
