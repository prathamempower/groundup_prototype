export interface SitePhotoTag {
  label: string;
  color: string;
}

export interface SitePhoto {
  id: string;
  title: string;
  time: string;
  tags: SitePhotoTag[];
  aiConfidence: number;
}
