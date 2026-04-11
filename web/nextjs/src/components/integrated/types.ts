export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "bot"; text: string };

export type HostThread = {
  id: string;
  display_name: string;
  last_activity_time: string;
  messages: ChatMessage[];
  /** UI flag: show the “Connect to Counsel” card (not a transcript message). */
  showCounselCard?: boolean;
};
