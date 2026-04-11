export const counselQueryKeys = {
  threads: (userId: string) => ["counsel", "threads", userId] as const,
};
