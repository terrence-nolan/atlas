import { getDataConfig } from "./config";

type DataSources<T> = {
  mock: () => T | Promise<T>;
  live: () => T | Promise<T>;
};

export async function selectDataSource<T>(
  sources: DataSources<T>,
): Promise<T> {
  const { mode } = getDataConfig();

  return mode === "mock" ? sources.mock() : sources.live();
}