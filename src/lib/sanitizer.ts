import sanitizeHtml from "sanitize-html";

export type SanitizeOptions = {
  skipKeys?: string[];
};

/**
 * Sanitize a single input value by stripping all tags and attributes.
 */
export const sanitizeInput = (input: unknown): string => {
  if (input === null || input === undefined) {
    return "";
  }

  const value = typeof input === "string" ? input : String(input);

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
};

const shouldSkipKey = (key: string, options?: SanitizeOptions) => {
  return options?.skipKeys?.includes(key);
};

/**
 * Recursively sanitize an object, array, or primitive. Useful for
 * sanitizing request payloads before validation or persistence.
 */
export const sanitizePayload = <T>(
  payload: T,
  options?: SanitizeOptions
): T => {
  if (typeof payload === "string") {
    return sanitizeInput(payload) as unknown as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) =>
      sanitizePayload(item, options)
    ) as unknown as T;
  }

  if (payload && typeof payload === "object") {
    const entries = Object.entries(payload as Record<string, unknown>).map(
      ([key, value]) => [
        key,
        shouldSkipKey(key, options)
          ? value
          : sanitizePayload(value as unknown as T, options),
      ]
    );

    return Object.fromEntries(entries) as T;
  }

  return payload;
};
