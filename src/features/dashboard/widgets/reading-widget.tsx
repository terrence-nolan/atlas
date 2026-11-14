import Image from "next/image";
import { connection } from "next/server";
import { BookOpenIcon } from "@phosphor-icons/react/ssr";

import { getCurrentBookData } from "@/features/books/getCurrentBookData";

export default async function ReadingWidget() {
  await connection();

  const book = await getCurrentBookData();

  const progress = book.pageCount
    ? Math.min(
        Math.round((book.currentPage / book.pageCount) * 100),
        100,
      )
    : null;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-2 pb-4">
        <BookOpenIcon size={18} weight="bold" className="text-lavender-text" />
        <h4 className="text-lg font-bold">Currently Reading</h4>
      </div>

      <div className="flex flex-row gap-4">
        {book.coverImageUrl && (
          <Image
            src={book.coverImageUrl}
            alt={`Cover of ${book.title ?? "current book"}`}
            width={80}
            height={120}
            className="h-[120px] w-[80px] rounded-sm object-cover border border-border hidden sm:block"
            loading="eager"
          />
        )}

        <div className="flex flex-col gap-4 grow">
          <div className="flex min-w-0 flex-col">
            <h5 className="font-semibold">
              {book.title ?? "Unknown title"}
            </h5>

            <p className="text-xs font-light">
              {book.authors?.join(", ") ?? "Unknown author"}
            </p>
          </div>
          {progress !== null && (
            <div className="md:pt-4">
              <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full w-full bg-lavender-medium">
                  <div
                    className="h-full rounded-full bg-lavender-dark"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-text-secondary font-light pt-1 pb-2">
                <span>{progress}% complete</span>
                <span>
                  {book.currentPage} / {book.pageCount} pages
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
