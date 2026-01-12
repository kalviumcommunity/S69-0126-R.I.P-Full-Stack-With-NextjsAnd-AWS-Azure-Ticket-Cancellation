/**
 * Standardized error codes for the API
 * Format: E### where ### is a unique number
 */
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: "E001",
  MISSING_FIELD: "E002",
  INVALID_FORMAT: "E003",

  // Resource errors
  NOT_FOUND: "E004",
  DUPLICATE_RESOURCE: "E005",
  RESOURCE_CONFLICT: "E006",

  // Database errors
  DATABASE_FAILURE: "E007",
  QUERY_ERROR: "E008",

  // Authentication & Authorization
  UNAUTHORIZED: "E009",
  FORBIDDEN: "E010",

  // Server errors
  INTERNAL_ERROR: "E500",
  SERVICE_UNAVAILABLE: "E503",
};

/**
 * Get a descriptive error message by code
 */
export const getErrorMessage = (code: keyof typeof ERROR_CODES): string => {
  const messages: Record<keyof typeof ERROR_CODES, string> = {
    VALIDATION_ERROR: "Validation failed",
    MISSING_FIELD: "Missing required field",
    INVALID_FORMAT: "Invalid format",
    NOT_FOUND: "Resource not found",
    DUPLICATE_RESOURCE: "Resource already exists",
    RESOURCE_CONFLICT: "Resource conflict",
    DATABASE_FAILURE: "Database operation failed",
    QUERY_ERROR: "Query execution failed",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Forbidden resource",
    INTERNAL_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service unavailable",
  };

  return messages[code] || "Unknown error";
};
