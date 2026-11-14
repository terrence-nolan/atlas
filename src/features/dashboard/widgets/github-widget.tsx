import { connection } from "next/server";
import { CodeIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getCurrentProjectData } from "@/features/github/data";
import { getDateKey, formatCalendarDate, isToday } from "@/lib/utils/date"
import RecentActivityIndicator from "../recent-activity-indicator";

export default async function GitHubWidget() {
  await connection();

  const project = await getCurrentProjectData();

  return (
    <section className="flex flex-col grow">
      <div className="flex flex-row justify-between pb-1 md:pb-2 items-center">
        <h4 className="font-bold text-lg flex flex-row items-center gap-2">
          <CodeIcon size={18} weight="bold" className="text-sage-text" />
          Current Project
        </h4>
        {isToday(project.latestCommit?.date ?? null) && <RecentActivityIndicator themeColor="sage" />}
      </div>
      
      <h5 className="font-semibold">{project.name}</h5>
      
      <p className="font-light text-xs text-text-secondary pb-2 md:pb-4">
        Updated {formatCalendarDate(
          getDateKey(project.latestCommit?.date ?? null),
        )}
      </p>
      
      <p>{project.description}</p>
      
      <div className="flex flex-row text-wrap pt-2 md:pt-4">
        <span className="text-sm font-light">
          {project.languages.map((language) => language.name).join(", ")}
        </span>
      </div>
      
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sage-text flex flex-row items-center gap-1 pt-2 md:pt-4 hover:underline"
      >
        View on GitHub
        <ArrowUpRightIcon size={14} className="sage-text" />
      </a>
    </section>
  );
}
