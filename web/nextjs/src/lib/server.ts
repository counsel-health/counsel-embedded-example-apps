const ServerApiHost = "http://localhost:4003";

export async function getCounselSignedAppUrl(userId: string) {
  const response = await fetch(`${ServerApiHost}/chat/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get signed app url: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.url;
}
