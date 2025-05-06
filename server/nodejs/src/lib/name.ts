export function parseName(name: string) {
  const [firstName, lastName] = name.split(" ");
  return { firstName, lastName };
}
