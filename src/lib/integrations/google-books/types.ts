export type GoogleBooksVolume = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};
