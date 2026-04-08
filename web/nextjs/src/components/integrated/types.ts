export type HostThread = {
  id: string;
  display_name: string;
  last_activity_time: string;
  messages: { role: "user" | "bot"; text: string }[];
};
