import { NextResponse } from "next/server";

/**
 * Unified success response envelope
 * @param data - The response data payload
 * @param message - Success message (default: "Success")
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = (data: any, message = "Success", status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Unified error response envelope
 * @param message - Error message
 * @param code - Error code (default: "INTERNAL_ERROR")
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 */
export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        details: details ? details.toString() : undefined,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};
