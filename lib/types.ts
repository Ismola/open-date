export type TrickMode = "none" | "runaway" | "vanish" | "grow" | "swap";
export type EventStatus = "draft" | "published" | "disabled";
export type BlockType =
  | "message"
  | "text_input"
  | "yes_no"
  | "choices"
  | "date"
  | "photo"
  | "gift";

export type EventBlock = {
  id: string;
  type: BlockType;
  label: string;
  description?: string;
  required?: boolean;
  options?: string[];
  desiredAnswer?: string;
  trickMode?: TrickMode;
  imageUrl?: string;
  linkUrl?: string;
  giftTitle?: string;
  dateValue?: string;
};

export type EventAnswer = {
  blockId: string;
  label: string;
  value: string;
};

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  recipientName: string;
  intro: string;
  scheduledFor?: string;
  coverImage?: string;
  accent: "blue" | "pink" | "yellow" | "mint";
  blocks: EventBlock[];
  status: EventStatus;
  respondedAt?: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
};
