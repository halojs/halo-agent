import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import { ServerConfig } from "./config";

/**
 * HTTP server layer
 *
 * @category Layers
 */
export const HttpServerLive = Layer.unwrapScoped(
  Effect.gen(function* () {
    const config = yield* ServerConfig;
    if (typeof Bun !== "undefined") {
      const BunHttpServer = yield* Effect.promise(
        () => import("@effect/platform-bun/BunHttpServer"),
      );
      return BunHttpServer.layer({
        port: config.port,
        ...(config.host ? { hostname: config.host } : {}),
      });
    } else {
      const [NodeHttpServer, NodeHttp] = yield* Effect.all([
        Effect.promise(() => import("@effect/platform-node/NodeHttpServer")),
        Effect.promise(() => import("node:http")),
      ]);
      return NodeHttpServer.layer(NodeHttp.createServer, {
        host: config.host,
        port: config.port,
      });
    }
  }),
);

/**
 * Platform context layer
 *
 * @category Layers
 */
export const PlatformLive = Layer.unwrapScoped(
  Effect.gen(function* () {
    if (typeof Bun !== "undefined") {
      const { layer } = yield* Effect.promise(() => import("@effect/platform-bun/BunContext"));
      return layer;
    } else {
      const { layer } = yield* Effect.promise(() => import("@effect/platform-node/NodeContext"));
      return layer;
    }
  }),
);

/**
 * Server logger layer
 *
 * @category Layers
 */
export const ServerLoggerLive = Layer.unwrapScoped(
  Effect.gen(function* () {
    const config = yield* ServerConfig;
    const minimumLogLevelLayer = Logger.minimumLogLevel(config.logLevel);
    const baseLogger = Logger.replace(Logger.defaultLogger, Logger.prettyLogger());
    const loggerLayer = LogLevel.greaterThan(config.traceLevel, LogLevel.None)
      ? Layer.merge(baseLogger, Logger.add(Logger.tracerLogger))
      : baseLogger;

    return Layer.mergeAll(minimumLogLevelLayer, loggerLayer);
  }),
);
