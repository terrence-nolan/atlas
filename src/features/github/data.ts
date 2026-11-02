import "server-only";

import { mockCurrentProject } from "./mocks/currentProject";
import { getCurrentProject } from "./getCurrentProject";
import { selectDataSource } from "@/lib/data/selectDataSource";

export function getCurrentProjectData() {
  return selectDataSource({
    mock: () => mockCurrentProject,
    live: getCurrentProject,
  });
}