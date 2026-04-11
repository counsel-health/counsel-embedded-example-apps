/**
 * Animated "thinking" indicator — three bouncing dots shown while
 * a bot response is being generated.
 */
export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3 w-fit">
      <span className="size-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:0ms]" />
      <span className="size-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:150ms]" />
      <span className="size-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
