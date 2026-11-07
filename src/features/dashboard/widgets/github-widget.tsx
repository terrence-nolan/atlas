import { connection } from "next/server";
import { GithubLogoIcon } from "@phosphor-icons/react/ssr";
import { getCurrentProjectData } from "@/features/github/data";
import { getDateKey, formatCalendarDate } from "@/lib/utils/date"

export default async function GitHubWidget() {
  await connection();
  
  const project = await getCurrentProjectData();

  return (
    <div className="flex flex-col">
      <div>
        <h4 className="font-bold text-lg flex flex-row items-center gap-2 pb-2">
          <GithubLogoIcon size={18} weight="bold" />
          GitHub
        </h4>
      </div>
      <h5 className="font-semibold">{project.name}</h5>
      <p className="font-light text-xs pb-4">
        Updated {formatCalendarDate(
          getDateKey(project.latestCommit?.date ?? null),
        )}
      </p>
      <p>{project.description}</p>
      <div className="flex flex-row text-wrap pt-4">
        <span className="text-sm font-light">
          {project.languages.map((language) => language.name).join(", ")}
        </span>
      </div>
    </div>
  );
}