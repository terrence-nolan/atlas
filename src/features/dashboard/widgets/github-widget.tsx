import { connection } from "next/server";
import { GithubLogoIcon, CircleIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getCurrentProjectData } from "@/features/github/data";
import { getDateKey, formatCalendarDate, isToday } from "@/lib/utils/date"

export default async function GitHubWidget() {
  await connection();

  const project = await getCurrentProjectData();

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between pb-2">
        <h4 className="font-bold text-lg flex flex-row items-center gap-2">
          <GithubLogoIcon size={18} weight="bold" />
          Current Project
        </h4>
        {isToday(project.latestCommit?.date ?? null) && <CircleIcon size={12} weight="fill" className="text-sage" />}
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
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sage-text flex flex-row items-center gap-1 pt-4 hover:underline"
      >
        View repository
        <ArrowUpRightIcon size={14} className="sage-text" />
      </a>
    </div>
  );
}
