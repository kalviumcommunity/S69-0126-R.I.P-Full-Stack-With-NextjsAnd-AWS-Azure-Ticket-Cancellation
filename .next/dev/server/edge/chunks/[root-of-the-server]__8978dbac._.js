(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
;
;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
async function middleware(req) {
    const { pathname } = req.nextUrl;
    // Only protect specific routes
    if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
        // Extract token from Authorization header or cookies
        let token;
        // Try Authorization header first (Bearer token)
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
        // Fall back to token from cookies (used by the login page)
        if (!token) {
            token = req.cookies.get("token")?.value;
        }
        // Also check for accessToken cookie (for API-based login)
        if (!token) {
            token = req.cookies.get("accessToken")?.value;
        }
        if (!token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: "Token missing. Please log in."
            }, {
                status: 401
            });
        }
        // For the simple token from login page, just check the role cookie
        if (token === "secure-session") {
            const role = req.cookies.get("role")?.value;
            if (!role) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: "Role missing. Please log in again."
                }, {
                    status: 401
                });
            }
            // Role-based access control
            if (pathname.startsWith("/api/admin") && role !== "admin") {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: "Access denied. Admin role required."
                }, {
                    status: 403
                });
            }
            // Attach user info for downstream handlers
            const requestHeaders = new Headers(req.headers);
            requestHeaders.set("x-user-role", role);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                request: {
                    headers: requestHeaders
                }
            });
        }
        // For JWT tokens (from API login), verify with jose
        try {
            // Use jose to verify token (same library used for signing)
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
            const decoded = payload;
            // Role-based access control
            if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: "Access denied. Admin role required."
                }, {
                    status: 403
                });
            }
            // Attach user info for downstream handlers
            const requestHeaders = new Headers(req.headers);
            requestHeaders.set("x-user-id", decoded.id.toString());
            requestHeaders.set("x-user-email", decoded.email);
            requestHeaders.set("x-user-role", decoded.role);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                request: {
                    headers: requestHeaders
                }
            });
        } catch (error) {
            // Token verification failed
            if (error.code === "ERR_JWT_EXPIRED") {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    message: "Access token expired. Please use /api/auth/refresh to get a new token.",
                    code: "TOKEN_EXPIRED"
                }, {
                    status: 401
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: "Invalid or malformed token"
            }, {
                status: 403
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/api/admin/:path*",
        "/api/users/:path*"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map