let latencyMs = 140;

export function setMockLatency(ms: number) {
  latencyMs = ms;
}

export async function simulate<T>(value: T, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) {
    throw new DOMException("The request was aborted.", "AbortError");
  }
  if (latencyMs === 0) return value;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, latencyMs);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("The request was aborted.", "AbortError"));
      },
      { once: true },
    );
  });
  return value;
}
