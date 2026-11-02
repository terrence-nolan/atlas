import "server-only";

type AppEnvironment =
  | "development"
  | "ci"
  | "preview"
  | "production";

type DataMode = "mock" | "live";

function getAppEnvironment(): AppEnvironment {
  const environment = process.env.APP_ENV;

  if (
    environment !== "development" &&
    environment !== "ci" &&
    environment !== "preview" &&
    environment !== "production"
  ) {
    throw new Error(`Invalid APP_ENV: ${environment}`);
  }

  return environment;
}

function getDataMode(): DataMode {
  const mode = process.env.DATA_MODE;

  if (mode !== "mock" && mode !== "live") {
    throw new Error(`Invalid DATA_MODE: ${mode}`);
  }

  return mode;
}

export function getDataConfig() {
  const environment = getAppEnvironment();
  const mode = getDataMode();

  if (environment === "production" && mode !== "live") {
    throw new Error("Production deployments must use live data.");
  }

  return { environment, mode };
}