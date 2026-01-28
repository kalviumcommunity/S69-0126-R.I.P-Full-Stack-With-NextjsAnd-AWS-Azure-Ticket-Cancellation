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
  75468,
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
      c = e.i(47587),
      p = e.i(66012),
      R = e.i(70101),
      h = e.i(26937),
      x = e.i(10372),
      E = e.i(93695);
    e.i(52474);
    var f = e.i(220),
      v = e.i(2180),
      m = e.i(72949),
      g = e.i(82286),
      w = e.i(15874);
    async function y() {
      try {
        return (0, v.sendSuccess)([], "Users fetched successfully", 200);
      } catch (e) {
        return (0, v.sendError)(
          "Failed to fetch users",
          m.ERROR_CODES.DATABASE_FAILURE,
          500,
          e
        );
      }
    }
    async function C(e) {
      try {
        let t = await e.json(),
          r = g.userSchema.parse(t),
          a = { id: 0, name: r.name, email: r.email, age: r.age };
        return (0, v.sendSuccess)(a, "User created successfully", 201);
      } catch (e) {
        if (e instanceof w.ZodError)
          return (0, v.sendError)(
            "Validation failed",
            m.ERROR_CODES.VALIDATION_ERROR,
            400,
            e.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            }))
          );
        return (0, v.sendError)(
          "Failed to create user",
          m.ERROR_CODES.INTERNAL_ERROR,
          500,
          e
        );
      }
    }
    e.s(["GET", () => y, "POST", () => C], 52427);
    var A = e.i(52427);
    let O = new t.AppRouteRouteModule({
        definition: {
          kind: r.RouteKind.APP_ROUTE,
          page: "/api/users/route",
          pathname: "/api/users",
          filename: "route",
          bundlePath: "",
        },
        distDir: ".next",
        relativeProjectDir: "",
        resolvedPagePath: "[project]/src/app/api/users/route.ts",
        nextConfigOutput: "",
        userland: A,
      }),
      { workAsyncStorage: T, workUnitAsyncStorage: b, serverHooks: S } = O;
    function N() {
      return (0, a.patchFetch)({
        workAsyncStorage: T,
        workUnitAsyncStorage: b,
      });
    }
    async function _(e, t, a) {
      O.isDev &&
        (0, n.addRequestMeta)(
          e,
          "devRequestTimingInternalsEnd",
          process.hrtime.bigint()
        );
      let v = "/api/users/route";
      v = v.replace(/\/index$/, "") || "/";
      let m = await O.prepare(e, t, { srcPage: v, multiZoneDraftMode: !1 });
      if (!m)
        return (
          (t.statusCode = 400),
          t.end("Bad Request"),
          null == a.waitUntil || a.waitUntil.call(a, Promise.resolve()),
          null
        );
      let {
          buildId: g,
          params: w,
          nextConfig: y,
          parsedUrl: C,
          isDraftMode: A,
          prerenderManifest: T,
          routerServerContext: b,
          isOnDemandRevalidate: S,
          revalidateOnlyGenerated: N,
          resolvedPathname: _,
          clientReferenceManifest: P,
          serverActionsManifest: k,
        } = m,
        q = (0, o.normalizeAppPath)(v),
        j = !!(T.dynamicRoutes[q] || T.routes[_]),
        I = async () => (
          (null == b ? void 0 : b.render404)
            ? await b.render404(e, t, C, !1)
            : t.end("This page could not be found"),
          null
        );
      if (j && !A) {
        let e = !!T.routes[_],
          t = T.dynamicRoutes[q];
        if (t && !1 === t.fallback && !e) {
          if (y.experimental.adapterPath) return await I();
          throw new E.NoFallbackError();
        }
      }
      let U = null;
      !j || O.isDev || A || (U = "/index" === (U = _) ? "/" : U);
      let D = !0 === O.isDev || !j,
        H = j && !D;
      k &&
        P &&
        (0, i.setManifestsSingleton)({
          page: v,
          clientReferenceManifest: P,
          serverActionsManifest: k,
        });
      let M = e.method || "GET",
        F = (0, s.getTracer)(),
        $ = F.getActiveScopeSpan(),
        K = {
          params: w,
          prerenderManifest: T,
          renderOpts: {
            experimental: { authInterrupts: !!y.experimental.authInterrupts },
            cacheComponents: !!y.cacheComponents,
            supportsDynamicResponse: D,
            incrementalCache: (0, n.getRequestMeta)(e, "incrementalCache"),
            cacheLifeProfiles: y.cacheLife,
            waitUntil: a.waitUntil,
            onClose: (e) => {
              t.on("close", e);
            },
            onAfterTaskError: void 0,
            onInstrumentationRequestError: (t, r, a, n) =>
              O.onRequestError(e, t, a, n, b),
          },
          sharedContext: { buildId: g },
        },
        L = new l.NodeNextRequest(e),
        B = new l.NodeNextResponse(t),
        V = d.NextRequestAdapter.fromNodeNextRequest(
          L,
          (0, d.signalFromNodeResponse)(t)
        );
      try {
        let i = async (e) =>
            O.handle(V, K).finally(() => {
              if (!e) return;
              e.setAttributes({
                "http.status_code": t.statusCode,
                "next.rsc": !1,
              });
              let r = F.getRootSpanAttributes();
              if (!r) return;
              if (r.get("next.span_type") !== u.BaseServerSpan.handleRequest)
                return void console.warn(
                  `Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`
                );
              let a = r.get("next.route");
              if (a) {
                let t = `${M} ${a}`;
                (e.setAttributes({
                  "next.route": a,
                  "http.route": a,
                  "next.span_name": t,
                }),
                  e.updateName(t));
              } else e.updateName(`${M} ${v}`);
            }),
          o = !!(0, n.getRequestMeta)(e, "minimalMode"),
          l = async (n) => {
            var s, l;
            let d = async ({ previousCacheEntry: r }) => {
                try {
                  if (!o && S && N && !r)
                    return (
                      (t.statusCode = 404),
                      t.setHeader("x-nextjs-cache", "REVALIDATED"),
                      t.end("This page could not be found"),
                      null
                    );
                  let s = await i(n);
                  e.fetchMetrics = K.renderOpts.fetchMetrics;
                  let l = K.renderOpts.pendingWaitUntil;
                  l && a.waitUntil && (a.waitUntil(l), (l = void 0));
                  let d = K.renderOpts.collectedTags;
                  if (!j)
                    return (
                      await (0, p.sendResponse)(
                        L,
                        B,
                        s,
                        K.renderOpts.pendingWaitUntil
                      ),
                      null
                    );
                  {
                    let e = await s.blob(),
                      t = (0, R.toNodeOutgoingHttpHeaders)(s.headers);
                    (d && (t[x.NEXT_CACHE_TAGS_HEADER] = d),
                      !t["content-type"] &&
                        e.type &&
                        (t["content-type"] = e.type));
                    let r =
                        void 0 !== K.renderOpts.collectedRevalidate &&
                        !(
                          K.renderOpts.collectedRevalidate >= x.INFINITE_CACHE
                        ) &&
                        K.renderOpts.collectedRevalidate,
                      a =
                        void 0 === K.renderOpts.collectedExpire ||
                        K.renderOpts.collectedExpire >= x.INFINITE_CACHE
                          ? void 0
                          : K.renderOpts.collectedExpire;
                    return {
                      value: {
                        kind: f.CachedRouteKind.APP_ROUTE,
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
                      (await O.onRequestError(
                        e,
                        t,
                        {
                          routerKind: "App Router",
                          routePath: v,
                          routeType: "route",
                          revalidateReason: (0, c.getRevalidateReason)({
                            isStaticGeneration: H,
                            isOnDemandRevalidate: S,
                          }),
                        },
                        !1,
                        b
                      )),
                    t
                  );
                }
              },
              u = await O.handleResponse({
                req: e,
                nextConfig: y,
                cacheKey: U,
                routeKind: r.RouteKind.APP_ROUTE,
                isFallback: !1,
                prerenderManifest: T,
                isRoutePPREnabled: !1,
                isOnDemandRevalidate: S,
                revalidateOnlyGenerated: N,
                responseGenerator: d,
                waitUntil: a.waitUntil,
                isMinimalMode: o,
              });
            if (!j) return null;
            if (
              (null == u || null == (s = u.value) ? void 0 : s.kind) !==
              f.CachedRouteKind.APP_ROUTE
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
                S
                  ? "REVALIDATED"
                  : u.isMiss
                    ? "MISS"
                    : u.isStale
                      ? "STALE"
                      : "HIT"
              ),
              A &&
                t.setHeader(
                  "Cache-Control",
                  "private, no-cache, no-store, max-age=0, must-revalidate"
                ));
            let E = (0, R.fromNodeOutgoingHttpHeaders)(u.value.headers);
            return (
              (o && j) || E.delete(x.NEXT_CACHE_TAGS_HEADER),
              !u.cacheControl ||
                t.getHeader("Cache-Control") ||
                E.get("Cache-Control") ||
                E.set(
                  "Cache-Control",
                  (0, h.getCacheControlHeader)(u.cacheControl)
                ),
              await (0, p.sendResponse)(
                L,
                B,
                new Response(u.value.body, {
                  headers: E,
                  status: u.value.status || 200,
                })
              ),
              null
            );
          };
        $
          ? await l($)
          : await F.withPropagatedContext(e.headers, () =>
              F.trace(
                u.BaseServerSpan.handleRequest,
                {
                  spanName: `${M} ${v}`,
                  kind: s.SpanKind.SERVER,
                  attributes: { "http.method": M, "http.target": e.url },
                },
                l
              )
            );
      } catch (t) {
        if (
          (t instanceof E.NoFallbackError ||
            (await O.onRequestError(
              e,
              t,
              {
                routerKind: "App Router",
                routePath: q,
                routeType: "route",
                revalidateReason: (0, c.getRevalidateReason)({
                  isStaticGeneration: H,
                  isOnDemandRevalidate: S,
                }),
              },
              !1,
              b
            )),
          j)
        )
          throw t;
        return (
          await (0, p.sendResponse)(L, B, new Response(null, { status: 500 })),
          null
        );
      }
    }
    e.s(
      [
        "handler",
        () => _,
        "patchFetch",
        () => N,
        "routeModule",
        () => O,
        "serverHooks",
        () => S,
        "workAsyncStorage",
        () => T,
        "workUnitAsyncStorage",
        () => b,
      ],
      75468
    );
  },
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6f1776d._.js.map
