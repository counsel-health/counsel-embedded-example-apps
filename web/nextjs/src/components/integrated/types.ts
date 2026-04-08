export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "bot"; text: string }
  | { role: "bot"; type: "counsel-card" };

export type HostThread = {
  id: string;
  display_name: string;
  last_activity_time: string;
  messages: ChatMessage[];
};
