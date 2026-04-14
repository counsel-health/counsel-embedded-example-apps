export const counselQueryKeys = {
  threads: (userId: string) => ["counsel", "threads", userId] as const,
  preloadedSignedUrl: (userId: string) => ["counsel", "preloadedSignedUrl", userId] as const,
};
