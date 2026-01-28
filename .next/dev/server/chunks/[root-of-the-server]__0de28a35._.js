module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUser",
    ()=>createUser,
    "default",
    ()=>__TURBOPACK__default__export__,
    "findUserByEmail",
    ()=>findUserByEmail,
    "getAllUsers",
    ()=>getAllUsers,
    "getPublicUsers",
    ()=>getPublicUsers,
    "toPublicUser",
    ()=>toPublicUser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
// Initialize Prisma Client
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
const __TURBOPACK__default__export__ = prisma;
let nextId = 1;
const users = [];
const findUserByEmail = (email)=>{
    return users.find((u)=>u.email === email);
};
const createUser = (params)=>{
    const user = {
        id: nextId++,
        name: params.name,
        email: params.email,
        passwordHash: params.passwordHash,
        role: params.role || "user",
        age: params.age,
        createdAt: new Date().toISOString()
    };
    users.push(user);
    return user;
};
const getAllUsers = ()=>{
    return users;
};
const toPublicUser = (user)=>{
    const { passwordHash, ...rest } = user;
    return rest;
};
const getPublicUsers = ()=>users.map(toPublicUser);
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getJWTSecret",
    ()=>getJWTSecret,
    "signAccessToken",
    ()=>signAccessToken,
    "signRefreshToken",
    ()=>signRefreshToken,
    "signToken",
    ()=>signToken,
    "verifyAccessToken",
    ()=>verifyAccessToken,
    "verifyRefreshToken",
    ()=>verifyRefreshToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
;
const getJWTSecret = ()=>{
    return process.env.JWT_SECRET || "supersecretkey";
};
const signAccessToken = async (payload)=>{
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setExpirationTime("24h").sign(new TextEncoder().encode(getJWTSecret()));
};
const signRefreshToken = async (payload)=>{
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setExpirationTime("90d").sign(new TextEncoder().encode(getJWTSecret()));
};
const signToken = async (payload, expiresIn = "1h")=>{
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setExpirationTime(expiresIn).sign(new TextEncoder().encode(getJWTSecret()));
};
const verifyToken = async (token)=>{
    try {
        const JWT_SECRET = new TextEncoder().encode(getJWTSecret());
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        return payload;
    } catch (error) {
        if (error.code === "ERR_JWT_EXPIRED") {
            throw new Error("Token has expired");
        }
        throw new Error("Invalid token");
    }
};
const verifyAccessToken = async (token)=>{
    return await verifyToken(token);
};
const verifyRefreshToken = async (token)=>{
    return await verifyToken(token);
};
}),
"[project]/src/app/api/admin/buses/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const buses = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].bus.findMany({
            include: {
                seats: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: buses
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error fetching buses:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to fetch buses"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        console.log("=== BUS CREATION REQUEST ===");
        // Verify admin token from cookies - check both token types
        let token = request.cookies.get("token")?.value;
        if (!token) {
            token = request.cookies.get("accessToken")?.value;
        }
        console.log("Token from cookies:", token ? "Present" : "Missing");
        if (!token) {
            console.log("ERROR: No token provided");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Unauthorized - No token provided"
            }, {
                status: 401
            });
        }
        // For simple token from login page, just check role cookie
        if (token === "secure-session") {
            const role = request.cookies.get("role")?.value;
            if (!role || role !== "admin") {
                console.log("ERROR: User role is not admin:", role);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Forbidden - Admin access required"
                }, {
                    status: 403
                });
            }
            console.log("Simple token verified. Role:", role);
        } else {
            // For JWT tokens, verify with jose
            let decoded;
            try {
                decoded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
                console.log("Token verified. User:", decoded.email, "Role:", decoded.role);
            } catch (error) {
                console.error("Token verification failed:", error);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Invalid token"
                }, {
                    status: 401
                });
            }
            // Check if user is admin
            if (decoded.role !== "admin") {
                console.log("ERROR: User role is not admin:", decoded.role);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "Forbidden - Admin access required"
                }, {
                    status: 403
                });
            }
        }
        const body = await request.json();
        let { busNumber, totalSeats = 40, leftSeatsPerRow = 2, rightSeatsPerRow = 3 } = body;
        console.log("Bus creation request:", {
            busNumber,
            totalSeats,
            leftSeatsPerRow,
            rightSeatsPerRow
        });
        if (!busNumber) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Bus number is required"
            }, {
                status: 400
            });
        }
        // Format bus number: convert to uppercase and ensure XX-YY-AA(A)-YYYY format
        // Where XX = exactly 2 letters, YY = 2 numbers, AA = 1-2 letters, YYYY = exactly 4 numbers
        busNumber = busNumber.toUpperCase().replace(/\s+/g, "");
        // Extract letters and numbers separately
        const letters = busNumber.replace(/[^A-Z]/g, "");
        const numbers = busNumber.replace(/[^0-9]/g, "");
        // Must have exactly 2 letters first, then 1-2 more letters (3-4 total) and exactly 6 numbers
        if (letters.length < 3 || letters.length > 4 || numbers.length !== 6) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Bus number format: 2 letters-2 numbers-1to2 letters-4 numbers (e.g., AB-12-C-3456 or AB-12-CD-3456)"
            }, {
                status: 400
            });
        }
        // Format as XX-YY-AA-YYYY or XX-YY-A-YYYY
        // Take first 2 letters, first 2 numbers, remaining letters (1-2), last 4 numbers
        busNumber = `${letters.slice(0, 2)}-${numbers.slice(0, 2)}-${letters.slice(2)}-${numbers.slice(2, 6)}`;
        // Calculate total rows
        const totalRows = Math.ceil(totalSeats / (leftSeatsPerRow + rightSeatsPerRow));
        // Create bus
        const bus = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].bus.create({
            data: {
                busNumber,
                totalSeats,
                leftSeatsPerRow,
                rightSeatsPerRow,
                totalRows
            }
        });
        console.log("Bus created:", busNumber, "with ID:", bus.id);
        // Create seats for the bus
        const seatsToCreate = [];
        let seatCount = 0;
        for(let row = 1; row <= totalRows && seatCount < totalSeats; row++){
            // Left side seats
            for(let seat = 1; seat <= leftSeatsPerRow && seatCount < totalSeats; seat++){
                seatsToCreate.push({
                    busId: bus.id,
                    seatNumber: `${row}L`,
                    row,
                    position: "LEFT",
                    status: "AVAILABLE"
                });
                seatCount++;
            }
            // Right side seats
            for(let seat = 1; seat <= rightSeatsPerRow && seatCount < totalSeats; seat++){
                seatsToCreate.push({
                    busId: bus.id,
                    seatNumber: `${row}R`,
                    row,
                    position: "RIGHT",
                    status: "AVAILABLE"
                });
                seatCount++;
            }
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].seat.createMany({
            data: seatsToCreate,
            skipDuplicates: true
        });
        console.log("Seats created successfully for bus:", busNumber);
        const busWithSeats = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].bus.findUnique({
            where: {
                id: bus.id
            },
            include: {
                seats: true
            }
        });
        console.log("Bus created successfully:", busNumber, "with", totalSeats, "seats");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Bus created with ${totalSeats} seats`,
            data: busWithSeats
        }, {
            status: 201
        });
    } catch (error) {
        console.error("ERROR creating bus:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to create bus",
            details: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0de28a35._.js.map