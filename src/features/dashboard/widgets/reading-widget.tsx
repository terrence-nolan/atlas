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
        <BookOpenIcon size={18} weight="bold" />
        <h4 className="text-lg font-bold">Currently Reading</h4>
      </div>

      <div className="flex flex-row gap-4">
        {book.coverImageUrl && (
          <Image
            src={book.coverImageUrl}
            alt={`Cover of ${book.title ?? "current book"}`}
            width={80}
            height={120}
            className="h-[120px] w-[80px] rounded-sm object-cover border border-border"
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
            <div className="pt-4 flex flex-col grow position-fixed bottom-0 left-0">
              <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-lavender"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-light pt-2">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
