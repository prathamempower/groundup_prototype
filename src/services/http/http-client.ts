export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsedError = errorText;
    try {
      const json = JSON.parse(errorText);
      parsedError = json.error || json.message || errorText;
    } catch {}
    throw new Error(`API Error (${res.status}): ${parsedError}`);
  }

  return res.json() as Promise<T>;
}
