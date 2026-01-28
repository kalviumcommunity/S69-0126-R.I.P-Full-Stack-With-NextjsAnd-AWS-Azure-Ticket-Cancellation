// src/lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "An error occurred while fetching data.");
  }
  return res.json();
};