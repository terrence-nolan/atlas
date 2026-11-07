export type BookMetadata = {
  googleBooksId: string;
  title?: string;
  authors?: string[];
  pageCount?: number;
  coverImageUrl?: string;
};

export type CurrentBookConfig = {
  googleBooksId: string;
  currentPage: number;
  startedAt: string;
  progressUpdatedAt: string;
};

export type CurrentBook = BookMetadata & CurrentBookConfig;
