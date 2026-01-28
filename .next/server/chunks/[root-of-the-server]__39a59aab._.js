module.exports = [
  93695,
  (e, t, r) => {
    t.exports = e.x("next/dist/shared/lib/no-fallback-error.external.js", () =>
      require("next/dist/shared/lib/no-fallback-error.external.js")
    );
  },
  32319,
  (e, t, r) => {
    t.exports = e.x(
      "next/dist/server/app-render/work-unit-async-storage.external.js",
      () =>
        require("next/dist/server/app-render/work-unit-async-storage.external.js")
    );
  },
  24725,
  (e, t, r) => {
    t.exports = e.x(
      "next/dist/server/app-render/after-task-async-storage.external.js",
      () =>
        require("next/dist/server/app-render/after-task-async-storage.external.js")
    );
  },
  18622,
  (e, t, r) => {
    t.exports = e.x(
      "next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",
      () =>
        require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js")
    );
  },
  56704,
  (e, t, r) => {
    t.exports = e.x(
      "next/dist/server/app-render/work-async-storage.external.js",
      () =>
        require("next/dist/server/app-render/work-async-storage.external.js")
    );
  },
  70406,
  (e, t, r) => {
    t.exports = e.x("next/dist/compiled/@opentelemetry/api", () =>
      require("next/dist/compiled/@opentelemetry/api")
    );
  },
  10655,
  (e) => {
    "use strict";
    var t = e.i(47909),
      r = e.i(74017),
      a = e.i(96250),
      n = e.i(59756),
      s = e.i(61916),
      i = e.i(74677),
      o = e.i(69741),
      l = e.i(16795),
      d = e.i(87718),
      u = e.i(95169),
      p = e.i(47587),
      c = e.i(66012),
      R = e.i(70101),
      E = e.i(26937),
      h = e.i(10372),
      f = e.i(93695);
    e.i(52474);
    var x = e.i(220),
      m = e.i(2180),
      A = e.i(72949),
      v = e.i(82286),
      O = e.i(15874);
    async function g(e, { params: t }) {
      try {
        let { id: e } = await t,
          r = parseInt(e);
        if (isNaN(r))
          return (0, m.sendError)(
            "Invalid user ID format",
            A.ERROR_CODES.INVALID_FORMAT,
            400
          );
        return (0, m.sendError)("User not found", A.ERROR_CODES.NOT_FOUND, 404);
      } catch (e) {
        return (0, m.sendError)(
          "Failed to fetch user",
          A.ERROR_CODES.DATABASE_FAILURE,
          500,
          e
        );
      }
    }
    async function C(e, { params: t }) {
      try {
        let { id: r } = await t,
          a = parseInt(r),
          n = await e.json();
        if (isNaN(a))
          return (0, m.sendError)(
            "Invalid user ID format",
            A.ERROR_CODES.INVALID_FORMAT,
            400
          );
        let s = v.userSchema.parse(n),
          i = { id: a, name: s.name, email: s.email, age: s.age };
        return (0, m.sendSuccess)(i, "User updated successfully", 200);
      } catch (e) {
        if (e instanceof O.ZodError)
          return (0, m.sendError)(
            "Validation failed",
            A.ERROR_CODES.VALIDATION_ERROR,
            400,
            e.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            }))
          );
        return (0, m.sendError)(
          "Failed to update user",
          A.ERROR_CODES.DATABASE_FAILURE,
          500,
          e
        );
      }
    }
    async function w(e, { params: t }) {
      try {
        let { id: r } = await t,
          a = parseInt(r),
          n = await e.json();
        if (isNaN(a))
          return (0, m.sendError)(
            "Invalid user ID format",
            A.ERROR_CODES.INVALID_FORMAT,
            400
          );
        let s = v.userUpdateSchema.parse(n);
        if (0 === Object.keys(s).length)
          return (0, m.sendError)(
            "At least one field must be provided for update",
            A.ERROR_CODES.MISSING_FIELD,
            400
          );
        let i = { id: a, ...s };
        return (0, m.sendSuccess)(i, "User updated successfully", 200);
      } catch (e) {
        if (e instanceof O.ZodError)
          return (0, m.sendError)(
            "Validation failed",
            A.ERROR_CODES.VALIDATION_ERROR,
            400,
            e.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            }))
          );
        return (0, m.sendError)(
          "Failed to update user",
          A.ERROR_CODES.DATABASE_FAILURE,
          500,
          e
        );
      }
    }
    async function y(e, { params: t }) {
      try {
        let { id: e } = await t,
          r = parseInt(e);
        if (isNaN(r))
          return (0, m.sendError)(
            "Invalid user ID format",
            A.ERROR_CODES.INVALID_FORMAT,
            400
          );
        return (0, m.sendSuccess)(
          { id: r, name: "", email: "" },
          "User deleted successfully",
          200
        );
      } catch (e) {
        return (0, m.sendError)(
          "Failed to delete user",
          A.ERROR_CODES.DATABASE_FAILURE,
          500,
          e
        );
      }
    }
    e.s(
      ["DELETE", () => y, "GET", () => g, "PATCH", () => w, "PUT", () => C],
      97613
    );
    var I = e.i(97613);
    let _ = new t.AppRouteRouteModule({
        definition: {
          kind: r.RouteKind.APP_ROUTE,
          page: "/api/users/[id]/route",
          pathname: "/api/users/[id]",
          filename: "route",
          bundlePath: "",
        },
        distDir: ".next",
        relativeProjectDir: "",
        resolvedPagePath: "[project]/src/app/api/users/[id]/route.ts",
        nextConfigOutput: "",
        userland: I,
      }),
      { workAsyncStorage: D, workUnitAsyncStorage: S, serverHooks: N } = _;
    function T() {
      return (0, a.patchFetch)({
        workAsyncStorage: D,
        workUnitAsyncStorage: S,
      });
    }
    async function b(e, t, a) {
      _.isDev &&
        (0, n.addRequestMeta)(
          e,
          "devRequestTimingInternalsEnd",
          process.hrtime.bigint()
        );
      let m = "/api/users/[id]/route";
      m = m.replace(/\/index$/, "") || "/";
      let A = await _.prepare(e, t, { srcPage: m, multiZoneDraftMode: !1 });
      if (!A)
        return (
          (t.statusCode = 400),
          t.end("Bad Request"),
          null == a.waitUntil || a.waitUntil.call(a, Promise.resolve()),
          null
        );
      let {
          buildId: v,
          params: O,
          nextConfig: g,
          parsedUrl: C,
          isDraftMode: w,
          prerenderManifest: y,
          routerServerContext: I,
          isOnDemandRevalidate: D,
          revalidateOnlyGenerated: S,
          resolvedPathname: N,
          clientReferenceManifest: T,
          serverActionsManifest: b,
        } = A,
        U = (0, o.normalizeAppPath)(m),
        P = !!(y.dynamicRoutes[U] || y.routes[N]),
        j = async () => (
          (null == I ? void 0 : I.render404)
            ? await I.render404(e, t, C, !1)
            : t.end("This page could not be found"),
          null
        );
      if (P && !w) {
        let e = !!y.routes[N],
          t = y.dynamicRoutes[U];
        if (t && !1 === t.fallback && !e) {
          if (g.experimental.adapterPath) return await j();
          throw new f.NoFallbackError();
        }
      }
      let k = null;
      !P || _.isDev || w || (k = "/index" === (k = N) ? "/" : k);
      let F = !0 === _.isDev || !P,
        q = P && !F;
      b &&
        T &&
        (0, i.setManifestsSingleton)({
          page: m,
          clientReferenceManifest: T,
          serverActionsManifest: b,
        });
      let H = e.method || "GET",
        L = (0, s.getTracer)(),
        M = L.getActiveScopeSpan(),
        V = {
          params: O,
          prerenderManifest: y,
          renderOpts: {
            experimental: { authInterrupts: !!g.experimental.authInterrupts },
            cacheComponents: !!g.cacheComponents,
            supportsDynamicResponse: F,
            incrementalCache: (0, n.getRequestMeta)(e, "incrementalCache"),
            cacheLifeProfiles: g.cacheLife,
            waitUntil: a.waitUntil,
            onClose: (e) => {
              t.on("close", e);
            },
            onAfterTaskError: void 0,
            onInstrumentationRequestError: (t, r, a, n) =>
              _.onRequestError(e, t, a, n, I),
          },
          sharedContext: { buildId: v },
        },
        B = new l.NodeNextRequest(e),
        $ = new l.NodeNextResponse(t),
        K = d.NextRequestAdapter.fromNodeNextRequest(
          B,
          (0, d.signalFromNodeResponse)(t)
        );
      try {
        let i = async (e) =>
            _.handle(K, V).finally(() => {
              if (!e) return;
              e.setAttributes({
                "http.status_code": t.statusCode,
                "next.rsc": !1,
              });
              let r = L.getRootSpanAttributes();
              if (!r) return;
              if (r.get("next.span_type") !== u.BaseServerSpan.handleRequest)
                return void console.warn(
                  `Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`
                );
              let a = r.get("next.route");
              if (a) {
                let t = `${H} ${a}`;
                (e.setAttributes({
                  "next.route": a,
                  "http.route": a,
                  "next.span_name": t,
                }),
                  e.updateName(t));
              } else e.updateName(`${H} ${m}`);
            }),
          o = !!(0, n.getRequestMeta)(e, "minimalMode"),
          l = async (n) => {
            var s, l;
            let d = async ({ previousCacheEntry: r }) => {
                try {
                  if (!o && D && S && !r)
                    return (
                      (t.statusCode = 404),
                      t.setHeader("x-nextjs-cache", "REVALIDATED"),
                      t.end("This page could not be found"),
                      null
                    );
                  let s = await i(n);
                  e.fetchMetrics = V.renderOpts.fetchMetrics;
                  let l = V.renderOpts.pendingWaitUntil;
                  l && a.waitUntil && (a.waitUntil(l), (l = void 0));
                  let d = V.renderOpts.collectedTags;
                  if (!P)
                    return (
                      await (0, c.sendResponse)(
                        B,
                        $,
                        s,
                        V.renderOpts.pendingWaitUntil
                      ),
                      null
                    );
                  {
                    let e = await s.blob(),
                      t = (0, R.toNodeOutgoingHttpHeaders)(s.headers);
                    (d && (t[h.NEXT_CACHE_TAGS_HEADER] = d),
                      !t["content-type"] &&
                        e.type &&
                        (t["content-type"] = e.type));
                    let r =
                        void 0 !== V.renderOpts.collectedRevalidate &&
                        !(
                          V.renderOpts.collectedRevalidate >= h.INFINITE_CACHE
                        ) &&
                        V.renderOpts.collectedRevalidate,
                      a =
                        void 0 === V.renderOpts.collectedExpire ||
                        V.renderOpts.collectedExpire >= h.INFINITE_CACHE
                          ? void 0
                          : V.renderOpts.collectedExpire;
                    return {
                      value: {
                        kind: x.CachedRouteKind.APP_ROUTE,
                        status: s.status,
                        body: Buffer.from(await e.arrayBuffer()),
                        headers: t,
                      },
                      cacheControl: { revalidate: r, expire: a },
                    };
                  }
                } catch (t) {
                  throw (
                    (null == r ? void 0 : r.isStale) &&
                      (await _.onRequestError(
                        e,
                        t,
                        {
                          routerKind: "App Router",
                          routePath: m,
                          routeType: "route",
                          revalidateReason: (0, p.getRevalidateReason)({
                            isStaticGeneration: q,
                            isOnDemandRevalidate: D,
                          }),
                        },
                        !1,
                        I
                      )),
                    t
                  );
                }
              },
              u = await _.handleResponse({
                req: e,
                nextConfig: g,
                cacheKey: k,
                routeKind: r.RouteKind.APP_ROUTE,
                isFallback: !1,
                prerenderManifest: y,
                isRoutePPREnabled: !1,
                isOnDemandRevalidate: D,
                revalidateOnlyGenerated: S,
                responseGenerator: d,
                waitUntil: a.waitUntil,
                isMinimalMode: o,
              });
            if (!P) return null;
            if (
              (null == u || null == (s = u.value) ? void 0 : s.kind) !==
              x.CachedRouteKind.APP_ROUTE
            )
              throw Object.defineProperty(
                Error(
                  `Invariant: app-route received invalid cache entry ${null == u || null == (l = u.value) ? void 0 : l.kind}`
                ),
                "__NEXT_ERROR_CODE",
                { value: "E701", enumerable: !1, configurable: !0 }
              );
            (o ||
              t.setHeader(
                "x-nextjs-cache",
                D
                  ? "REVALIDATED"
                  : u.isMiss
                    ? "MISS"
                    : u.isStale
                      ? "STALE"
                      : "HIT"
              ),
              w &&
                t.setHeader(
                  "Cache-Control",
                  "private, no-cache, no-store, max-age=0, must-revalidate"
                ));
            let f = (0, R.fromNodeOutgoingHttpHeaders)(u.value.headers);
            return (
              (o && P) || f.delete(h.NEXT_CACHE_TAGS_HEADER),
              !u.cacheControl ||
                t.getHeader("Cache-Control") ||
                f.get("Cache-Control") ||
                f.set(
                  "Cache-Control",
                  (0, E.getCacheControlHeader)(u.cacheControl)
                ),
              await (0, c.sendResponse)(
                B,
                $,
                new Response(u.value.body, {
                  headers: f,
                  status: u.value.status || 200,
                })
              ),
              null
            );
          };
        M
          ? await l(M)
          : await L.withPropagatedContext(e.headers, () =>
              L.trace(
                u.BaseServerSpan.handleRequest,
                {
                  spanName: `${H} ${m}`,
                  kind: s.SpanKind.SERVER,
                  attributes: { "http.method": H, "http.target": e.url },
                },
                l
              )
            );
      } catch (t) {
        if (
          (t instanceof f.NoFallbackError ||
            (await _.onRequestError(
              e,
              t,
              {
                routerKind: "App Router",
                routePath: U,
                routeType: "route",
                revalidateReason: (0, p.getRevalidateReason)({
                  isStaticGeneration: q,
                  isOnDemandRevalidate: D,
                }),
              },
              !1,
              I
            )),
          P)
        )
          throw t;
        return (
          await (0, c.sendResponse)(B, $, new Response(null, { status: 500 })),
          null
        );
      }
    }
    e.s(
      [
        "handler",
        () => b,
        "patchFetch",
        () => T,
        "routeModule",
        () => _,
        "serverHooks",
        () => N,
        "workAsyncStorage",
        () => D,
        "workUnitAsyncStorage",
        () => S,
      ],
      10655
    );
  },
];

//# sourceMappingURL=%5Broot-of-the-server%5D__39a59aab._.js.map
