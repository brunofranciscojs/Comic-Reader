export interface ComicFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export interface PageData {
  pageNumber: number;
  imageUrl: string;
}