!(function () {
  try {
    var e =
        "undefined" != typeof window
          ? window
          : "undefined" != typeof global
            ? global
            : "undefined" != typeof globalThis
              ? globalThis
              : "undefined" != typeof self
                ? self
                : {},
      n = new e.Error().stack;
    n &&
      ((e._posthogChunkIds = e._posthogChunkIds || {}),
      (e._posthogChunkIds[n] = "019eced5-9986-79b1-ae68-909218ab9d3c"));
  } catch (e) {}
})();
import {
  f as en,
  T as tn,
  E as oo,
  d as ro,
  a as so,
  b as io,
  m as ao,
  c as co,
  e as lo,
  g as uo,
  t as Me,
  h as ho,
  w as pt,
  i as po,
  S as ft,
  l as fo,
  n as mo,
  j as go,
  R as yo,
  k as bo,
  o as mt,
  F as vo,
  p as _o,
  q as wo,
  r as So,
  s as ko,
  u as gt,
  v as Io,
  x as xo,
  y as To,
  z as yt,
  A as bt,
  B as vt,
  C as zo,
  D as _t,
  G as wt,
  H as St,
  I as Po,
  J as $o,
  K as Co,
  L as No,
} from "./index-xWMl0dnQ.js";
function p(e, t, n) {
  function o(a, l) {
    if (
      (a._zod ||
        Object.defineProperty(a, "_zod", {
          value: { def: l, constr: s, traits: new Set() },
          enumerable: !1,
        }),
      a._zod.traits.has(e))
    )
      return;
    (a._zod.traits.add(e), t(a, l));
    const c = s.prototype,
      d = Object.keys(c);
    for (let u = 0; u < d.length; u++) {
      const h = d[u];
      h in a || (a[h] = c[h].bind(a));
    }
  }
  const r = n?.Parent ?? Object;
  class i extends r {}
  Object.defineProperty(i, "name", { value: e });
  function s(a) {
    var l;
    const c = n?.Parent ? new i() : this;
    (o(c, a), (l = c._zod).deferred ?? (l.deferred = []));
    for (const d of c._zod.deferred) d();
    return c;
  }
  return (
    Object.defineProperty(s, "init", { value: o }),
    Object.defineProperty(s, Symbol.hasInstance, {
      value: (a) =>
        n?.Parent && a instanceof n.Parent ? !0 : a?._zod?.traits?.has(e),
    }),
    Object.defineProperty(s, "name", { value: e }),
    s
  );
}
class ce extends Error {
  constructor() {
    super(
      "Encountered Promise during synchronous parse. Use .parseAsync() instead.",
    );
  }
}
class nn extends Error {
  constructor(t) {
    (super(`Encountered unidirectional transform during encode: ${t}`),
      (this.name = "ZodEncodeError"));
  }
}
const on = {};
function Y(e) {
  return on;
}
function rn(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e)
    .filter(([o, r]) => t.indexOf(+o) === -1)
    .map(([o, r]) => r);
}
function We(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Ke(e) {
  return {
    get value() {
      {
        const t = e();
        return (Object.defineProperty(this, "value", { value: t }), t);
      }
    },
  };
}
function qe(e) {
  return e == null;
}
function Ye(e) {
  const t = e.startsWith("^") ? 1 : 0,
    n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Oo(e, t) {
  const n = (e.toString().split(".")[1] || "").length,
    o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const l = o.match(/\d?e-(\d?)/);
    l?.[1] && (r = Number.parseInt(l[1]));
  }
  const i = n > r ? n : r,
    s = Number.parseInt(e.toFixed(i).replace(".", "")),
    a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return (s % a) / 10 ** i;
}
const kt = Symbol("evaluating");
function I(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== kt) return (o === void 0 && ((o = kt), (o = n())), o);
    },
    set(r) {
      Object.defineProperty(e, t, { value: r });
    },
    configurable: !0,
  });
}
function oe(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0,
  });
}
function Q(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function It(e) {
  return JSON.stringify(e);
}
function Eo(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const sn =
  "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Ie(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const Zo = Ke(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return (new e(""), !0);
  } catch {
    return !1;
  }
});
function le(e) {
  if (Ie(e) === !1) return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function") return !0;
  const n = t.prototype;
  return !(
    Ie(n) === !1 ||
    Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1
  );
}
function an(e) {
  return le(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Ao = new Set(["string", "number", "symbol"]);
function de(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ee(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return ((!t || n?.parent) && (o._zod.parent = e), o);
}
function g(e) {
  const t = e;
  if (!t) return {};
  if (typeof t == "string") return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return (
    delete t.message,
    typeof t.error == "string" ? { ...t, error: () => t.error } : t
  );
}
function Do(e) {
  return Object.keys(e).filter(
    (t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional",
  );
}
const Ro = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function Uo(e, t) {
  const n = e._zod.def,
    o = n.checks;
  if (o && o.length > 0)
    throw new Error(
      ".pick() cannot be used on object schemas containing refinements",
    );
  const i = Q(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape)) throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return (oe(this, "shape", s), s);
    },
    checks: [],
  });
  return ee(e, i);
}
function Mo(e, t) {
  const n = e._zod.def,
    o = n.checks;
  if (o && o.length > 0)
    throw new Error(
      ".omit() cannot be used on object schemas containing refinements",
    );
  const i = Q(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape)) throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return (oe(this, "shape", s), s);
    },
    checks: [],
  });
  return ee(e, i);
}
function jo(e, t) {
  if (!le(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  const r = Q(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return (oe(this, "shape", i), i);
    },
  });
  return ee(e, r);
}
function Fo(e, t) {
  if (!le(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = Q(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return (oe(this, "shape", o), o);
    },
  });
  return ee(e, n);
}
function Ho(e, t) {
  const n = Q(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return (oe(this, "shape", o), o);
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: [],
  });
  return ee(e, n);
}
function Lo(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(
      ".partial() cannot be used on object schemas containing refinements",
    );
  const s = Q(t._zod.def, {
    get shape() {
      const a = t._zod.def.shape,
        l = { ...a };
      if (n)
        for (const c in n) {
          if (!(c in a)) throw new Error(`Unrecognized key: "${c}"`);
          n[c] &&
            (l[c] = e ? new e({ type: "optional", innerType: a[c] }) : a[c]);
        }
      else
        for (const c in a)
          l[c] = e ? new e({ type: "optional", innerType: a[c] }) : a[c];
      return (oe(this, "shape", l), l);
    },
    checks: [],
  });
  return ee(t, s);
}
function Wo(e, t, n) {
  const o = Q(t._zod.def, {
    get shape() {
      const r = t._zod.def.shape,
        i = { ...r };
      if (n)
        for (const s in n) {
          if (!(s in i)) throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (i[s] = new e({ type: "nonoptional", innerType: r[s] }));
        }
      else
        for (const s in r)
          i[s] = new e({ type: "nonoptional", innerType: r[s] });
      return (oe(this, "shape", i), i);
    },
  });
  return ee(t, o);
}
function ie(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0) return !0;
  return !1;
}
function ae(e, t) {
  return t.map((n) => {
    var o;
    return ((o = n).path ?? (o.path = []), n.path.unshift(e), n);
  });
}
function we(e) {
  return typeof e == "string" ? e : e?.message;
}
function X(e, t, n) {
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const r =
      we(e.inst?._zod.def?.error?.(e)) ??
      we(t?.error?.(e)) ??
      we(n.customError?.(e)) ??
      we(n.localeError?.(e)) ??
      "Invalid input";
    o.message = r;
  }
  return (
    delete o.inst,
    delete o.continue,
    t?.reportInput || delete o.input,
    o
  );
}
function Xe(e) {
  return Array.isArray(e)
    ? "array"
    : typeof e == "string"
      ? "string"
      : "unknown";
}
function ge(...e) {
  const [t, n, o] = e;
  return typeof t == "string"
    ? { message: t, code: "custom", input: n, inst: o }
    : { ...t };
}
const cn = (e, t) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: t, enumerable: !1 }),
      (e.message = JSON.stringify(t, We, 2)),
      Object.defineProperty(e, "toString", {
        value: () => e.message,
        enumerable: !1,
      }));
  },
  ln = p("$ZodError", cn),
  dn = p("$ZodError", cn, { Parent: Error });
function Jo(e, t = (n) => n.message) {
  const n = {},
    o = [];
  for (const r of e.issues)
    r.path.length > 0
      ? ((n[r.path[0]] = n[r.path[0]] || []), n[r.path[0]].push(t(r)))
      : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function Vo(e, t = (n) => n.message) {
  const n = { _errors: [] },
    o = (r) => {
      for (const i of r.issues)
        if (i.code === "invalid_union" && i.errors.length)
          i.errors.map((s) => o({ issues: s }));
        else if (i.code === "invalid_key") o({ issues: i.issues });
        else if (i.code === "invalid_element") o({ issues: i.issues });
        else if (i.path.length === 0) n._errors.push(t(i));
        else {
          let s = n,
            a = 0;
          for (; a < i.path.length; ) {
            const l = i.path[a];
            (a === i.path.length - 1
              ? ((s[l] = s[l] || { _errors: [] }), s[l]._errors.push(t(i)))
              : (s[l] = s[l] || { _errors: [] }),
              (s = s[l]),
              a++);
          }
        }
    };
  return (o(e), n);
}
const Qe = (e) => (t, n, o, r) => {
    const i = o ? Object.assign(o, { async: !1 }) : { async: !1 },
      s = t._zod.run({ value: n, issues: [] }, i);
    if (s instanceof Promise) throw new ce();
    if (s.issues.length) {
      const a = new (r?.Err ?? e)(s.issues.map((l) => X(l, i, Y())));
      throw (sn(a, r?.callee), a);
    }
    return s.value;
  },
  et = (e) => async (t, n, o, r) => {
    const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
    let s = t._zod.run({ value: n, issues: [] }, i);
    if ((s instanceof Promise && (s = await s), s.issues.length)) {
      const a = new (r?.Err ?? e)(s.issues.map((l) => X(l, i, Y())));
      throw (sn(a, r?.callee), a);
    }
    return s.value;
  },
  Ne = (e) => (t, n, o) => {
    const r = o ? { ...o, async: !1 } : { async: !1 },
      i = t._zod.run({ value: n, issues: [] }, r);
    if (i instanceof Promise) throw new ce();
    return i.issues.length
      ? { success: !1, error: new (e ?? ln)(i.issues.map((s) => X(s, r, Y()))) }
      : { success: !0, data: i.value };
  },
  Bo = Ne(dn),
  Oe = (e) => async (t, n, o) => {
    const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
    let i = t._zod.run({ value: n, issues: [] }, r);
    return (
      i instanceof Promise && (i = await i),
      i.issues.length
        ? { success: !1, error: new e(i.issues.map((s) => X(s, r, Y()))) }
        : { success: !0, data: i.value }
    );
  },
  Go = Oe(dn),
  Ko = (e) => (t, n, o) => {
    const r = o
      ? Object.assign(o, { direction: "backward" })
      : { direction: "backward" };
    return Qe(e)(t, n, r);
  },
  qo = (e) => (t, n, o) => Qe(e)(t, n, o),
  Yo = (e) => async (t, n, o) => {
    const r = o
      ? Object.assign(o, { direction: "backward" })
      : { direction: "backward" };
    return et(e)(t, n, r);
  },
  Xo = (e) => async (t, n, o) => et(e)(t, n, o),
  Qo = (e) => (t, n, o) => {
    const r = o
      ? Object.assign(o, { direction: "backward" })
      : { direction: "backward" };
    return Ne(e)(t, n, r);
  },
  er = (e) => (t, n, o) => Ne(e)(t, n, o),
  tr = (e) => async (t, n, o) => {
    const r = o
      ? Object.assign(o, { direction: "backward" })
      : { direction: "backward" };
    return Oe(e)(t, n, r);
  },
  nr = (e) => async (t, n, o) => Oe(e)(t, n, o),
  or = /^[cC][^\s-]{8,}$/,
  rr = /^[0-9a-z]+$/,
  sr = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  ir = /^[0-9a-vA-V]{20}$/,
  ar = /^[A-Za-z0-9]{27}$/,
  cr = /^[a-zA-Z0-9_-]{21}$/,
  lr =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  dr =
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  xt = (e) =>
    e
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  ur =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  hr = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function pr() {
  return new RegExp(hr, "u");
}
const fr =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  mr =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  gr =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  yr =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  br =
    /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  un = /^[A-Za-z0-9_-]*$/,
  vr = /^\+[1-9]\d{6,14}$/,
  hn =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  _r = new RegExp(`^${hn}$`);
function pn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${t}`
      : e.precision === 0
        ? `${t}:[0-5]\\d`
        : `${t}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function wr(e) {
  return new RegExp(`^${pn(e)}$`);
}
function Sr(e) {
  const t = pn({ precision: e.precision }),
    n = ["Z"];
  (e.local && n.push(""),
    e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${hn}T(?:${o})$`);
}
const kr = (e) => {
    const t = e
      ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}`
      : "[\\s\\S]*";
    return new RegExp(`^${t}$`);
  },
  Ir = /^-?\d+$/,
  fn = /^-?\d+(?:\.\d+)?$/,
  xr = /^(?:true|false)$/i,
  Tr = /^[^A-Z]*$/,
  zr = /^[^a-z]*$/,
  j = p("$ZodCheck", (e, t) => {
    var n;
    (e._zod ?? (e._zod = {}),
      (e._zod.def = t),
      (n = e._zod).onattach ?? (n.onattach = []));
  }),
  mn = { number: "number", bigint: "bigint", object: "date" },
  gn = p("$ZodCheckLessThan", (e, t) => {
    j.init(e, t);
    const n = mn[typeof t.value];
    (e._zod.onattach.push((o) => {
      const r = o._zod.bag,
        i =
          (t.inclusive ? r.maximum : r.exclusiveMaximum) ??
          Number.POSITIVE_INFINITY;
      t.value < i &&
        (t.inclusive ? (r.maximum = t.value) : (r.exclusiveMaximum = t.value));
    }),
      (e._zod.check = (o) => {
        (t.inclusive ? o.value <= t.value : o.value < t.value) ||
          o.issues.push({
            origin: n,
            code: "too_big",
            maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: o.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  yn = p("$ZodCheckGreaterThan", (e, t) => {
    j.init(e, t);
    const n = mn[typeof t.value];
    (e._zod.onattach.push((o) => {
      const r = o._zod.bag,
        i =
          (t.inclusive ? r.minimum : r.exclusiveMinimum) ??
          Number.NEGATIVE_INFINITY;
      t.value > i &&
        (t.inclusive ? (r.minimum = t.value) : (r.exclusiveMinimum = t.value));
    }),
      (e._zod.check = (o) => {
        (t.inclusive ? o.value >= t.value : o.value > t.value) ||
          o.issues.push({
            origin: n,
            code: "too_small",
            minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: o.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Pr = p("$ZodCheckMultipleOf", (e, t) => {
    (j.init(e, t),
      e._zod.onattach.push((n) => {
        var o;
        (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
      }),
      (e._zod.check = (n) => {
        if (typeof n.value != typeof t.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof n.value == "bigint"
          ? n.value % t.value === BigInt(0)
          : Oo(n.value, t.value) === 0) ||
          n.issues.push({
            origin: typeof n.value,
            code: "not_multiple_of",
            divisor: t.value,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  $r = p("$ZodCheckNumberFormat", (e, t) => {
    (j.init(e, t), (t.format = t.format || "float64"));
    const n = t.format?.includes("int"),
      o = n ? "int" : "number",
      [r, i] = Ro[t.format];
    (e._zod.onattach.push((s) => {
      const a = s._zod.bag;
      ((a.format = t.format),
        (a.minimum = r),
        (a.maximum = i),
        n && (a.pattern = Ir));
    }),
      (e._zod.check = (s) => {
        const a = s.value;
        if (n) {
          if (!Number.isInteger(a)) {
            s.issues.push({
              expected: o,
              format: t.format,
              code: "invalid_type",
              continue: !1,
              input: a,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(a)) {
            a > 0
              ? s.issues.push({
                  input: a,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: o,
                  inclusive: !0,
                  continue: !t.abort,
                })
              : s.issues.push({
                  input: a,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: o,
                  inclusive: !0,
                  continue: !t.abort,
                });
            return;
          }
        }
        (a < r &&
          s.issues.push({
            origin: "number",
            input: a,
            code: "too_small",
            minimum: r,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          a > i &&
            s.issues.push({
              origin: "number",
              input: a,
              code: "too_big",
              maximum: i,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Cr = p("$ZodCheckMaxLength", (e, t) => {
    var n;
    (j.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (o) => {
          const r = o.value;
          return !qe(r) && r.length !== void 0;
        }),
      e._zod.onattach.push((o) => {
        const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        t.maximum < r && (o._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (o) => {
        const r = o.value;
        if (r.length <= t.maximum) return;
        const s = Xe(r);
        o.issues.push({
          origin: s,
          code: "too_big",
          maximum: t.maximum,
          inclusive: !0,
          input: r,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Nr = p("$ZodCheckMinLength", (e, t) => {
    var n;
    (j.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (o) => {
          const r = o.value;
          return !qe(r) && r.length !== void 0;
        }),
      e._zod.onattach.push((o) => {
        const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        t.minimum > r && (o._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (o) => {
        const r = o.value;
        if (r.length >= t.minimum) return;
        const s = Xe(r);
        o.issues.push({
          origin: s,
          code: "too_small",
          minimum: t.minimum,
          inclusive: !0,
          input: r,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Or = p("$ZodCheckLengthEquals", (e, t) => {
    var n;
    (j.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (o) => {
          const r = o.value;
          return !qe(r) && r.length !== void 0;
        }),
      e._zod.onattach.push((o) => {
        const r = o._zod.bag;
        ((r.minimum = t.length), (r.maximum = t.length), (r.length = t.length));
      }),
      (e._zod.check = (o) => {
        const r = o.value,
          i = r.length;
        if (i === t.length) return;
        const s = Xe(r),
          a = i > t.length;
        o.issues.push({
          origin: s,
          ...(a
            ? { code: "too_big", maximum: t.length }
            : { code: "too_small", minimum: t.length }),
          inclusive: !0,
          exact: !0,
          input: o.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  Ee = p("$ZodCheckStringFormat", (e, t) => {
    var n, o;
    (j.init(e, t),
      e._zod.onattach.push((r) => {
        const i = r._zod.bag;
        ((i.format = t.format),
          t.pattern &&
            (i.patterns ?? (i.patterns = new Set()),
            i.patterns.add(t.pattern)));
      }),
      t.pattern
        ? ((n = e._zod).check ??
          (n.check = (r) => {
            ((t.pattern.lastIndex = 0),
              !t.pattern.test(r.value) &&
                r.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: t.format,
                  input: r.value,
                  ...(t.pattern ? { pattern: t.pattern.toString() } : {}),
                  inst: e,
                  continue: !t.abort,
                }));
          }))
        : ((o = e._zod).check ?? (o.check = () => {})));
  }),
  Er = p("$ZodCheckRegex", (e, t) => {
    (Ee.init(e, t),
      (e._zod.check = (n) => {
        ((t.pattern.lastIndex = 0),
          !t.pattern.test(n.value) &&
            n.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: n.value,
              pattern: t.pattern.toString(),
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  Zr = p("$ZodCheckLowerCase", (e, t) => {
    (t.pattern ?? (t.pattern = Tr), Ee.init(e, t));
  }),
  Ar = p("$ZodCheckUpperCase", (e, t) => {
    (t.pattern ?? (t.pattern = zr), Ee.init(e, t));
  }),
  Dr = p("$ZodCheckIncludes", (e, t) => {
    j.init(e, t);
    const n = de(t.includes),
      o = new RegExp(
        typeof t.position == "number" ? `^.{${t.position}}${n}` : n,
      );
    ((t.pattern = o),
      e._zod.onattach.push((r) => {
        const i = r._zod.bag;
        (i.patterns ?? (i.patterns = new Set()), i.patterns.add(o));
      }),
      (e._zod.check = (r) => {
        r.value.includes(t.includes, t.position) ||
          r.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: t.includes,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Rr = p("$ZodCheckStartsWith", (e, t) => {
    j.init(e, t);
    const n = new RegExp(`^${de(t.prefix)}.*`);
    (t.pattern ?? (t.pattern = n),
      e._zod.onattach.push((o) => {
        const r = o._zod.bag;
        (r.patterns ?? (r.patterns = new Set()), r.patterns.add(n));
      }),
      (e._zod.check = (o) => {
        o.value.startsWith(t.prefix) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: t.prefix,
            input: o.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Ur = p("$ZodCheckEndsWith", (e, t) => {
    j.init(e, t);
    const n = new RegExp(`.*${de(t.suffix)}$`);
    (t.pattern ?? (t.pattern = n),
      e._zod.onattach.push((o) => {
        const r = o._zod.bag;
        (r.patterns ?? (r.patterns = new Set()), r.patterns.add(n));
      }),
      (e._zod.check = (o) => {
        o.value.endsWith(t.suffix) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: t.suffix,
            input: o.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Mr = p("$ZodCheckOverwrite", (e, t) => {
    (j.init(e, t),
      (e._zod.check = (n) => {
        n.value = t.tx(n.value);
      }));
  });
class jr {
  constructor(t = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = t));
  }
  indented(t) {
    ((this.indent += 1), t(this), (this.indent -= 1));
  }
  write(t) {
    if (typeof t == "function") {
      (t(this, { execution: "sync" }), t(this, { execution: "async" }));
      return;
    }
    const o = t
        .split(
          `
`,
        )
        .filter((s) => s),
      r = Math.min(...o.map((s) => s.length - s.trimStart().length)),
      i = o.map((s) => s.slice(r)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i) this.content.push(s);
  }
  compile() {
    const t = Function,
      n = this?.args,
      r = [...(this?.content ?? [""]).map((i) => `  ${i}`)];
    return new t(
      ...n,
      r.join(`
`),
    );
  }
}
const Fr = { major: 4, minor: 3, patch: 6 },
  C = p("$ZodType", (e, t) => {
    var n;
    (e ?? (e = {}),
      (e._zod.def = t),
      (e._zod.bag = e._zod.bag || {}),
      (e._zod.version = Fr));
    const o = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && o.unshift(e);
    for (const r of o) for (const i of r._zod.onattach) i(e);
    if (o.length === 0)
      ((n = e._zod).deferred ?? (n.deferred = []),
        e._zod.deferred?.push(() => {
          e._zod.run = e._zod.parse;
        }));
    else {
      const r = (s, a, l) => {
          let c = ie(s),
            d;
          for (const u of a) {
            if (u._zod.def.when) {
              if (!u._zod.def.when(s)) continue;
            } else if (c) continue;
            const h = s.issues.length,
              f = u._zod.check(s);
            if (f instanceof Promise && l?.async === !1) throw new ce();
            if (d || f instanceof Promise)
              d = (d ?? Promise.resolve()).then(async () => {
                (await f, s.issues.length !== h && (c || (c = ie(s, h))));
              });
            else {
              if (s.issues.length === h) continue;
              c || (c = ie(s, h));
            }
          }
          return d ? d.then(() => s) : s;
        },
        i = (s, a, l) => {
          if (ie(s)) return ((s.aborted = !0), s);
          const c = r(a, o, l);
          if (c instanceof Promise) {
            if (l.async === !1) throw new ce();
            return c.then((d) => e._zod.parse(d, l));
          }
          return e._zod.parse(c, l);
        };
      e._zod.run = (s, a) => {
        if (a.skipChecks) return e._zod.parse(s, a);
        if (a.direction === "backward") {
          const c = e._zod.parse(
            { value: s.value, issues: [] },
            { ...a, skipChecks: !0 },
          );
          return c instanceof Promise ? c.then((d) => i(d, s, a)) : i(c, s, a);
        }
        const l = e._zod.parse(s, a);
        if (l instanceof Promise) {
          if (a.async === !1) throw new ce();
          return l.then((c) => r(c, o, a));
        }
        return r(l, o, a);
      };
    }
    I(e, "~standard", () => ({
      validate: (r) => {
        try {
          const i = Bo(e, r);
          return i.success ? { value: i.data } : { issues: i.error?.issues };
        } catch {
          return Go(e, r).then((s) =>
            s.success ? { value: s.data } : { issues: s.error?.issues },
          );
        }
      },
      vendor: "zod",
      version: 1,
    }));
  }),
  tt = p("$ZodString", (e, t) => {
    (C.init(e, t),
      (e._zod.pattern =
        [...(e?._zod.bag?.patterns ?? [])].pop() ?? kr(e._zod.bag)),
      (e._zod.parse = (n, o) => {
        if (t.coerce)
          try {
            n.value = String(n.value);
          } catch {}
        return (
          typeof n.value == "string" ||
            n.issues.push({
              expected: "string",
              code: "invalid_type",
              input: n.value,
              inst: e,
            }),
          n
        );
      }));
  }),
  P = p("$ZodStringFormat", (e, t) => {
    (Ee.init(e, t), tt.init(e, t));
  }),
  Hr = p("$ZodGUID", (e, t) => {
    (t.pattern ?? (t.pattern = dr), P.init(e, t));
  }),
  Lr = p("$ZodUUID", (e, t) => {
    if (t.version) {
      const o = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[
        t.version
      ];
      if (o === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
      t.pattern ?? (t.pattern = xt(o));
    } else t.pattern ?? (t.pattern = xt());
    P.init(e, t);
  }),
  Wr = p("$ZodEmail", (e, t) => {
    (t.pattern ?? (t.pattern = ur), P.init(e, t));
  }),
  Jr = p("$ZodURL", (e, t) => {
    (P.init(e, t),
      (e._zod.check = (n) => {
        try {
          const o = n.value.trim(),
            r = new URL(o);
          (t.hostname &&
            ((t.hostname.lastIndex = 0),
            t.hostname.test(r.hostname) ||
              n.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: t.hostname.source,
                input: n.value,
                inst: e,
                continue: !t.abort,
              })),
            t.protocol &&
              ((t.protocol.lastIndex = 0),
              t.protocol.test(
                r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol,
              ) ||
                n.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: t.protocol.source,
                  input: n.value,
                  inst: e,
                  continue: !t.abort,
                })),
            t.normalize ? (n.value = r.href) : (n.value = o));
          return;
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "url",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  Vr = p("$ZodEmoji", (e, t) => {
    (t.pattern ?? (t.pattern = pr()), P.init(e, t));
  }),
  Br = p("$ZodNanoID", (e, t) => {
    (t.pattern ?? (t.pattern = cr), P.init(e, t));
  }),
  Gr = p("$ZodCUID", (e, t) => {
    (t.pattern ?? (t.pattern = or), P.init(e, t));
  }),
  Kr = p("$ZodCUID2", (e, t) => {
    (t.pattern ?? (t.pattern = rr), P.init(e, t));
  }),
  qr = p("$ZodULID", (e, t) => {
    (t.pattern ?? (t.pattern = sr), P.init(e, t));
  }),
  Yr = p("$ZodXID", (e, t) => {
    (t.pattern ?? (t.pattern = ir), P.init(e, t));
  }),
  Xr = p("$ZodKSUID", (e, t) => {
    (t.pattern ?? (t.pattern = ar), P.init(e, t));
  }),
  Qr = p("$ZodISODateTime", (e, t) => {
    (t.pattern ?? (t.pattern = Sr(t)), P.init(e, t));
  }),
  es = p("$ZodISODate", (e, t) => {
    (t.pattern ?? (t.pattern = _r), P.init(e, t));
  }),
  ts = p("$ZodISOTime", (e, t) => {
    (t.pattern ?? (t.pattern = wr(t)), P.init(e, t));
  }),
  ns = p("$ZodISODuration", (e, t) => {
    (t.pattern ?? (t.pattern = lr), P.init(e, t));
  }),
  os = p("$ZodIPv4", (e, t) => {
    (t.pattern ?? (t.pattern = fr), P.init(e, t), (e._zod.bag.format = "ipv4"));
  }),
  rs = p("$ZodIPv6", (e, t) => {
    (t.pattern ?? (t.pattern = mr),
      P.init(e, t),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (n) => {
        try {
          new URL(`http://[${n.value}]`);
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  ss = p("$ZodCIDRv4", (e, t) => {
    (t.pattern ?? (t.pattern = gr), P.init(e, t));
  }),
  is = p("$ZodCIDRv6", (e, t) => {
    (t.pattern ?? (t.pattern = yr),
      P.init(e, t),
      (e._zod.check = (n) => {
        const o = n.value.split("/");
        try {
          if (o.length !== 2) throw new Error();
          const [r, i] = o;
          if (!i) throw new Error();
          const s = Number(i);
          if (`${s}` !== i) throw new Error();
          if (s < 0 || s > 128) throw new Error();
          new URL(`http://[${r}]`);
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  });
function bn(e) {
  if (e === "") return !0;
  if (e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
const as = p("$ZodBase64", (e, t) => {
  (t.pattern ?? (t.pattern = br),
    P.init(e, t),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (n) => {
      bn(n.value) ||
        n.issues.push({
          code: "invalid_format",
          format: "base64",
          input: n.value,
          inst: e,
          continue: !t.abort,
        });
    }));
});
function cs(e) {
  if (!un.test(e)) return !1;
  const t = e.replace(/[-_]/g, (o) => (o === "-" ? "+" : "/")),
    n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return bn(n);
}
const ls = p("$ZodBase64URL", (e, t) => {
    (t.pattern ?? (t.pattern = un),
      P.init(e, t),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (n) => {
        cs(n.value) ||
          n.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  ds = p("$ZodE164", (e, t) => {
    (t.pattern ?? (t.pattern = vr), P.init(e, t));
  });
function us(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3) return !1;
    const [o] = n;
    if (!o) return !1;
    const r = JSON.parse(atob(o));
    return !(
      ("typ" in r && r?.typ !== "JWT") ||
      !r.alg ||
      (t && (!("alg" in r) || r.alg !== t))
    );
  } catch {
    return !1;
  }
}
const hs = p("$ZodJWT", (e, t) => {
    (P.init(e, t),
      (e._zod.check = (n) => {
        us(n.value, t.alg) ||
          n.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  vn = p("$ZodNumber", (e, t) => {
    (C.init(e, t),
      (e._zod.pattern = e._zod.bag.pattern ?? fn),
      (e._zod.parse = (n, o) => {
        if (t.coerce)
          try {
            n.value = Number(n.value);
          } catch {}
        const r = n.value;
        if (typeof r == "number" && !Number.isNaN(r) && Number.isFinite(r))
          return n;
        const i =
          typeof r == "number"
            ? Number.isNaN(r)
              ? "NaN"
              : Number.isFinite(r)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          n.issues.push({
            expected: "number",
            code: "invalid_type",
            input: r,
            inst: e,
            ...(i ? { received: i } : {}),
          }),
          n
        );
      }));
  }),
  ps = p("$ZodNumberFormat", (e, t) => {
    ($r.init(e, t), vn.init(e, t));
  }),
  fs = p("$ZodBoolean", (e, t) => {
    (C.init(e, t),
      (e._zod.pattern = xr),
      (e._zod.parse = (n, o) => {
        if (t.coerce)
          try {
            n.value = !!n.value;
          } catch {}
        const r = n.value;
        return (
          typeof r == "boolean" ||
            n.issues.push({
              expected: "boolean",
              code: "invalid_type",
              input: r,
              inst: e,
            }),
          n
        );
      }));
  }),
  ms = p("$ZodUnknown", (e, t) => {
    (C.init(e, t), (e._zod.parse = (n) => n));
  }),
  gs = p("$ZodNever", (e, t) => {
    (C.init(e, t),
      (e._zod.parse = (n, o) => (
        n.issues.push({
          expected: "never",
          code: "invalid_type",
          input: n.value,
          inst: e,
        }),
        n
      )));
  });
function Tt(e, t, n) {
  (e.issues.length && t.issues.push(...ae(n, e.issues)),
    (t.value[n] = e.value));
}
const ys = p("$ZodArray", (e, t) => {
  (C.init(e, t),
    (e._zod.parse = (n, o) => {
      const r = n.value;
      if (!Array.isArray(r))
        return (
          n.issues.push({
            expected: "array",
            code: "invalid_type",
            input: r,
            inst: e,
          }),
          n
        );
      n.value = Array(r.length);
      const i = [];
      for (let s = 0; s < r.length; s++) {
        const a = r[s],
          l = t.element._zod.run({ value: a, issues: [] }, o);
        l instanceof Promise ? i.push(l.then((c) => Tt(c, n, s))) : Tt(l, n, s);
      }
      return i.length ? Promise.all(i).then(() => n) : n;
    }));
});
function xe(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o)) return;
    t.issues.push(...ae(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : (t.value[n] = e.value);
}
function _n(e) {
  const t = Object.keys(e.shape);
  for (const o of t)
    if (!e.shape?.[o]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${o}": expected a Zod schema`);
  const n = Do(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n),
  };
}
function wn(e, t, n, o, r, i) {
  const s = [],
    a = r.keySet,
    l = r.catchall._zod,
    c = l.def.type,
    d = l.optout === "optional";
  for (const u in t) {
    if (a.has(u)) continue;
    if (c === "never") {
      s.push(u);
      continue;
    }
    const h = l.run({ value: t[u], issues: [] }, o);
    h instanceof Promise
      ? e.push(h.then((f) => xe(f, n, u, t, d)))
      : xe(h, n, u, t, d);
  }
  return (
    s.length &&
      n.issues.push({ code: "unrecognized_keys", keys: s, input: t, inst: i }),
    e.length ? Promise.all(e).then(() => n) : n
  );
}
const bs = p("$ZodObject", (e, t) => {
    if ((C.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get)) {
      const a = t.shape;
      Object.defineProperty(t, "shape", {
        get: () => {
          const l = { ...a };
          return (Object.defineProperty(t, "shape", { value: l }), l);
        },
      });
    }
    const o = Ke(() => _n(t));
    I(e._zod, "propValues", () => {
      const a = t.shape,
        l = {};
      for (const c in a) {
        const d = a[c]._zod;
        if (d.values) {
          l[c] ?? (l[c] = new Set());
          for (const u of d.values) l[c].add(u);
        }
      }
      return l;
    });
    const r = Ie,
      i = t.catchall;
    let s;
    e._zod.parse = (a, l) => {
      s ?? (s = o.value);
      const c = a.value;
      if (!r(c))
        return (
          a.issues.push({
            expected: "object",
            code: "invalid_type",
            input: c,
            inst: e,
          }),
          a
        );
      a.value = {};
      const d = [],
        u = s.shape;
      for (const h of s.keys) {
        const f = u[h],
          m = f._zod.optout === "optional",
          y = f._zod.run({ value: c[h], issues: [] }, l);
        y instanceof Promise
          ? d.push(y.then((k) => xe(k, a, h, c, m)))
          : xe(y, a, h, c, m);
      }
      return i
        ? wn(d, c, a, l, o.value, e)
        : d.length
          ? Promise.all(d).then(() => a)
          : a;
    };
  }),
  vs = p("$ZodObjectJIT", (e, t) => {
    bs.init(e, t);
    const n = e._zod.parse,
      o = Ke(() => _n(t)),
      r = (h) => {
        const f = new jr(["shape", "payload", "ctx"]),
          m = o.value,
          y = (w) => {
            const v = It(w);
            return `shape[${v}]._zod.run({ value: input[${v}], issues: [] }, ctx)`;
          };
        f.write("const input = payload.value;");
        const k = Object.create(null);
        let T = 0;
        for (const w of m.keys) k[w] = `key_${T++}`;
        f.write("const newResult = {};");
        for (const w of m.keys) {
          const v = k[w],
            x = It(w),
            A = h[w]?._zod?.optout === "optional";
          (f.write(`const ${v} = ${y(w)};`),
            A
              ? f.write(`
        if (${v}.issues.length) {
          if (${x} in input) {
            payload.issues = payload.issues.concat(${v}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${x}, ...iss.path] : [${x}]
            })));
          }
        }
        
        if (${v}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${v}.value;
        }
        
      `)
              : f.write(`
        if (${v}.issues.length) {
          payload.issues = payload.issues.concat(${v}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${x}, ...iss.path] : [${x}]
          })));
        }
        
        if (${v}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${v}.value;
        }
        
      `));
        }
        (f.write("payload.value = newResult;"), f.write("return payload;"));
        const E = f.compile();
        return (w, v) => E(h, w, v);
      };
    let i;
    const s = Ie,
      a = !on.jitless,
      c = a && Zo.value,
      d = t.catchall;
    let u;
    e._zod.parse = (h, f) => {
      u ?? (u = o.value);
      const m = h.value;
      return s(m)
        ? a && c && f?.async === !1 && f.jitless !== !0
          ? (i || (i = r(t.shape)),
            (h = i(h, f)),
            d ? wn([], m, h, f, u, e) : h)
          : n(h, f)
        : (h.issues.push({
            expected: "object",
            code: "invalid_type",
            input: m,
            inst: e,
          }),
          h);
    };
  });
function zt(e, t, n, o) {
  for (const i of e) if (i.issues.length === 0) return ((t.value = i.value), t);
  const r = e.filter((i) => !ie(i));
  return r.length === 1
    ? ((t.value = r[0].value), r[0])
    : (t.issues.push({
        code: "invalid_union",
        input: t.value,
        inst: n,
        errors: e.map((i) => i.issues.map((s) => X(s, o, Y()))),
      }),
      t);
}
const _s = p("$ZodUnion", (e, t) => {
    (C.init(e, t),
      I(e._zod, "optin", () =>
        t.options.some((r) => r._zod.optin === "optional")
          ? "optional"
          : void 0,
      ),
      I(e._zod, "optout", () =>
        t.options.some((r) => r._zod.optout === "optional")
          ? "optional"
          : void 0,
      ),
      I(e._zod, "values", () => {
        if (t.options.every((r) => r._zod.values))
          return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
      }),
      I(e._zod, "pattern", () => {
        if (t.options.every((r) => r._zod.pattern)) {
          const r = t.options.map((i) => i._zod.pattern);
          return new RegExp(`^(${r.map((i) => Ye(i.source)).join("|")})$`);
        }
      }));
    const n = t.options.length === 1,
      o = t.options[0]._zod.run;
    e._zod.parse = (r, i) => {
      if (n) return o(r, i);
      let s = !1;
      const a = [];
      for (const l of t.options) {
        const c = l._zod.run({ value: r.value, issues: [] }, i);
        if (c instanceof Promise) (a.push(c), (s = !0));
        else {
          if (c.issues.length === 0) return c;
          a.push(c);
        }
      }
      return s ? Promise.all(a).then((l) => zt(l, r, e, i)) : zt(a, r, e, i);
    };
  }),
  ws = p("$ZodIntersection", (e, t) => {
    (C.init(e, t),
      (e._zod.parse = (n, o) => {
        const r = n.value,
          i = t.left._zod.run({ value: r, issues: [] }, o),
          s = t.right._zod.run({ value: r, issues: [] }, o);
        return i instanceof Promise || s instanceof Promise
          ? Promise.all([i, s]).then(([l, c]) => Pt(n, l, c))
          : Pt(n, i, s);
      }));
  });
function Je(e, t) {
  if (e === t) return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (le(e) && le(t)) {
    const n = Object.keys(t),
      o = Object.keys(e).filter((i) => n.indexOf(i) !== -1),
      r = { ...e, ...t };
    for (const i of o) {
      const s = Je(e[i], t[i]);
      if (!s.valid)
        return { valid: !1, mergeErrorPath: [i, ...s.mergeErrorPath] };
      r[i] = s.data;
    }
    return { valid: !0, data: r };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let o = 0; o < e.length; o++) {
      const r = e[o],
        i = t[o],
        s = Je(r, i);
      if (!s.valid)
        return { valid: !1, mergeErrorPath: [o, ...s.mergeErrorPath] };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Pt(e, t, n) {
  const o = new Map();
  let r;
  for (const a of t.issues)
    if (a.code === "unrecognized_keys") {
      r ?? (r = a);
      for (const l of a.keys) (o.has(l) || o.set(l, {}), (o.get(l).l = !0));
    } else e.issues.push(a);
  for (const a of n.issues)
    if (a.code === "unrecognized_keys")
      for (const l of a.keys) (o.has(l) || o.set(l, {}), (o.get(l).r = !0));
    else e.issues.push(a);
  const i = [...o].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if ((i.length && r && e.issues.push({ ...r, keys: i }), ie(e))) return e;
  const s = Je(t.value, n.value);
  if (!s.valid)
    throw new Error(
      `Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`,
    );
  return ((e.value = s.data), e);
}
const Ss = p("$ZodRecord", (e, t) => {
    (C.init(e, t),
      (e._zod.parse = (n, o) => {
        const r = n.value;
        if (!le(r))
          return (
            n.issues.push({
              expected: "record",
              code: "invalid_type",
              input: r,
              inst: e,
            }),
            n
          );
        const i = [],
          s = t.keyType._zod.values;
        if (s) {
          n.value = {};
          const a = new Set();
          for (const c of s)
            if (
              typeof c == "string" ||
              typeof c == "number" ||
              typeof c == "symbol"
            ) {
              a.add(typeof c == "number" ? c.toString() : c);
              const d = t.valueType._zod.run({ value: r[c], issues: [] }, o);
              d instanceof Promise
                ? i.push(
                    d.then((u) => {
                      (u.issues.length && n.issues.push(...ae(c, u.issues)),
                        (n.value[c] = u.value));
                    }),
                  )
                : (d.issues.length && n.issues.push(...ae(c, d.issues)),
                  (n.value[c] = d.value));
            }
          let l;
          for (const c in r) a.has(c) || ((l = l ?? []), l.push(c));
          l &&
            l.length > 0 &&
            n.issues.push({
              code: "unrecognized_keys",
              input: r,
              inst: e,
              keys: l,
            });
        } else {
          n.value = {};
          for (const a of Reflect.ownKeys(r)) {
            if (a === "__proto__") continue;
            let l = t.keyType._zod.run({ value: a, issues: [] }, o);
            if (l instanceof Promise)
              throw new Error(
                "Async schemas not supported in object keys currently",
              );
            if (typeof a == "string" && fn.test(a) && l.issues.length) {
              const u = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
              if (u instanceof Promise)
                throw new Error(
                  "Async schemas not supported in object keys currently",
                );
              u.issues.length === 0 && (l = u);
            }
            if (l.issues.length) {
              t.mode === "loose"
                ? (n.value[a] = r[a])
                : n.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: l.issues.map((u) => X(u, o, Y())),
                    input: a,
                    path: [a],
                    inst: e,
                  });
              continue;
            }
            const d = t.valueType._zod.run({ value: r[a], issues: [] }, o);
            d instanceof Promise
              ? i.push(
                  d.then((u) => {
                    (u.issues.length && n.issues.push(...ae(a, u.issues)),
                      (n.value[l.value] = u.value));
                  }),
                )
              : (d.issues.length && n.issues.push(...ae(a, d.issues)),
                (n.value[l.value] = d.value));
          }
        }
        return i.length ? Promise.all(i).then(() => n) : n;
      }));
  }),
  ks = p("$ZodEnum", (e, t) => {
    C.init(e, t);
    const n = rn(t.entries),
      o = new Set(n);
    ((e._zod.values = o),
      (e._zod.pattern = new RegExp(
        `^(${n
          .filter((r) => Ao.has(typeof r))
          .map((r) => (typeof r == "string" ? de(r) : r.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (r, i) => {
        const s = r.value;
        return (
          o.has(s) ||
            r.issues.push({
              code: "invalid_value",
              values: n,
              input: s,
              inst: e,
            }),
          r
        );
      }));
  }),
  Is = p("$ZodLiteral", (e, t) => {
    if ((C.init(e, t), t.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    const n = new Set(t.values);
    ((e._zod.values = n),
      (e._zod.pattern = new RegExp(
        `^(${t.values.map((o) => (typeof o == "string" ? de(o) : o ? de(o.toString()) : String(o))).join("|")})$`,
      )),
      (e._zod.parse = (o, r) => {
        const i = o.value;
        return (
          n.has(i) ||
            o.issues.push({
              code: "invalid_value",
              values: t.values,
              input: i,
              inst: e,
            }),
          o
        );
      }));
  }),
  xs = p("$ZodTransform", (e, t) => {
    (C.init(e, t),
      (e._zod.parse = (n, o) => {
        if (o.direction === "backward") throw new nn(e.constructor.name);
        const r = t.transform(n.value, n);
        if (o.async)
          return (r instanceof Promise ? r : Promise.resolve(r)).then(
            (s) => ((n.value = s), n),
          );
        if (r instanceof Promise) throw new ce();
        return ((n.value = r), n);
      }));
  });
function $t(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Sn = p("$ZodOptional", (e, t) => {
    (C.init(e, t),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      I(e._zod, "values", () =>
        t.innerType._zod.values
          ? new Set([...t.innerType._zod.values, void 0])
          : void 0,
      ),
      I(e._zod, "pattern", () => {
        const n = t.innerType._zod.pattern;
        return n ? new RegExp(`^(${Ye(n.source)})?$`) : void 0;
      }),
      (e._zod.parse = (n, o) => {
        if (t.innerType._zod.optin === "optional") {
          const r = t.innerType._zod.run(n, o);
          return r instanceof Promise
            ? r.then((i) => $t(i, n.value))
            : $t(r, n.value);
        }
        return n.value === void 0 ? n : t.innerType._zod.run(n, o);
      }));
  }),
  Ts = p("$ZodExactOptional", (e, t) => {
    (Sn.init(e, t),
      I(e._zod, "values", () => t.innerType._zod.values),
      I(e._zod, "pattern", () => t.innerType._zod.pattern),
      (e._zod.parse = (n, o) => t.innerType._zod.run(n, o)));
  }),
  zs = p("$ZodNullable", (e, t) => {
    (C.init(e, t),
      I(e._zod, "optin", () => t.innerType._zod.optin),
      I(e._zod, "optout", () => t.innerType._zod.optout),
      I(e._zod, "pattern", () => {
        const n = t.innerType._zod.pattern;
        return n ? new RegExp(`^(${Ye(n.source)}|null)$`) : void 0;
      }),
      I(e._zod, "values", () =>
        t.innerType._zod.values
          ? new Set([...t.innerType._zod.values, null])
          : void 0,
      ),
      (e._zod.parse = (n, o) =>
        n.value === null ? n : t.innerType._zod.run(n, o)));
  }),
  Ps = p("$ZodDefault", (e, t) => {
    (C.init(e, t),
      (e._zod.optin = "optional"),
      I(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, o) => {
        if (o.direction === "backward") return t.innerType._zod.run(n, o);
        if (n.value === void 0) return ((n.value = t.defaultValue), n);
        const r = t.innerType._zod.run(n, o);
        return r instanceof Promise ? r.then((i) => Ct(i, t)) : Ct(r, t);
      }));
  });
function Ct(e, t) {
  return (e.value === void 0 && (e.value = t.defaultValue), e);
}
const $s = p("$ZodPrefault", (e, t) => {
    (C.init(e, t),
      (e._zod.optin = "optional"),
      I(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, o) => (
        o.direction === "backward" ||
          (n.value === void 0 && (n.value = t.defaultValue)),
        t.innerType._zod.run(n, o)
      )));
  }),
  Cs = p("$ZodNonOptional", (e, t) => {
    (C.init(e, t),
      I(e._zod, "values", () => {
        const n = t.innerType._zod.values;
        return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
      }),
      (e._zod.parse = (n, o) => {
        const r = t.innerType._zod.run(n, o);
        return r instanceof Promise ? r.then((i) => Nt(i, e)) : Nt(r, e);
      }));
  });
function Nt(e, t) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: e.value,
        inst: t,
      }),
    e
  );
}
const Ns = p("$ZodCatch", (e, t) => {
    (C.init(e, t),
      I(e._zod, "optin", () => t.innerType._zod.optin),
      I(e._zod, "optout", () => t.innerType._zod.optout),
      I(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, o) => {
        if (o.direction === "backward") return t.innerType._zod.run(n, o);
        const r = t.innerType._zod.run(n, o);
        return r instanceof Promise
          ? r.then(
              (i) => (
                (n.value = i.value),
                i.issues.length &&
                  ((n.value = t.catchValue({
                    ...n,
                    error: { issues: i.issues.map((s) => X(s, o, Y())) },
                    input: n.value,
                  })),
                  (n.issues = [])),
                n
              ),
            )
          : ((n.value = r.value),
            r.issues.length &&
              ((n.value = t.catchValue({
                ...n,
                error: { issues: r.issues.map((i) => X(i, o, Y())) },
                input: n.value,
              })),
              (n.issues = [])),
            n);
      }));
  }),
  Os = p("$ZodPipe", (e, t) => {
    (C.init(e, t),
      I(e._zod, "values", () => t.in._zod.values),
      I(e._zod, "optin", () => t.in._zod.optin),
      I(e._zod, "optout", () => t.out._zod.optout),
      I(e._zod, "propValues", () => t.in._zod.propValues),
      (e._zod.parse = (n, o) => {
        if (o.direction === "backward") {
          const i = t.out._zod.run(n, o);
          return i instanceof Promise
            ? i.then((s) => Se(s, t.in, o))
            : Se(i, t.in, o);
        }
        const r = t.in._zod.run(n, o);
        return r instanceof Promise
          ? r.then((i) => Se(i, t.out, o))
          : Se(r, t.out, o);
      }));
  });
function Se(e, t, n) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const Es = p("$ZodReadonly", (e, t) => {
  (C.init(e, t),
    I(e._zod, "propValues", () => t.innerType._zod.propValues),
    I(e._zod, "values", () => t.innerType._zod.values),
    I(e._zod, "optin", () => t.innerType?._zod?.optin),
    I(e._zod, "optout", () => t.innerType?._zod?.optout),
    (e._zod.parse = (n, o) => {
      if (o.direction === "backward") return t.innerType._zod.run(n, o);
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then(Ot) : Ot(r);
    }));
});
function Ot(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
const Zs = p("$ZodCustom", (e, t) => {
  (j.init(e, t),
    C.init(e, t),
    (e._zod.parse = (n, o) => n),
    (e._zod.check = (n) => {
      const o = n.value,
        r = t.fn(o);
      if (r instanceof Promise) return r.then((i) => Et(i, n, o, e));
      Et(r, n, o, e);
    }));
});
function Et(e, t, n, o) {
  if (!e) {
    const r = {
      code: "custom",
      input: n,
      inst: o,
      path: [...(o._zod.def.path ?? [])],
      continue: !o._zod.def.abort,
    };
    (o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(ge(r)));
  }
}
var Zt;
class As {
  constructor() {
    ((this._map = new WeakMap()), (this._idmap = new Map()));
  }
  add(t, ...n) {
    const o = n[0];
    return (
      this._map.set(t, o),
      o && typeof o == "object" && "id" in o && this._idmap.set(o.id, t),
      this
    );
  }
  clear() {
    return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
  }
  remove(t) {
    const n = this._map.get(t);
    return (
      n && typeof n == "object" && "id" in n && this._idmap.delete(n.id),
      this._map.delete(t),
      this
    );
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const o = { ...(this.get(n) ?? {}) };
      delete o.id;
      const r = { ...o, ...this._map.get(t) };
      return Object.keys(r).length ? r : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function Ds() {
  return new As();
}
(Zt = globalThis).__zod_globalRegistry ?? (Zt.__zod_globalRegistry = Ds());
const me = globalThis.__zod_globalRegistry;
function Rs(e, t) {
  return new e({ type: "string", ...g(t) });
}
function Us(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function At(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Ms(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function js(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...g(t),
  });
}
function Fs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...g(t),
  });
}
function Hs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...g(t),
  });
}
function Ls(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Ws(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Js(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Vs(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Bs(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Gs(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Ks(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function qs(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Ys(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Xs(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function Qs(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function ei(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function ti(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function ni(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function oi(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function ri(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...g(t),
  });
}
function si(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...g(t),
  });
}
function ii(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...g(t),
  });
}
function ai(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...g(t),
  });
}
function ci(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...g(t),
  });
}
function li(e, t) {
  return new e({ type: "number", checks: [], ...g(t) });
}
function di(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...g(t),
  });
}
function ui(e, t) {
  return new e({ type: "boolean", ...g(t) });
}
function hi(e) {
  return new e({ type: "unknown" });
}
function pi(e, t) {
  return new e({ type: "never", ...g(t) });
}
function Dt(e, t) {
  return new gn({ check: "less_than", ...g(t), value: e, inclusive: !1 });
}
function je(e, t) {
  return new gn({ check: "less_than", ...g(t), value: e, inclusive: !0 });
}
function Rt(e, t) {
  return new yn({ check: "greater_than", ...g(t), value: e, inclusive: !1 });
}
function Fe(e, t) {
  return new yn({ check: "greater_than", ...g(t), value: e, inclusive: !0 });
}
function Ut(e, t) {
  return new Pr({ check: "multiple_of", ...g(t), value: e });
}
function kn(e, t) {
  return new Cr({ check: "max_length", ...g(t), maximum: e });
}
function Te(e, t) {
  return new Nr({ check: "min_length", ...g(t), minimum: e });
}
function In(e, t) {
  return new Or({ check: "length_equals", ...g(t), length: e });
}
function fi(e, t) {
  return new Er({
    check: "string_format",
    format: "regex",
    ...g(t),
    pattern: e,
  });
}
function mi(e) {
  return new Zr({ check: "string_format", format: "lowercase", ...g(e) });
}
function gi(e) {
  return new Ar({ check: "string_format", format: "uppercase", ...g(e) });
}
function yi(e, t) {
  return new Dr({
    check: "string_format",
    format: "includes",
    ...g(t),
    includes: e,
  });
}
function bi(e, t) {
  return new Rr({
    check: "string_format",
    format: "starts_with",
    ...g(t),
    prefix: e,
  });
}
function vi(e, t) {
  return new Ur({
    check: "string_format",
    format: "ends_with",
    ...g(t),
    suffix: e,
  });
}
function ue(e) {
  return new Mr({ check: "overwrite", tx: e });
}
function _i(e) {
  return ue((t) => t.normalize(e));
}
function wi() {
  return ue((e) => e.trim());
}
function Si() {
  return ue((e) => e.toLowerCase());
}
function ki() {
  return ue((e) => e.toUpperCase());
}
function Ii() {
  return ue((e) => Eo(e));
}
function xi(e, t, n) {
  return new e({ type: "array", element: t, ...g(n) });
}
function Ti(e, t, n) {
  return new e({ type: "custom", check: "custom", fn: t, ...g(n) });
}
function zi(e) {
  const t = Pi(
    (n) => (
      (n.addIssue = (o) => {
        if (typeof o == "string") n.issues.push(ge(o, n.value, t._zod.def));
        else {
          const r = o;
          (r.fatal && (r.continue = !1),
            r.code ?? (r.code = "custom"),
            r.input ?? (r.input = n.value),
            r.inst ?? (r.inst = t),
            r.continue ?? (r.continue = !t._zod.def.abort),
            n.issues.push(ge(r)));
        }
      }),
      e(n.value, n)
    ),
  );
  return t;
}
function Pi(e, t) {
  const n = new j({ check: "custom", ...g(t) });
  return ((n._zod.check = e), n);
}
function ze(e) {
  let t = e?.target ?? "draft-2020-12";
  return (
    t === "draft-4" && (t = "draft-04"),
    t === "draft-7" && (t = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: e?.metadata ?? me,
      target: t,
      unrepresentable: e?.unrepresentable ?? "throw",
      override: e?.override ?? (() => {}),
      io: e?.io ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: e?.cycles ?? "ref",
      reused: e?.reused ?? "inline",
      external: e?.external ?? void 0,
    }
  );
}
function z(e, t, n = { path: [], schemaPath: [] }) {
  var o;
  const r = e._zod.def,
    i = t.seen.get(e);
  if (i)
    return (
      i.count++,
      n.schemaPath.includes(e) && (i.cycle = n.path),
      i.schema
    );
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s);
  const a = e._zod.toJSONSchema?.();
  if (a) s.schema = a;
  else {
    const d = { ...n, schemaPath: [...n.schemaPath, e], path: n.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, s.schema, d);
    else {
      const h = s.schema,
        f = t.processors[r.type];
      if (!f)
        throw new Error(
          `[toJSONSchema]: Non-representable type encountered: ${r.type}`,
        );
      f(e, t, h, d);
    }
    const u = e._zod.parent;
    u && (s.ref || (s.ref = u), z(u, t, d), (t.seen.get(u).isParent = !0));
  }
  const l = t.metadataRegistry.get(e);
  return (
    l && Object.assign(s.schema, l),
    t.io === "input" &&
      M(e) &&
      (delete s.schema.examples, delete s.schema.default),
    t.io === "input" &&
      s.schema._prefault &&
      ((o = s.schema).default ?? (o.default = s.schema._prefault)),
    delete s.schema._prefault,
    t.seen.get(e).schema
  );
}
function Pe(e, t) {
  const n = e.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = new Map();
  for (const s of e.seen.entries()) {
    const a = e.metadataRegistry.get(s[0])?.id;
    if (a) {
      const l = o.get(a);
      if (l && l !== s[0])
        throw new Error(
          `Duplicate schema id "${a}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      o.set(a, s[0]);
    }
  }
  const r = (s) => {
      const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        const u = e.external.registry.get(s[0])?.id,
          h = e.external.uri ?? ((m) => m);
        if (u) return { ref: h(u) };
        const f = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
        return (
          (s[1].defId = f),
          { defId: f, ref: `${h("__shared")}#/${a}/${f}` }
        );
      }
      if (s[1] === n) return { ref: "#" };
      const c = `#/${a}/`,
        d = s[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: d, ref: c + d };
    },
    i = (s) => {
      if (s[1].schema.$ref) return;
      const a = s[1],
        { ref: l, defId: c } = r(s);
      ((a.def = { ...a.schema }), c && (a.defId = c));
      const d = a.schema;
      for (const u in d) delete d[u];
      d.$ref = l;
    };
  if (e.cycles === "throw")
    for (const s of e.seen.entries()) {
      const a = s[1];
      if (a.cycle)
        throw new Error(`Cycle detected: #/${a.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const s of e.seen.entries()) {
    const a = s[1];
    if (t === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      const c = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && c) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (a.cycle) {
      i(s);
      continue;
    }
    if (a.count > 1 && e.reused === "ref") {
      i(s);
      continue;
    }
  }
}
function $e(e, t) {
  const n = e.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (s) => {
    const a = e.seen.get(s);
    if (a.ref === null) return;
    const l = a.def ?? a.schema,
      c = { ...l },
      d = a.ref;
    if (((a.ref = null), d)) {
      o(d);
      const h = e.seen.get(d),
        f = h.schema;
      if (
        (f.$ref &&
        (e.target === "draft-07" ||
          e.target === "draft-04" ||
          e.target === "openapi-3.0")
          ? ((l.allOf = l.allOf ?? []), l.allOf.push(f))
          : Object.assign(l, f),
        Object.assign(l, c),
        s._zod.parent === d)
      )
        for (const y in l)
          y === "$ref" || y === "allOf" || y in c || delete l[y];
      if (f.$ref && h.def)
        for (const y in l)
          y === "$ref" ||
            y === "allOf" ||
            (y in h.def &&
              JSON.stringify(l[y]) === JSON.stringify(h.def[y]) &&
              delete l[y]);
    }
    const u = s._zod.parent;
    if (u && u !== d) {
      o(u);
      const h = e.seen.get(u);
      if (h?.schema.$ref && ((l.$ref = h.schema.$ref), h.def))
        for (const f in l)
          f === "$ref" ||
            f === "allOf" ||
            (f in h.def &&
              JSON.stringify(l[f]) === JSON.stringify(h.def[f]) &&
              delete l[f]);
    }
    e.override({ zodSchema: s, jsonSchema: l, path: a.path ?? [] });
  };
  for (const s of [...e.seen.entries()].reverse()) o(s[0]);
  const r = {};
  if (
    (e.target === "draft-2020-12"
      ? (r.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (r.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (r.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    e.external?.uri)
  ) {
    const s = e.external.registry.get(t)?.id;
    if (!s) throw new Error("Schema is missing an `id` property");
    r.$id = e.external.uri(s);
  }
  Object.assign(r, n.def ?? n.schema);
  const i = e.external?.defs ?? {};
  for (const s of e.seen.entries()) {
    const a = s[1];
    a.def && a.defId && (i[a.defId] = a.def);
  }
  e.external ||
    (Object.keys(i).length > 0 &&
      (e.target === "draft-2020-12" ? (r.$defs = i) : (r.definitions = i)));
  try {
    const s = JSON.parse(JSON.stringify(r));
    return (
      Object.defineProperty(s, "~standard", {
        value: {
          ...t["~standard"],
          jsonSchema: {
            input: Ce(t, "input", e.processors),
            output: Ce(t, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      s
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function M(e, t) {
  const n = t ?? { seen: new Set() };
  if (n.seen.has(e)) return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform") return !0;
  if (o.type === "array") return M(o.element, n);
  if (o.type === "set") return M(o.valueType, n);
  if (o.type === "lazy") return M(o.getter(), n);
  if (
    o.type === "promise" ||
    o.type === "optional" ||
    o.type === "nonoptional" ||
    o.type === "nullable" ||
    o.type === "readonly" ||
    o.type === "default" ||
    o.type === "prefault"
  )
    return M(o.innerType, n);
  if (o.type === "intersection") return M(o.left, n) || M(o.right, n);
  if (o.type === "record" || o.type === "map")
    return M(o.keyType, n) || M(o.valueType, n);
  if (o.type === "pipe") return M(o.in, n) || M(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape) if (M(o.shape[r], n)) return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options) if (M(r, n)) return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items) if (M(r, n)) return !0;
    return !!(o.rest && M(o.rest, n));
  }
  return !1;
}
const $i =
    (e, t = {}) =>
    (n) => {
      const o = ze({ ...n, processors: t });
      return (z(e, o), Pe(o, e), $e(o, e));
    },
  Ce =
    (e, t, n = {}) =>
    (o) => {
      const { libraryOptions: r, target: i } = o ?? {},
        s = ze({ ...(r ?? {}), target: i, io: t, processors: n });
      return (z(e, s), Pe(s, e), $e(s, e));
    },
  Ci = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "",
  },
  xn = (e, t, n, o) => {
    const r = n;
    r.type = "string";
    const {
      minimum: i,
      maximum: s,
      format: a,
      patterns: l,
      contentEncoding: c,
    } = e._zod.bag;
    if (
      (typeof i == "number" && (r.minLength = i),
      typeof s == "number" && (r.maxLength = s),
      a &&
        ((r.format = Ci[a] ?? a),
        r.format === "" && delete r.format,
        a === "time" && delete r.format),
      c && (r.contentEncoding = c),
      l && l.size > 0)
    ) {
      const d = [...l];
      d.length === 1
        ? (r.pattern = d[0].source)
        : d.length > 1 &&
          (r.allOf = [
            ...d.map((u) => ({
              ...(t.target === "draft-07" ||
              t.target === "draft-04" ||
              t.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: u.source,
            })),
          ]);
    }
  },
  Tn = (e, t, n, o) => {
    const r = n,
      {
        minimum: i,
        maximum: s,
        format: a,
        multipleOf: l,
        exclusiveMaximum: c,
        exclusiveMinimum: d,
      } = e._zod.bag;
    (typeof a == "string" && a.includes("int")
      ? (r.type = "integer")
      : (r.type = "number"),
      typeof d == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((r.minimum = d), (r.exclusiveMinimum = !0))
          : (r.exclusiveMinimum = d)),
      typeof i == "number" &&
        ((r.minimum = i),
        typeof d == "number" &&
          t.target !== "draft-04" &&
          (d >= i ? delete r.minimum : delete r.exclusiveMinimum)),
      typeof c == "number" &&
        (t.target === "draft-04" || t.target === "openapi-3.0"
          ? ((r.maximum = c), (r.exclusiveMaximum = !0))
          : (r.exclusiveMaximum = c)),
      typeof s == "number" &&
        ((r.maximum = s),
        typeof c == "number" &&
          t.target !== "draft-04" &&
          (c <= s ? delete r.maximum : delete r.exclusiveMaximum)),
      typeof l == "number" && (r.multipleOf = l));
  },
  zn = (e, t, n, o) => {
    n.type = "boolean";
  },
  Ni = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("BigInt cannot be represented in JSON Schema");
  },
  Oi = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Symbols cannot be represented in JSON Schema");
  },
  Ei = (e, t, n, o) => {
    t.target === "openapi-3.0"
      ? ((n.type = "string"), (n.nullable = !0), (n.enum = [null]))
      : (n.type = "null");
  },
  Zi = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Undefined cannot be represented in JSON Schema");
  },
  Ai = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Void cannot be represented in JSON Schema");
  },
  Pn = (e, t, n, o) => {
    n.not = {};
  },
  Di = (e, t, n, o) => {},
  $n = (e, t, n, o) => {},
  Ri = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Date cannot be represented in JSON Schema");
  },
  Cn = (e, t, n, o) => {
    const r = e._zod.def,
      i = rn(r.entries);
    (i.every((s) => typeof s == "number") && (n.type = "number"),
      i.every((s) => typeof s == "string") && (n.type = "string"),
      (n.enum = i));
  },
  Nn = (e, t, n, o) => {
    const r = e._zod.def,
      i = [];
    for (const s of r.values)
      if (s === void 0) {
        if (t.unrepresentable === "throw")
          throw new Error(
            "Literal `undefined` cannot be represented in JSON Schema",
          );
      } else if (typeof s == "bigint") {
        if (t.unrepresentable === "throw")
          throw new Error(
            "BigInt literals cannot be represented in JSON Schema",
          );
        i.push(Number(s));
      } else i.push(s);
    if (i.length !== 0)
      if (i.length === 1) {
        const s = i[0];
        ((n.type = s === null ? "null" : typeof s),
          t.target === "draft-04" || t.target === "openapi-3.0"
            ? (n.enum = [s])
            : (n.const = s));
      } else
        (i.every((s) => typeof s == "number") && (n.type = "number"),
          i.every((s) => typeof s == "string") && (n.type = "string"),
          i.every((s) => typeof s == "boolean") && (n.type = "boolean"),
          i.every((s) => s === null) && (n.type = "null"),
          (n.enum = i));
  },
  Ui = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("NaN cannot be represented in JSON Schema");
  },
  Mi = (e, t, n, o) => {
    const r = n,
      i = e._zod.pattern;
    if (!i) throw new Error("Pattern not found in template literal");
    ((r.type = "string"), (r.pattern = i.source));
  },
  ji = (e, t, n, o) => {
    const r = n,
      i = { type: "string", format: "binary", contentEncoding: "binary" },
      { minimum: s, maximum: a, mime: l } = e._zod.bag;
    (s !== void 0 && (i.minLength = s),
      a !== void 0 && (i.maxLength = a),
      l
        ? l.length === 1
          ? ((i.contentMediaType = l[0]), Object.assign(r, i))
          : (Object.assign(r, i),
            (r.anyOf = l.map((c) => ({ contentMediaType: c }))))
        : Object.assign(r, i));
  },
  Fi = (e, t, n, o) => {
    n.type = "boolean";
  },
  On = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  },
  Hi = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Function types cannot be represented in JSON Schema");
  },
  En = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  },
  Li = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Map cannot be represented in JSON Schema");
  },
  Wi = (e, t, n, o) => {
    if (t.unrepresentable === "throw")
      throw new Error("Set cannot be represented in JSON Schema");
  },
  Zn = (e, t, n, o) => {
    const r = n,
      i = e._zod.def,
      { minimum: s, maximum: a } = e._zod.bag;
    (typeof s == "number" && (r.minItems = s),
      typeof a == "number" && (r.maxItems = a),
      (r.type = "array"),
      (r.items = z(i.element, t, { ...o, path: [...o.path, "items"] })));
  },
  An = (e, t, n, o) => {
    const r = n,
      i = e._zod.def;
    ((r.type = "object"), (r.properties = {}));
    const s = i.shape;
    for (const c in s)
      r.properties[c] = z(s[c], t, {
        ...o,
        path: [...o.path, "properties", c],
      });
    const a = new Set(Object.keys(s)),
      l = new Set(
        [...a].filter((c) => {
          const d = i.shape[c]._zod;
          return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
        }),
      );
    (l.size > 0 && (r.required = Array.from(l)),
      i.catchall?._zod.def.type === "never"
        ? (r.additionalProperties = !1)
        : i.catchall
          ? i.catchall &&
            (r.additionalProperties = z(i.catchall, t, {
              ...o,
              path: [...o.path, "additionalProperties"],
            }))
          : t.io === "output" && (r.additionalProperties = !1));
  },
  Dn = (e, t, n, o) => {
    const r = e._zod.def,
      i = r.inclusive === !1,
      s = r.options.map((a, l) =>
        z(a, t, { ...o, path: [...o.path, i ? "oneOf" : "anyOf", l] }),
      );
    i ? (n.oneOf = s) : (n.anyOf = s);
  },
  Rn = (e, t, n, o) => {
    const r = e._zod.def,
      i = z(r.left, t, { ...o, path: [...o.path, "allOf", 0] }),
      s = z(r.right, t, { ...o, path: [...o.path, "allOf", 1] }),
      a = (c) => "allOf" in c && Object.keys(c).length === 1,
      l = [...(a(i) ? i.allOf : [i]), ...(a(s) ? s.allOf : [s])];
    n.allOf = l;
  },
  Ji = (e, t, n, o) => {
    const r = n,
      i = e._zod.def;
    r.type = "array";
    const s = t.target === "draft-2020-12" ? "prefixItems" : "items",
      a =
        t.target === "draft-2020-12" || t.target === "openapi-3.0"
          ? "items"
          : "additionalItems",
      l = i.items.map((h, f) => z(h, t, { ...o, path: [...o.path, s, f] })),
      c = i.rest
        ? z(i.rest, t, {
            ...o,
            path: [
              ...o.path,
              a,
              ...(t.target === "openapi-3.0" ? [i.items.length] : []),
            ],
          })
        : null;
    t.target === "draft-2020-12"
      ? ((r.prefixItems = l), c && (r.items = c))
      : t.target === "openapi-3.0"
        ? ((r.items = { anyOf: l }),
          c && r.items.anyOf.push(c),
          (r.minItems = l.length),
          c || (r.maxItems = l.length))
        : ((r.items = l), c && (r.additionalItems = c));
    const { minimum: d, maximum: u } = e._zod.bag;
    (typeof d == "number" && (r.minItems = d),
      typeof u == "number" && (r.maxItems = u));
  },
  Un = (e, t, n, o) => {
    const r = n,
      i = e._zod.def;
    r.type = "object";
    const s = i.keyType,
      l = s._zod.bag?.patterns;
    if (i.mode === "loose" && l && l.size > 0) {
      const d = z(i.valueType, t, {
        ...o,
        path: [...o.path, "patternProperties", "*"],
      });
      r.patternProperties = {};
      for (const u of l) r.patternProperties[u.source] = d;
    } else
      ((t.target === "draft-07" || t.target === "draft-2020-12") &&
        (r.propertyNames = z(i.keyType, t, {
          ...o,
          path: [...o.path, "propertyNames"],
        })),
        (r.additionalProperties = z(i.valueType, t, {
          ...o,
          path: [...o.path, "additionalProperties"],
        })));
    const c = s._zod.values;
    if (c) {
      const d = [...c].filter(
        (u) => typeof u == "string" || typeof u == "number",
      );
      d.length > 0 && (r.required = d);
    }
  },
  Mn = (e, t, n, o) => {
    const r = e._zod.def,
      i = z(r.innerType, t, o),
      s = t.seen.get(e);
    t.target === "openapi-3.0"
      ? ((s.ref = r.innerType), (n.nullable = !0))
      : (n.anyOf = [i, { type: "null" }]);
  },
  jn = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    i.ref = r.innerType;
  },
  Fn = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    ((i.ref = r.innerType),
      (n.default = JSON.parse(JSON.stringify(r.defaultValue))));
  },
  Hn = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    ((i.ref = r.innerType),
      t.io === "input" &&
        (n._prefault = JSON.parse(JSON.stringify(r.defaultValue))));
  },
  Ln = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    i.ref = r.innerType;
    let s;
    try {
      s = r.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    n.default = s;
  },
  Wn = (e, t, n, o) => {
    const r = e._zod.def,
      i =
        t.io === "input"
          ? r.in._zod.def.type === "transform"
            ? r.out
            : r.in
          : r.out;
    z(i, t, o);
    const s = t.seen.get(e);
    s.ref = i;
  },
  Jn = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    ((i.ref = r.innerType), (n.readOnly = !0));
  },
  Vi = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    i.ref = r.innerType;
  },
  nt = (e, t, n, o) => {
    const r = e._zod.def;
    z(r.innerType, t, o);
    const i = t.seen.get(e);
    i.ref = r.innerType;
  },
  Bi = (e, t, n, o) => {
    const r = e._zod.innerType;
    z(r, t, o);
    const i = t.seen.get(e);
    i.ref = r;
  },
  Mt = {
    string: xn,
    number: Tn,
    boolean: zn,
    bigint: Ni,
    symbol: Oi,
    null: Ei,
    undefined: Zi,
    void: Ai,
    never: Pn,
    any: Di,
    unknown: $n,
    date: Ri,
    enum: Cn,
    literal: Nn,
    nan: Ui,
    template_literal: Mi,
    file: ji,
    success: Fi,
    custom: On,
    function: Hi,
    transform: En,
    map: Li,
    set: Wi,
    array: Zn,
    object: An,
    union: Dn,
    intersection: Rn,
    tuple: Ji,
    record: Un,
    nullable: Mn,
    nonoptional: jn,
    default: Fn,
    prefault: Hn,
    catch: Ln,
    pipe: Wn,
    readonly: Jn,
    promise: Vi,
    optional: nt,
    lazy: Bi,
  };
function Gi(e, t) {
  if ("_idmap" in e) {
    const o = e,
      r = ze({ ...t, processors: Mt }),
      i = {};
    for (const l of o._idmap.entries()) {
      const [c, d] = l;
      z(d, r);
    }
    const s = {},
      a = { registry: o, uri: t?.uri, defs: i };
    r.external = a;
    for (const l of o._idmap.entries()) {
      const [c, d] = l;
      (Pe(r, d), (s[c] = $e(r, d)));
    }
    if (Object.keys(i).length > 0) {
      const l = r.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = { [l]: i };
    }
    return { schemas: s };
  }
  const n = ze({ ...t, processors: Mt });
  return (z(e, n), Pe(n, e), $e(n, e));
}
const Ki = p("ZodISODateTime", (e, t) => {
  (Qr.init(e, t), O.init(e, t));
});
function qi(e) {
  return si(Ki, e);
}
const Yi = p("ZodISODate", (e, t) => {
  (es.init(e, t), O.init(e, t));
});
function Xi(e) {
  return ii(Yi, e);
}
const Qi = p("ZodISOTime", (e, t) => {
  (ts.init(e, t), O.init(e, t));
});
function ea(e) {
  return ai(Qi, e);
}
const ta = p("ZodISODuration", (e, t) => {
  (ns.init(e, t), O.init(e, t));
});
function na(e) {
  return ci(ta, e);
}
const oa = (e, t) => {
    (ln.init(e, t),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: (n) => Vo(e, n) },
        flatten: { value: (n) => Jo(e, n) },
        addIssue: {
          value: (n) => {
            (e.issues.push(n), (e.message = JSON.stringify(e.issues, We, 2)));
          },
        },
        addIssues: {
          value: (n) => {
            (e.issues.push(...n),
              (e.message = JSON.stringify(e.issues, We, 2)));
          },
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  },
  H = p("ZodError", oa, { Parent: Error }),
  ra = Qe(H),
  sa = et(H),
  ia = Ne(H),
  aa = Oe(H),
  ca = Ko(H),
  la = qo(H),
  da = Yo(H),
  ua = Xo(H),
  ha = Qo(H),
  pa = er(H),
  fa = tr(H),
  ma = nr(H),
  N = p(
    "ZodType",
    (e, t) => (
      C.init(e, t),
      Object.assign(e["~standard"], {
        jsonSchema: { input: Ce(e, "input"), output: Ce(e, "output") },
      }),
      (e.toJSONSchema = $i(e, {})),
      (e.def = t),
      (e.type = t.type),
      Object.defineProperty(e, "_def", { value: t }),
      (e.check = (...n) =>
        e.clone(
          Q(t, {
            checks: [
              ...(t.checks ?? []),
              ...n.map((o) =>
                typeof o == "function"
                  ? {
                      _zod: {
                        check: o,
                        def: { check: "custom" },
                        onattach: [],
                      },
                    }
                  : o,
              ),
            ],
          }),
          { parent: !0 },
        )),
      (e.with = e.check),
      (e.clone = (n, o) => ee(e, n, o)),
      (e.brand = () => e),
      (e.register = (n, o) => (n.add(e, o), e)),
      (e.parse = (n, o) => ra(e, n, o, { callee: e.parse })),
      (e.safeParse = (n, o) => ia(e, n, o)),
      (e.parseAsync = async (n, o) => sa(e, n, o, { callee: e.parseAsync })),
      (e.safeParseAsync = async (n, o) => aa(e, n, o)),
      (e.spa = e.safeParseAsync),
      (e.encode = (n, o) => ca(e, n, o)),
      (e.decode = (n, o) => la(e, n, o)),
      (e.encodeAsync = async (n, o) => da(e, n, o)),
      (e.decodeAsync = async (n, o) => ua(e, n, o)),
      (e.safeEncode = (n, o) => ha(e, n, o)),
      (e.safeDecode = (n, o) => pa(e, n, o)),
      (e.safeEncodeAsync = async (n, o) => fa(e, n, o)),
      (e.safeDecodeAsync = async (n, o) => ma(e, n, o)),
      (e.refine = (n, o) => e.check(cc(n, o))),
      (e.superRefine = (n) => e.check(lc(n))),
      (e.overwrite = (n) => e.check(ue(n))),
      (e.optional = () => Lt(e)),
      (e.exactOptional = () => Ka(e)),
      (e.nullable = () => Wt(e)),
      (e.nullish = () => Lt(Wt(e))),
      (e.nonoptional = (n) => tc(e, n)),
      (e.array = () => R(e)),
      (e.or = (n) => he([e, n])),
      (e.and = (n) => La(e, n)),
      (e.transform = (n) => Jt(e, Ba(n))),
      (e.default = (n) => Xa(e, n)),
      (e.prefault = (n) => ec(e, n)),
      (e.catch = (n) => oc(e, n)),
      (e.pipe = (n) => Jt(e, n)),
      (e.readonly = () => ic(e)),
      (e.describe = (n) => {
        const o = e.clone();
        return (me.add(o, { description: n }), o);
      }),
      Object.defineProperty(e, "description", {
        get() {
          return me.get(e)?.description;
        },
        configurable: !0,
      }),
      (e.meta = (...n) => {
        if (n.length === 0) return me.get(e);
        const o = e.clone();
        return (me.add(o, n[0]), o);
      }),
      (e.isOptional = () => e.safeParse(void 0).success),
      (e.isNullable = () => e.safeParse(null).success),
      (e.apply = (n) => n(e)),
      e
    ),
  ),
  Vn = p("_ZodString", (e, t) => {
    (tt.init(e, t),
      N.init(e, t),
      (e._zod.processJSONSchema = (o, r, i) => xn(e, o, r)));
    const n = e._zod.bag;
    ((e.format = n.format ?? null),
      (e.minLength = n.minimum ?? null),
      (e.maxLength = n.maximum ?? null),
      (e.regex = (...o) => e.check(fi(...o))),
      (e.includes = (...o) => e.check(yi(...o))),
      (e.startsWith = (...o) => e.check(bi(...o))),
      (e.endsWith = (...o) => e.check(vi(...o))),
      (e.min = (...o) => e.check(Te(...o))),
      (e.max = (...o) => e.check(kn(...o))),
      (e.length = (...o) => e.check(In(...o))),
      (e.nonempty = (...o) => e.check(Te(1, ...o))),
      (e.lowercase = (o) => e.check(mi(o))),
      (e.uppercase = (o) => e.check(gi(o))),
      (e.trim = () => e.check(wi())),
      (e.normalize = (...o) => e.check(_i(...o))),
      (e.toLowerCase = () => e.check(Si())),
      (e.toUpperCase = () => e.check(ki())),
      (e.slugify = () => e.check(Ii())));
  }),
  ga = p("ZodString", (e, t) => {
    (tt.init(e, t),
      Vn.init(e, t),
      (e.email = (n) => e.check(Us(ya, n))),
      (e.url = (n) => e.check(Ls(ba, n))),
      (e.jwt = (n) => e.check(ri(Ea, n))),
      (e.emoji = (n) => e.check(Ws(va, n))),
      (e.guid = (n) => e.check(At(jt, n))),
      (e.uuid = (n) => e.check(Ms(ke, n))),
      (e.uuidv4 = (n) => e.check(js(ke, n))),
      (e.uuidv6 = (n) => e.check(Fs(ke, n))),
      (e.uuidv7 = (n) => e.check(Hs(ke, n))),
      (e.nanoid = (n) => e.check(Js(_a, n))),
      (e.guid = (n) => e.check(At(jt, n))),
      (e.cuid = (n) => e.check(Vs(wa, n))),
      (e.cuid2 = (n) => e.check(Bs(Sa, n))),
      (e.ulid = (n) => e.check(Gs(ka, n))),
      (e.base64 = (n) => e.check(ti(Ca, n))),
      (e.base64url = (n) => e.check(ni(Na, n))),
      (e.xid = (n) => e.check(Ks(Ia, n))),
      (e.ksuid = (n) => e.check(qs(xa, n))),
      (e.ipv4 = (n) => e.check(Ys(Ta, n))),
      (e.ipv6 = (n) => e.check(Xs(za, n))),
      (e.cidrv4 = (n) => e.check(Qs(Pa, n))),
      (e.cidrv6 = (n) => e.check(ei($a, n))),
      (e.e164 = (n) => e.check(oi(Oa, n))),
      (e.datetime = (n) => e.check(qi(n))),
      (e.date = (n) => e.check(Xi(n))),
      (e.time = (n) => e.check(ea(n))),
      (e.duration = (n) => e.check(na(n))));
  });
function b(e) {
  return Rs(ga, e);
}
const O = p("ZodStringFormat", (e, t) => {
    (P.init(e, t), Vn.init(e, t));
  }),
  ya = p("ZodEmail", (e, t) => {
    (Wr.init(e, t), O.init(e, t));
  }),
  jt = p("ZodGUID", (e, t) => {
    (Hr.init(e, t), O.init(e, t));
  }),
  ke = p("ZodUUID", (e, t) => {
    (Lr.init(e, t), O.init(e, t));
  }),
  ba = p("ZodURL", (e, t) => {
    (Jr.init(e, t), O.init(e, t));
  }),
  va = p("ZodEmoji", (e, t) => {
    (Vr.init(e, t), O.init(e, t));
  }),
  _a = p("ZodNanoID", (e, t) => {
    (Br.init(e, t), O.init(e, t));
  }),
  wa = p("ZodCUID", (e, t) => {
    (Gr.init(e, t), O.init(e, t));
  }),
  Sa = p("ZodCUID2", (e, t) => {
    (Kr.init(e, t), O.init(e, t));
  }),
  ka = p("ZodULID", (e, t) => {
    (qr.init(e, t), O.init(e, t));
  }),
  Ia = p("ZodXID", (e, t) => {
    (Yr.init(e, t), O.init(e, t));
  }),
  xa = p("ZodKSUID", (e, t) => {
    (Xr.init(e, t), O.init(e, t));
  }),
  Ta = p("ZodIPv4", (e, t) => {
    (os.init(e, t), O.init(e, t));
  }),
  za = p("ZodIPv6", (e, t) => {
    (rs.init(e, t), O.init(e, t));
  }),
  Pa = p("ZodCIDRv4", (e, t) => {
    (ss.init(e, t), O.init(e, t));
  }),
  $a = p("ZodCIDRv6", (e, t) => {
    (is.init(e, t), O.init(e, t));
  }),
  Ca = p("ZodBase64", (e, t) => {
    (as.init(e, t), O.init(e, t));
  }),
  Na = p("ZodBase64URL", (e, t) => {
    (ls.init(e, t), O.init(e, t));
  }),
  Oa = p("ZodE164", (e, t) => {
    (ds.init(e, t), O.init(e, t));
  }),
  Ea = p("ZodJWT", (e, t) => {
    (hs.init(e, t), O.init(e, t));
  }),
  Bn = p("ZodNumber", (e, t) => {
    (vn.init(e, t),
      N.init(e, t),
      (e._zod.processJSONSchema = (o, r, i) => Tn(e, o, r)),
      (e.gt = (o, r) => e.check(Rt(o, r))),
      (e.gte = (o, r) => e.check(Fe(o, r))),
      (e.min = (o, r) => e.check(Fe(o, r))),
      (e.lt = (o, r) => e.check(Dt(o, r))),
      (e.lte = (o, r) => e.check(je(o, r))),
      (e.max = (o, r) => e.check(je(o, r))),
      (e.int = (o) => e.check(Ft(o))),
      (e.safe = (o) => e.check(Ft(o))),
      (e.positive = (o) => e.check(Rt(0, o))),
      (e.nonnegative = (o) => e.check(Fe(0, o))),
      (e.negative = (o) => e.check(Dt(0, o))),
      (e.nonpositive = (o) => e.check(je(0, o))),
      (e.multipleOf = (o, r) => e.check(Ut(o, r))),
      (e.step = (o, r) => e.check(Ut(o, r))),
      (e.finite = () => e));
    const n = e._zod.bag;
    ((e.minValue =
      Math.max(
        n.minimum ?? Number.NEGATIVE_INFINITY,
        n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
      ) ?? null),
      (e.maxValue =
        Math.min(
          n.maximum ?? Number.POSITIVE_INFINITY,
          n.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
        ) ?? null),
      (e.isInt =
        (n.format ?? "").includes("int") ||
        Number.isSafeInteger(n.multipleOf ?? 0.5)),
      (e.isFinite = !0),
      (e.format = n.format ?? null));
  });
function te(e) {
  return li(Bn, e);
}
const Za = p("ZodNumberFormat", (e, t) => {
  (ps.init(e, t), Bn.init(e, t));
});
function Ft(e) {
  return di(Za, e);
}
const Aa = p("ZodBoolean", (e, t) => {
  (fs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => zn(e, n, o)));
});
function Gn(e) {
  return ui(Aa, e);
}
const Da = p("ZodUnknown", (e, t) => {
  (ms.init(e, t), N.init(e, t), (e._zod.processJSONSchema = (n, o, r) => $n()));
});
function Ht() {
  return hi(Da);
}
const Ra = p("ZodNever", (e, t) => {
  (gs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Pn(e, n, o)));
});
function Ua(e) {
  return pi(Ra, e);
}
const Ma = p("ZodArray", (e, t) => {
  (ys.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Zn(e, n, o, r)),
    (e.element = t.element),
    (e.min = (n, o) => e.check(Te(n, o))),
    (e.nonempty = (n) => e.check(Te(1, n))),
    (e.max = (n, o) => e.check(kn(n, o))),
    (e.length = (n, o) => e.check(In(n, o))),
    (e.unwrap = () => e.element));
});
function R(e, t) {
  return xi(Ma, e, t);
}
const ja = p("ZodObject", (e, t) => {
  (vs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => An(e, n, o, r)),
    I(e, "shape", () => t.shape),
    (e.keyof = () => K(Object.keys(e._zod.def.shape))),
    (e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n })),
    (e.passthrough = () => e.clone({ ...e._zod.def, catchall: Ht() })),
    (e.loose = () => e.clone({ ...e._zod.def, catchall: Ht() })),
    (e.strict = () => e.clone({ ...e._zod.def, catchall: Ua() })),
    (e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 })),
    (e.extend = (n) => jo(e, n)),
    (e.safeExtend = (n) => Fo(e, n)),
    (e.merge = (n) => Ho(e, n)),
    (e.pick = (n) => Uo(e, n)),
    (e.omit = (n) => Mo(e, n)),
    (e.partial = (...n) => Lo(Yn, e, n[0])),
    (e.required = (...n) => Wo(Xn, e, n[0])));
});
function _(e, t) {
  const n = { type: "object", shape: e ?? {}, ...g(t) };
  return new ja(n);
}
const Fa = p("ZodUnion", (e, t) => {
  (_s.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Dn(e, n, o, r)),
    (e.options = t.options));
});
function he(e, t) {
  return new Fa({ type: "union", options: e, ...g(t) });
}
const Ha = p("ZodIntersection", (e, t) => {
  (ws.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Rn(e, n, o, r)));
});
function La(e, t) {
  return new Ha({ type: "intersection", left: e, right: t });
}
const Wa = p("ZodRecord", (e, t) => {
  (Ss.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Un(e, n, o, r)),
    (e.keyType = t.keyType),
    (e.valueType = t.valueType));
});
function Kn(e, t, n) {
  return new Wa({ type: "record", keyType: e, valueType: t, ...g(n) });
}
const Ve = p("ZodEnum", (e, t) => {
  (ks.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (o, r, i) => Cn(e, o, r)),
    (e.enum = t.entries),
    (e.options = Object.values(t.entries)));
  const n = new Set(Object.keys(t.entries));
  ((e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s)) i[s] = t.entries[s];
      else throw new Error(`Key ${s} not found in enum`);
    return new Ve({ ...t, checks: [], ...g(r), entries: i });
  }),
    (e.exclude = (o, r) => {
      const i = { ...t.entries };
      for (const s of o)
        if (n.has(s)) delete i[s];
        else throw new Error(`Key ${s} not found in enum`);
      return new Ve({ ...t, checks: [], ...g(r), entries: i });
    }));
});
function K(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new Ve({ type: "enum", entries: n, ...g(t) });
}
const Ja = p("ZodLiteral", (e, t) => {
  (Is.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Nn(e, n, o)),
    (e.values = new Set(t.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (t.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return t.values[0];
      },
    }));
});
function qn(e, t) {
  return new Ja({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...g(t),
  });
}
const Va = p("ZodTransform", (e, t) => {
  (xs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => En(e, n)),
    (e._zod.parse = (n, o) => {
      if (o.direction === "backward") throw new nn(e.constructor.name);
      n.addIssue = (i) => {
        if (typeof i == "string") n.issues.push(ge(i, n.value, t));
        else {
          const s = i;
          (s.fatal && (s.continue = !1),
            s.code ?? (s.code = "custom"),
            s.input ?? (s.input = n.value),
            s.inst ?? (s.inst = e),
            n.issues.push(ge(s)));
        }
      };
      const r = t.transform(n.value, n);
      return r instanceof Promise
        ? r.then((i) => ((n.value = i), n))
        : ((n.value = r), n);
    }));
});
function Ba(e) {
  return new Va({ type: "transform", transform: e });
}
const Yn = p("ZodOptional", (e, t) => {
  (Sn.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => nt(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Lt(e) {
  return new Yn({ type: "optional", innerType: e });
}
const Ga = p("ZodExactOptional", (e, t) => {
  (Ts.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => nt(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Ka(e) {
  return new Ga({ type: "optional", innerType: e });
}
const qa = p("ZodNullable", (e, t) => {
  (zs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Mn(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Wt(e) {
  return new qa({ type: "nullable", innerType: e });
}
const Ya = p("ZodDefault", (e, t) => {
  (Ps.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Fn(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function Xa(e, t) {
  return new Ya({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : an(t);
    },
  });
}
const Qa = p("ZodPrefault", (e, t) => {
  ($s.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Hn(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function ec(e, t) {
  return new Qa({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : an(t);
    },
  });
}
const Xn = p("ZodNonOptional", (e, t) => {
  (Cs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => jn(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function tc(e, t) {
  return new Xn({ type: "nonoptional", innerType: e, ...g(t) });
}
const nc = p("ZodCatch", (e, t) => {
  (Ns.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Ln(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function oc(e, t) {
  return new nc({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t,
  });
}
const rc = p("ZodPipe", (e, t) => {
  (Os.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Wn(e, n, o, r)),
    (e.in = t.in),
    (e.out = t.out));
});
function Jt(e, t) {
  return new rc({ type: "pipe", in: e, out: t });
}
const sc = p("ZodReadonly", (e, t) => {
  (Es.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => Jn(e, n, o, r)),
    (e.unwrap = () => e._zod.def.innerType));
});
function ic(e) {
  return new sc({ type: "readonly", innerType: e });
}
const ac = p("ZodCustom", (e, t) => {
  (Zs.init(e, t),
    N.init(e, t),
    (e._zod.processJSONSchema = (n, o, r) => On(e, n)));
});
function cc(e, t = {}) {
  return Ti(ac, e, t);
}
function lc(e) {
  return zi(e);
}
const ot = [
    {
      topic: "paper-mcp-instructions",
      title: "Paper MCP instructions",
      description:
        "Step-by-step guide to using the Paper MCP server to its max power",
      content: `

## Review Checkpoints — MANDATORY

You MUST call get_screenshot after you think you're done with each new section to evaluate the work in progress as a senior designer.
You MUST evaluate each checkpoint item and summarize them into a one-line verdict. Fix found issues before moving on.

- **Spacing**: Uneven gaps, cramped groups, or areas that feel unintentionally empty. Is there clear visual rhythm?
- **Typography**: Text too small to read, poor line-height, weak hierarchy between heading/body/caption.
- **Contrast**: Low contrast text, elements that blend into their background, or overly uniform color use.
- **Alignment**: Elements that should share a vertical or horizontal lane but don't. Icons or actions misaligned across repeated rows.
- **Artboard fit**: Content clipped at the artboard edge. Switch the artboard to \`height: "fit-content"\` via update_styles. Do NOT guess new fixed pixel heights.
- **Repetition**: Overly grid-like sameness — vary scale, weight, or spacing to create visual interest.

When confirming quality, do not delete the entire piece of work and start over unless it's truly the only path. Starting over is very frustrating to the user. Instead, do targeted fixes. Especially if the only issue is overflowing a frame, do not delete the entire frame.

## Design Quality — IMPORTANT

Paper is a professional design tool used by designers who care deeply about craft.

Styling guidance you should follow:
- Be a minimalist: use fewer elements, highly refined visual ideas. When choosing between adding a visual element and removing one, default to removal. Restraint, purpose, clarity, function. White space is a feature, not wasted space.
- Do remember to add a warm human touch to make even the most minimal design feel inviting and alive.
- Vary spacing deliberately — tighter to group related elements, generous to let hero content breathe.
- Favor layout asymmetry and scale contrast (e.g. a very large headline next to small muted text) over grid-like sameness.
- Invest in text hierarchy, spacing, and contrast to create impressive, timeless designs. Designs should feel like they were made by an authoritative designer with a strong point of view, not assembled from a component library.
- Always consider whether the current design goal is to impress with style or to present information with clarity. If the user wants to explore different stylistic directions, aim for impressiveness. If the user is focused on product design problems and usability, aim for clarity. Portfolio design and product design have different goals.
- For marketing design, consumer apps, and any project where brand personality matters more than productivity — or when the brief explicitly asks for fun, exciting, or bold — consider the playful register as the first choice. Playful register encourages multiple accents working together (duos or trios), tilted or sticker-style elements, offset shadows, hand-drawn marks (confetti, squiggles, zigzags), mascots or wordmarks with character, and quippy copy — pick one or two of these that tastefully fit the brand (not all of them!).
- When requested to provide multiple design directions, the designs should be tangibly different from each other, with distinct visual personalities. Explore genuinely different points of view.
- Prefer information living directly on surfaces over boxing everything in cards.
- Avoid outdated design trends from the late 2010s like excessive gradients and shadows. If requested by the user, don't shy away, but apply tastefully, making sure that the elements do not compete with each other.
- Use expressive, punchy typography inspired by Swiss editorial print as the base for visual hierarchy and contrast. Maximize contrast between display and label weights — pair heavy display type with light or regular labels. Use slightly tighter tracking on large type and no or open tracking on small caps and very small labels.
- Default to light mode color schemes unless otherwise requested by the user.
- Before any hex values, commit to a **mood word** — a physical condition or register (examples: sun-bleached, overcast, inky, mineral, botanical, maritime, bookish, subterranean, foggy, tropical, alpine, arid, industrial, chapel, candlelit, chalky, rusted, tidal, pastoral, nocturnal, brutalist, gallery, editorial, signage, highlighter, phosphor, terminal, vehicle dashboard, hypertext).
- Derive every color from a specific object in that scene. For example, "mineral" = limestone dust, weathered slate, oxidized copper; "bookish" = plaster, oak pew, ink, candle flame. If you can't name an appropriate reference for a role, the palette is abstract and will feel glued together.
- Color should be used deliberately. One intense, beautiful color moment is stronger than five.
- The design brief's mood candidates should mix obvious and less-obvious options for the product category. From that list, pick any mood other than your first instinct — picking at random beats picking by fit here, because first-instinct picks regress to the same few answers that'd appear mundane and predictable to the user.
- Proven background × primary accent pairings — each is a combination that occurs together in one scene. The named colors are families to interpret, not fixed values; pick your own hex within each family that fits the mood. It's also not a fixed menu of colors, just a reference guide of color combinations. Allow for creative interpretation, substitution, and extension of the ideas as long as they follow the broader principles outlined in this guide.
  - mineral — bone × oxidized copper
  - maritime — fog gray × deep navy
  - rusted — graphite × rust
  - industrial — concrete × safety orange
  - bookish — plaster × ink
  - chapel — slate × amethyst
  - candlelit — warm amber × oxblood
  - botanical — bone × moss
  - tropical — palm shadow × hibiscus
  - alpine — snow × evergreen
  - nocturnal — wet asphalt × hot pink
  - phosphor / terminal — CRT black × phosphor green
  - vehicle dashboard — instrument black × amber LED
  - signage — ink × chrome yellow
  - gallery / pop — pure white × cadmium red
  - editorial / saturated — pure white × cobalt
  - hypertext — pure white × hyperlink blue
  - highlighter — pure white × fluorescent yellow
  - brutalist — pure white × pure black (no third color)
- Pairings to avoid:
  - warm off-white × red / orange / terracotta / burnt-sienna — this is a recent cliché
  - warm off-white × fluorescent — fluorescent colors like neon don't appear in pastoral, candlelit, or sun-bleached scenes
  - dark navy or charcoal × electric purple / lime / teal — overused in SaaS apps from the 2019–2024 era
  - pure white × muted earth tone — earth tones fall flat on pure white; they want a tinted ground from the same scene
  - tinted warm ground × any high-chroma or saturated accent — the tint mutes the chroma; use pure white or pure black instead
- Neutrals:
  - Pure white \`#FFFFFF\` is the everyday ground for SaaS dashboards, product pages, documentation, marketing sites, landing pages, and light-mode mobile apps — not a "stark" or "brutalist" choice, the common case. Default to it whenever the accent is high-chroma, the work is typographic, or the mood doesn't specifically call for a tinted ground.
  - Off-white (cream, ivory, beige, bone) is a specific aesthetic tied to moods like "sun-bleached," "candlelit," "pastoral," "bookish," "vintage" — not a generic neutral.
  - For grays, derive from the scene ("mineral" → slate, "maritime" → fog, "rusted" → graphite) or stay truly neutral (\`#EEEEEE\`, \`#CCCCCC\`, \`#888888\`, \`#444444\`). Tinted gray without a scene reason reads as indecision.
  - For dark colors, pure black \`#000000\` is correct when the accent is high-chroma, the user asks for it explicitly, or the mood is "inky" / "nocturnal" / "subterranean." Otherwise tint toward the mood — warm charcoal for "candlelit," graphite for "maritime."
- Secondary accents can be added if they are appropriate for the mood and functionality of the design.
  - Examples: categorizing items into different groups, complex data visualization, semantic states (success, warning, error, info) may call for multiple colors.
  - Pull secondaries from the same scene as the primary so the palette reads as one.
  - Using a small amount of secondary colors alongside the primary accent color is recommended for brand styles that suggest a fun, energetic, playful vibe. However, make sure that you still have a single primary color to anchor the brand, and keep the overall saturation in the color palette conservative, as more colors can become overwhelming and visually noisy. Also, in this case, reduce your budget for other decorative flourishes, as multiple colors already add visual complexity.
- Text contrast is non-negotiable. Reduced opacity and muted text colors are useful tools for hierarchy but they should be used sparingly. Always ask: can this be read at a glance, without squinting? Pay extra attention to small text below 16px, using higher contrast there when in doubt. Style and legibility should never be in conflict.
- Avoid tiny text unless absolutely necessary (12px or smaller). It may be acceptable only when designing high-density productivity interfaces, as well as in all caps for a stylistic effect.
- When the prompt for a new design is vague seems like a test of your capabilities and there is no existing visual context to follow in the document, aim to create an impressive design that captures the user's imagination. Think: what is a simple, single deliverable that you can execute exceptionally well to quickly wow the user?

### Placeholder content

- Use realistic placeholder content for text and images.
- If you'd like to include placeholder content related to design software please use Paper as the example instead of other design apps. You MUST NOT mention Figma and Sketch in the placeholder content.

### Vertical lane alignment

When building repeated rows (lists, tables, layer trees, nav items), elements must form consistent vertical lanes. Use fixed-width slots (with width and flexShrink: 0) for icons, indicators, and actions — even when a slot is empty in some rows. Never rely on gap alone to align columns across rows with varying content. After building 3+ similar rows, screenshot and trace vertical lines through icons and trailing elements to verify they align.

## Before Creating New Designs

Unless the prompt already specifies a design system in great detail, send the design brief to the user as a chat message before any tool calls. This brief is part of the deliverable, not scratch work for yourself. Do not call create_artboard, write_html, or any other mutation tool until the brief is posted.

Format:

- **Mood candidates**: 3–5 moods that could plausibly fit the brief (omit this line if the user already named a brand direction)
- **Mood chosen**: the one you're committing to, plus one sentence on why it isn't your first instinct
- **Palette**: 5–6 hex values with roles, derived from the mood
- **Type**: font, weight, and size scale
- **Direction**: one sentence describing the final visual direction

## Workflow Tips

The human sees your work appear on the canvas in real-time. Tool calls have no latency and render instantly. This means:

- **Write small, write often.** Each write_html call should add roughly ONE visual group — a header, a single list row, a button group, a card shell, or a footer. If you're writing more than ~15 lines of HTML in a single call, break it up.
- **Never batch an entire component.** A card with a header, 4 rows, and a footer is 6+ separate write_html calls — not one. Even simple components should be built piece by piece.
- **Screenshot after meaningful modifications.** Use the Review Checkpoints checklist above to evaluate.
- **The human's experience matters.** Watching a design build up element by element is satisfying and builds trust. A 60-second wait followed by a fully formed design feels like a black box. Aim for the human to see new content appear every few seconds.
- **Clone to save tokens.** Use \`<x-paper-clone node-id="..." style="..." />\` inside write_html to reuse existing Paper nodes in new layouts — much cheaper than rewriting equivalent HTML.

1. **Start with context**: Call get_basic_info first to understand the file structure and available artboards. Note artboard dimensions to understand if designs are for mobile (375px wide), tablet, or desktop (1440px wide).

2. **Check selection**: Use get_selection to see what the user is focused on. If nothing is selected, you might suggest they select something or work with a specific artboard.

3. **Explore hierarchy**: Use get_tree_summary to quickly see the structure of an artboard or component subtree. Use get_children to list direct children, or get_node_info to read text content or understand specific nodes.

4. **Visual understanding**: Use get_screenshot to see what nodes look like visually. The default 1x scale is sufficient for verifying layout, colors, and structure. Only pass scale=2 if you need to read small text or inspect fine pixel-level details.

5. **Code generation**: Use get_jsx when you need to understand component structure or help generate code from designs. Each element has an id attribute you can use to target specific nodes for modification.

6. **Style details**: Use get_computed_styles when you need precise CSS values. Pass multiple nodeIds to batch requests.

7. **MANDATORY REVIEWS**: After every few modifications you MUST take a screenshot, write a critique, then make adjustments, using "Review Checkpoints" section above.

Note: do not include node IDs in user-facing text, they are meaningless to the user. You can just omit them and optionally refer to nodes by layer name or a generic term like "hero section".

**Writing new designs**:
1. Generate your design brief (see Before Creating New Designs above).
2. Create the artboard with create_artboard.
3. Add / adjust content in small pieces — one visual group per tool call.
4. The duplicate_nodes tool can be powerful and save tokens. Consider using it combined with update_styles and set_text_content when it'd be more efficient than writing more HTML.
5. MANDATORY - when done, always use finish_working_on_nodes tool.

**Editing existing designs**:
1. Update content in small pieces — one visual group per tool call.
2. Use \`move_nodes\` to change layer order or reparent an existing layer — preserves node IDs so your other references stay valid. Don't delete + rewrite HTML just to change structure.
3. MANDATORY - when done, always use finish_working_on_nodes tool.

**If the user asks you to take a design from paper and put it into their codebase**
1. Always use get_jsx, get_computed_styles, get_fill_image, etc, to get the direct exact values
2. Never use screenshots as inputs to building code, only use screenshots to verify quality of results
3. Always use the conventions of the user's codebase, translating the Paper CSS export into their conventions

## Working with text

### Available fonts

1. Prefer font families that have already been loaded in the document as indicated by get_basic_info call, unless the user requests otherwise.

2. Use get_font_family_info tool to confirm whether a particular font family is available to the user OR to inspect the available weights and styles in it. get_font_family_info looks up fonts on the user's machine and Google Fonts. It can also be used to look up information about the availability of web safe fonts like Arial, Times New Roman, etc., as well as common CSS system fonts like system-ui, sans-serif, serif, etc.

3. You MUST use get_font_family_info before writing typographic styles for the first time during a design session. Using a font family or a weight/style that isn't available may result in a broken design.

### Typographic units

- You MUST use "px" units for font sizes.
- You SHOULD use "em" units for letter spacing unless working on an existing design that uses "px" units.
- You SHOULD use "px" units for line height unless otherwise requested by the user. Relative line height units are also acceptable as long as they do not result in subpixel sizes.

## Importing Designs From Figma

To import designs from Figma, call \`get_guide({ topic: "figma-import" })\` for the full step-by-step workflow.
`.trim(),
    },
    {
      topic: "mobile-status-bar",
      title: "Mobile status bar",
      description: "Paste-ready status bar markup for mobile artboards",
      content: `
## Mobile status bar

Mobile artboards should begin with a status bar at the top — this makes a mobile mockup feel real. Do NOT hand-draw one: the icons are fiddly and easy to get wrong, and it wastes tokens.

Paste this at the very top of the mobile artboard (as the first child). This is the official Apple status bar design — do NOT modify spacing, padding, font size, SVG paths, or layer structure. Color is the only value you should ever change (see below).

<div layer-name="Status bar" style="display: flex; align-items: center; gap: 154px; padding: 21px 24px 19px;">
  <div layer-name="Time" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
    <div style="color: white; font-family: system-ui; font-size: 17px; font-weight: 600; text-align: center; width: fit-content">
      9:41
    </div>
  </div>
  <div layer-name="Icons" style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
    <svg width="82" height="22" viewBox="0 0 82 22" style="flex-shrink: 0" fill="white">
      <path d="M3.7 13H2.5a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1m5.2-2.5H7.7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1M14.1 8h-1.2a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1m5.2-2.5h-1.2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1" />
      <path fill-rule="evenodd" d="M36.57 7.8c2.49 0 4.88.92 6.68 2.58.14.13.36.12.49 0l1.3-1.27a.34.34 0 0 0 0-.5 12.55 12.55 0 0 0-16.93 0 .34.34 0 0 0 0 .5l1.3 1.26c.13.13.34.14.48 0a10 10 0 0 1 6.68-2.57m0 4.22a5.4 5.4 0 0 1 3.67 1.44c.14.13.35.13.48 0l1.3-1.33a.37.37 0 0 0-.01-.52 7.9 7.9 0 0 0-10.88 0 .37.37 0 0 0 0 .52l1.29 1.32c.13.14.34.14.48 0 1-.92 2.31-1.43 3.67-1.43m2.52 2.8q0 .15-.1.28l-2.18 2.45a.3.3 0 0 1-.24.11.3.3 0 0 1-.24-.1l-2.18-2.46a.43.43 0 0 1 .01-.56 3.44 3.44 0 0 1 4.82 0 .4.4 0 0 1 .11.28" clip-rule="evenodd" />
      <path fill-rule="evenodd" d="M70.5 5c2.05 0 3.08 0 3.88.34a4.3 4.3 0 0 1 2.28 2.28c.34.8.34 1.83.34 3.88s0 3.08-.34 3.88a4.3 4.3 0 0 1-2.28 2.28c-.8.34-1.83.34-3.88.34h-12c-2.05 0-3.08 0-3.88-.34a4.3 4.3 0 0 1-2.28-2.28c-.34-.8-.34-1.83-.34-3.88s0-3.08.34-3.88a4.3 4.3 0 0 1 2.28-2.28C55.42 5 56.45 5 58.5 5zM58.28 6c-1.85 0-2.77 0-3.48.36a3.3 3.3 0 0 0-1.44 1.44C53 8.5 53 9.43 53 11.28v.44c0 1.85 0 2.77.36 3.48a3.3 3.3 0 0 0 1.44 1.44c.7.36 1.63.36 3.48.36h12.44c1.85 0 2.77 0 3.48-.36a3.3 3.3 0 0 0 1.44-1.44c.36-.7.36-1.63.36-3.48v-.44c0-1.85 0-2.77-.36-3.48a3.3 3.3 0 0 0-1.44-1.44C73.5 6 72.57 6 70.72 6z" clip-rule="evenodd" style="opacity: .35" />
      <path d="M54 11c0-1.4 0-2.1.27-2.63a2.5 2.5 0 0 1 1.1-1.1C55.9 7 56.6 7 58 7h13c1.4 0 2.1 0 2.64.27q.72.37 1.09 1.1C75 8.9 75 9.6 75 11v1c0 1.4 0 2.1-.27 2.64a2.5 2.5 0 0 1-1.1 1.09C73.1 16 72.4 16 71 16H58c-1.4 0-2.1 0-2.63-.27a2.5 2.5 0 0 1-1.1-1.1C54 14.1 54 13.4 54 12z" />
      <path d="M78 9.5v4.08a2.2 2.2 0 0 0 1.33-2.04A2.2 2.2 0 0 0 78 9.5" style="opacity: .35" />
    </svg>
  </div>
</div>

### Changing the color

The status bar defaults to white text and icons, which works well over dark or saturated backgrounds. Use \`color: "black"\` on the text and \`fill: "black"\` on the SVG for light backgrounds.

### When to skip

Only omit the status bar for full-screen experiences where OS chrome is intentionally hidden — video players, camera UI, full-bleed splash screens. Include it for every other mobile design.
`.trim(),
    },
    {
      topic: "figma-import",
      title: "Importing Designs From Figma",
      description:
        "Step-by-step workflow for bringing Figma designs into Paper",
      content:
        '\n## Importing Designs From Figma into Paper\n\n### The core rule\n\nPaper\'s write_html only understands **concrete, literal CSS values**. Before writing any HTML into Paper, every value must be resolved to its final form — literal colors (#hex, rgb, oklch), pixel dimensions, font names, etc.\n\nIf the Figma MCP gives you a token name, a variable reference (`var(--primary)`), a Tailwind class, or an abstract placeholder, you MUST resolve it to the actual value using whatever Figma MCP tools are available. Make additional tool calls as needed until you have the real value. Unresolved references will silently fail or produce broken output.\n\nThis applies to everything:\n- **Colors**: Resolve design tokens and variables to literal values like `#3B82F6` or `oklch(55% 0.215 274)`\n- **Dimensions**: Resolve to concrete CSS values. Fixed sizes become pixel values (`16px`, `390px`). Flexible/auto-layout properties should map to their CSS equivalents (`flex-grow: 1`, `width: fit-content`, etc.). Always read from Figma.\n- **Typography**: Resolve to literal font families, weights, and sizes\n- **Spacing**: Resolve spacing tokens to pixel values\n- **Assets**: Inline image URLs directly into `<img src="...">`. Localhost URLs from the Figma MCP (e.g. `http://localhost:3845/assets/...`) are valid — Paper runs on the same machine and can fetch them. Do NOT substitute SVG image assets with generated SVG markup or CSS approximations. **Exception — tiled/repeating backgrounds**: If a Figma layer uses `background-image` with `background-repeat: repeat` (e.g. a grid or texture overlay), use a `<div>` with inline CSS `background-image: url(\'...\')`, `background-repeat: repeat`, and `background-size` instead of `<img>`. An `<img>` renders the source once and will not tile.\n\n### Conversion checklist\n\nBefore writing HTML into Paper, verify:\n\n1. **No variable references** — search for any `var(--...)` and replace with resolved values\n2. **No Tailwind classes** — convert all classes to equivalent inline CSS (`style="..."`)\n3. **No missing dimensions** — every element should have its size or layout behavior defined. Fixed elements need pixel values; flexible elements need flex properties. If a dimension is missing from the initial Figma response, make an additional call to get it.\n4. **No token names** — any design token (e.g. "primary-500", "spacing.lg") must be replaced with its literal value\n5. **Asset URLs inlined** — image sources should be full URLs in src attributes, not stored in variables. Localhost URLs from the Figma MCP are valid and will work.\n\n### Working with Figma node IDs\n\nFigma node IDs for instances may look like "I700:1100;2000:1000" with semicolons separating instance paths. When querying a specific node, use only the last segment after the semicolon (e.g. "2000:1000").\n'.trim(),
    },
  ],
  dc = new Map(ot.map((e) => [e.topic, e])),
  uc = ot.map((e) => e.topic);
function hc(e) {
  const t = dc.get(e);
  if (!t) {
    const n = uc.join(", ");
    return `Unknown guide topic: "${e}". Available topics: ${n}`;
  }
  return t.content;
}
const pc = ot.map((e) => `"${e.topic}" — ${e.description}`).join(`
`),
  fc = _({ nodeId: b().describe("The ID of the node to inspect") }),
  mc = _({
    nodeId: b().describe("The ID of the parent node to get children from"),
  }),
  gc = _({
    nodeId: b().describe("The ID of the node to capture"),
    transparent: Gn()
      .optional()
      .describe(
        "Defaults to false. Whether the image should have a transparent background. If true, returns a PNG; otherwise, returns a JPEG. PNG files are larger.",
      ),
    scale: te()
      .optional()
      .describe(
        "Render scale factor. 1 (default) for layout checks and general visual understanding. 2 for reading small text or inspecting fine details.",
      ),
  }),
  yc = _({
    nodeId: b().describe("The ID of the node to generate JSX from"),
    format: K(["tailwind", "inline-styles"])
      .optional()
      .describe(
        'Style format: "tailwind" (default) uses Tailwind classes with inline fallback, "inline-styles" uses pure inline styles',
      ),
  }),
  bc = _({
    nodeId: b().describe("The ID of the root node to summarize"),
    depth: te()
      .optional()
      .describe(
        "Maximum depth to traverse (default 3, max 10). Nodes beyond this depth show a child count hint instead.",
      ),
  }),
  vc = _({ nodeIds: R(b()).describe("Array of node IDs to get styles from") }),
  _c = _({
    nodeId: b().describe("The ID of the node containing an image fill"),
  }),
  wc = _({
    familyNames: R(b()).describe("Names of the font families to look up."),
  }),
  Sc = _({
    types: R(K(tn))
      .optional()
      .describe("Filter by design token type(s). Omit to include all types."),
    namePattern: b()
      .optional()
      .describe(
        'Glob pattern matched against the full CSS variable name (case-insensitive). Use "*" as a wildcard. Examples: "--color-primary", "--color-*", "*-500", "*brand*". Omit to skip name filtering.',
      ),
    format: K(["json", "css", "tailwind"])
      .optional()
      .describe(
        'Output format. "json" (default) returns structured tokens. "css" returns a vanilla `:root { ... }` stylesheet. "tailwind" returns a Tailwind v4 `@theme { ... }` block with namespaced variables.',
      ),
  }),
  kc = _({
    html: b().describe(
      "HTML string to parse into design nodes. Supports standard HTML elements with inline CSS styles.",
    ),
    targetNodeId: b().describe(
      'The ID of the target node. In "insert-children" mode, new nodes are added as children of this node. In "replace" mode, this node is removed and replaced by the parsed HTML.',
    ),
    mode: K(["insert-children", "replace"]).describe(
      '"insert-children" adds the HTML as children of the target node. "replace" removes the target node and puts the parsed HTML in its place.',
    ),
  }),
  Ic = _({
    name: b().describe("Name for the artboard (shown in the layer tree)."),
    styles: _({
      width: b().describe(
        'Width of the artboard as a whole pixel value (e.g. "1440px").',
      ),
      height: b().describe(
        'Height of the artboard as a whole pixel value (e.g. "900px").',
      ),
    }).catchall(he([b(), te()]))
      .describe(`CSS styles for the artboard as a JSON object. Use camelCase property names.
width and height are required — use whole pixel values.
When positioning an artboard make sure to give 80px of space between artboards to avoid overlaps.
Example: {"display": "flex", "flexDirection": "column", "width": "1440px", "height": "900px", "backgroundColor": "#f5f5f5", "padding": "20px"}`),
  }),
  xc = _({ nodeIds: R(b()).describe("Array of node IDs to delete.") }),
  Tc = _({
    updates: R(
      _({
        nodeId: b().describe("The ID of the Text node to update."),
        textContent: b().describe("The new text content."),
      }),
    ).describe(
      "Array of text updates to apply. Each item specifies a node ID and its new text content.",
    ),
  }),
  zc = _({
    updates: R(
      _({
        nodeId: b().describe("The ID of the node to rename."),
        name: b().describe("The new display name for the layer."),
      }),
    ).describe(
      "Array of rename updates. Each item specifies a node ID and its new name.",
    ),
  }),
  Qn = he([b(), te()]).describe(
    'Design token value. For colors, use a CSS color string like "#ff0000" or "oklch(...)". For sizes (spacing, radius, fontSize, container, breakpoint), use a px string like "8px". For fontWeight, use a number (e.g. 400). For lineHeight/letterSpacing, use a string ("1.5px") or number. To alias another design token, use a CSS variable reference like "var(--color-red)".',
  ),
  Be = b().regex(
    /^--[a-zA-Z0-9_-]+$/,
    'Must be a CSS custom property name: "--" followed by letters, digits, "_" or "-" (e.g. "--color-primary").',
  ),
  Pc = _({
    tokens: R(
      _({
        type: K(tn).describe("Design token type/category."),
        name: Be.describe('CSS custom property name. E.g. "--color-primary".'),
        value: Qn,
        description: b()
          .max(1024)
          .optional()
          .describe(
            "Optional human-readable description of what the design token is for and how it should be used. Max 1024 characters.",
          ),
      }),
    )
      .min(1)
      .describe(
        "Design tokens to create. Each entry creates a new design token; duplicate names are allowed but discouraged.",
      ),
  }),
  $c = _({
    tokens: R(
      _({
        name: Be.describe(
          'Target design token by its full CSS custom property name (e.g. "--color-primary").',
        ),
        newName: Be.optional().describe(
          'Optional. Rename the design token. Provide the full CSS custom property name (e.g. "--color-primary-strong").',
        ),
        value: Qn.optional().describe("Optional. New value."),
        description: b()
          .max(1024)
          .optional()
          .describe(
            "Optional human-readable description of what the design token is for and how it should be used. Max 1024 characters. Pass an empty string to clear.",
          ),
        delete: Gn()
          .optional()
          .describe("Optional. If true, deletes the design token entirely."),
      }),
    )
      .min(1)
      .describe("Design tokens to update or delete, applied sequentially."),
  }),
  Cc = _({
    updates: R(
      _({
        nodeIds: R(b()).describe("The IDs of the nodes to update."),
        styles: Kn(b(), he([b(), te()])).describe(
          'Styles as a JSON object with camelCase property names (e.g. {"backgroundColor": "#fff", "padding": "20px"}), like React.CSSProperties.',
        ),
      }),
    ).describe(
      "Array of style updates to apply. Each item specifies node IDs and styles to apply to all of them.",
    ),
  }),
  Nc = he([
    _({
      nodeId: b().describe("The ID of the node to move."),
      before: b().describe(
        "Place the node immediately before this sibling. The target parent is inferred from the sibling.",
      ),
    }).strict(),
    _({
      nodeId: b().describe("The ID of the node to move."),
      after: b().describe(
        "Place the node immediately after this sibling. The target parent is inferred from the sibling.",
      ),
    }).strict(),
    _({
      nodeId: b().describe("The ID of the node to move."),
      parentId: b().describe(
        "The ID of the destination parent. Must be able to have children (e.g. Frames). Pass the string `'root'` as a shortcut for the top-level page root (same as the rootNodeId returned by get_basic_info).",
      ),
      index: te()
        .int()
        .min(0)
        .optional()
        .describe(
          "The final index among the destination parent's children. Clamped to [0, childCount]. Use 0 for first, or omit to append at the end.",
        ),
    }).strict(),
  ]),
  Oc = _({
    moves: R(Nc)
      .min(1)
      .describe(
        "Move operations, applied sequentially. Each operation sees the updated tree from prior operations.",
      ),
  }),
  Ec = _({
    nodes: R(
      _({
        id: b().describe("The ID of the node to duplicate."),
        parentId: b()
          .optional()
          .describe(
            "Optional. The ID of the parent node to place the duplicate under. If omitted, the duplicate is placed under the same parent as the source node.",
          ),
      }),
    ).describe(
      "Array of nodes to duplicate. Each item specifies a node ID and optionally a parent ID for where to place the duplicate. If no parent ID is provided, duplicates are placed under the same parent as their source node.",
    ),
  }),
  Zc = _({
    nodeIds: R(b())
      .optional()
      .describe(
        "Optional. Specific node IDs to release. If omitted, all working indicators are released.",
      ),
  }),
  Ac = _({
    topic: b().describe(`The guide topic to read. Available topics:
${pc}`),
  }),
  Dc = _({
    fileId: b()
      .min(1)
      .describe(
        "The Paper file ID to open. Accepts a bare ID, a /file/<id> route path, or a full https URL pointing at the file.",
      ),
  }),
  Rc = _({
    limit: te()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe(
        "Maximum number of files to return. Defaults to 50. Files are sorted by updatedAt, most recent first.",
      ),
  }),
  Uc = _({
    cloneFileId: b()
      .optional()
      .describe(
        "Optional file ID to clone from. If provided, the new file is a copy of this one.",
      ),
    name: b().optional().describe("Optional display name for the new file."),
  }),
  Mc = _({
    pageId: b()
      .min(1)
      .describe(
        "The ID of the page to switch to within the currently open file.",
      ),
  }),
  jc = _({
    name: b()
      .optional()
      .describe(
        'Optional display name for the new page (shown in the page list). Defaults to "Page N".',
      ),
  }),
  Fc = _({
    format: qn(Object.values(uo)),
    scale: b()
      .regex(
        /^\d+(\.\d+)?(x|w|h|p)$/,
        'Scale must be a number followed by a unit: x (multiplier), w (width), h (height), or p (pixels on shortest side). E.g. "2x", "512w", "1080p"',
      )
      .describe(
        'Export scale. A number followed by a unit: "x" (multiplier, e.g. "0.5x", "1x", "2x"), "p" (pixels on shortest side, e.g. "720p", "1440p"), "w" (target width, e.g. "512w"), or "h" (target height, e.g. "512h")',
      ),
    durationSeconds: te()
      .min(ao)
      .max(co)
      .default(lo)
      .optional()
      .describe(
        'Video duration in seconds. Only applicable when type is "video".',
      ),
    pdfQuality: K(Object.values(so))
      .default(io)
      .optional()
      .describe(
        'PDF image quality for images. Only applicable when format is "pdf".',
      ),
    pdfResampling: K(Object.values(oo))
      .default(ro)
      .optional()
      .describe(
        'PDF image resizing resampling strategy. "detailed" preserves fine detail with the Lanczos algorithm, "basic" produces smaller files and uses the Hamming algorithm. Only applicable when format is "pdf".',
      ),
  }),
  Hc = _({
    type: K(["image", "video"])
      .optional()
      .describe('Export type, defaults to "image".'),
    nodes: he([
      qn("nodes-with-exports-only").describe(
        "Exports all nodes that are already marked to export explicitly set in the file.",
      ),
      Kn(
        b(),
        R(Fc).describe(
          "Used to override the default export settings for the node. Set to an empty array `[]` to export with default settings.",
        ),
      ).describe("Record of nodes to export, keyed by nodeId."),
    ]),
  }),
  Lc = _({
    nodeIds: R(b())
      .min(1)
      .describe(
        "Node IDs to combine into a single PDF, one page per node. Pages are auto-ordered by top-to-bottom then left-to-right canvas position.",
      ),
  }),
  Wc = `
Creates a new artboard (top-level frame) on the canvas.
- Returns the node ID which you can then use with write_html({mode:'insert-children'}) to add content.
- Use the styles property to set the artboard size and styles.
- Artboards default to \`display: "flex", flexDirection: "column"\`
- The artboard will always be placed in the best empty spot on the canvas.
- Use one of the default sizes below unless the user specifies a size.
**Default sizes by device** (when the user doesn't specify a size):
  - **Desktop**: 1440 x 900px
  - **Tablet**: 768 x 1024px
  - **Mobile**: 390 x 844px — include a status bar at the top. Call \`get_guide({ topic: "mobile-status-bar" })\` for paste-ready markup; do not hand-draw one.

The suggested device height is just a starting point to set the scene and understand how much space there is for the content above the fold. When wrapping up, if content clips, switch the artboard to \`height: "fit-content"\` via update_styles instead of guessing a new fixed height.
`,
  Vt = [
    {
      name: "open_file",
      description:
        "Open a Paper file by its ID or URL. If it is already open, it will return the same result as get_node_info.",
      annotations: { readOnlyHint: !0 },
      inputSchema: Dc,
    },
    {
      name: "list_files",
      description:
        "List Paper files in the user's active team, sorted by most-recently-updated first. Returns each file with its id, name, and timestamps.",
      annotations: { readOnlyHint: !0 },
      inputSchema: Rc,
    },
    {
      name: "create_file",
      description:
        "Create a new Paper file in the user's active team and returns the new file's ID. To start working in the new file, call open_file with the returned ID.",
      annotations: { destructiveHint: !0 },
      inputSchema: Uc,
    },
    {
      name: "open_page",
      description:
        "Switch the currently open file to a different page by ID. Returns updated basic info for the opened page.",
      annotations: { readOnlyHint: !0 },
      inputSchema: Mc,
    },
    {
      name: "create_page",
      description:
        "Create a new page in the currently open file and return its ID. Does not switch to the new page — call open_page with the returned ID to start working in it.",
      annotations: { destructiveHint: !0 },
      inputSchema: jc,
    },
    {
      name: "get_basic_info",
      description: `Get essential context about the current design: file name, page name, node count, artboards with their dimensions, font families used, a compact list of design tokens.
Call get_basic_info first to understand the canvas situation.`,
      annotations: { readOnlyHint: !0 },
    },
    {
      name: "get_selection",
      description:
        "Get detailed information about the currently selected nodes, including IDs, names, component types, size, and which artboard they belong to.",
      annotations: { readOnlyHint: !0 },
    },
    {
      name: "get_node_info",
      description:
        "Get detailed information about a specific node by ID, including its size, visibility, lock state, parent, children IDs, and text content (for text nodes). Returns an error if the node does not exist.",
      annotations: { readOnlyHint: !0 },
      inputSchema: fc,
    },
    {
      name: "get_children",
      description:
        "Get the direct children of a node. Returns a list of child nodes with their IDs, names, component types, and how many children each has. Useful for exploring the design hierarchy. Returns an error if the node does not exist.",
      annotations: { readOnlyHint: !0 },
      inputSchema: mc,
    },
    {
      name: "get_screenshot",
      description:
        "Capture a screenshot of a specific node by ID. Returns the image as base64-encoded data. Images are automatically capped to fit API size limits. Defaults to 1x scale which is sufficient for verifying layout, spacing, and visual appearance. Use scale=2 only when you need to read small text or inspect fine visual details. Capture child nodes when needing higher resolution screenshots.",
      annotations: { readOnlyHint: !0 },
      inputSchema: gc,
    },
    {
      name: "get_jsx",
      description:
        "Get the JSX code representation of a node and its descendants. Supports two styling formats: Tailwind CSS classes (default) or inline styles.",
      annotations: { readOnlyHint: !0 },
      inputSchema: yc,
    },
    {
      name: "get_tree_summary",
      description:
        "Get a compact text summary of a node's subtree hierarchy. Returns an indented tree showing each node's component type, name, ID, and dimensions. Much cheaper than getJSX for understanding structure — use this for orientation before diving into specific nodes. Returns an error if the node does not exist.",
      annotations: { readOnlyHint: !0 },
      inputSchema: bc,
    },
    {
      name: "get_computed_styles",
      description:
        "Get the computed CSS styles for one or more nodes. Returns a map of nodeId to CSSProperties object. Supports batch requests.",
      annotations: { readOnlyHint: !0 },
      inputSchema: vc,
    },
    {
      name: "get_fill_image",
      description:
        "Extract the image data from a node that has an image fill. Returns the image as base64-encoded JPEG data optimized for AI consumption. Large images are automatically resized to fit within API size limits. The original image URL is included in the metadata if you need the full-quality source. Returns an error if the node does not exist, or a message if the node has no image fill.",
      annotations: { readOnlyHint: !0 },
      inputSchema: _c,
    },
    {
      name: "get_font_family_info",
      description:
        "Get information about whether a font family is available to the user and detailed information about all weights and styles in the family. This tool looks up fonts on the user's machine and Google Fonts.",
      annotations: { readOnlyHint: !0 },
      inputSchema: wc,
    },
    {
      name: "get_guide",
      description:
        'Read a detailed guide on a specific topic. Call with topic "paper-mcp-instructions" before using other Paper tools for best results. Guides provide step-by-step workflows for design quality, review checkpoints, and specialized tasks.',
      annotations: { readOnlyHint: !0 },
      inputSchema: Ac,
    },
    {
      name: "export",
      description:
        "Export nodes as image or video files. Unless the user specifies, do not override the default export settings.",
      annotations: { readOnlyHint: !0 },
      inputSchema: Hc,
    },
    {
      name: "export_combined_pdf",
      description:
        'Export multiple nodes combined into a single PDF file, one page per node. Pages are auto-ordered by canvas position (top-to-bottom, then left-to-right). Use this instead of "export" when the user wants the nodes merged into one PDF rather than separate files. The quality and resampling used is the highest of any existing PDF export settings found on individual nodes.',
      annotations: { readOnlyHint: !0 },
      inputSchema: Lc,
    },
    {
      name: "write_html",
      description: `IMPORTANT: Write incrementally. The user sees you write on the canvas in real-time. Show them visual progress every few seconds.
Each write_html call should create one visual item: a header, a single list row, a button bar, or a paragraph block.
Even simple components should be incremental: e.g. a card: first the container/header, then each row, then the footer.
IMPORTANT: Clone to save tokens instead of recreating existing Paper nodes. Use \`<x-paper-clone node-id="A-01" style="..." />\` to slot clones into the HTML you write.
For repeated elements: create the container first, then add each item as a separate write_html call into the container or use the duplicate tool on the first child.

HTML and CSS rules:
- Always use inline styles (style="...")
- All Google Fonts are available in font-family (e.g. font-family: "Font Name", serif). Locally installed fonts also work.
- All CSS color formats are supported: hex, rgb, rgba, hsl, hsla, oklch, oklab etc.
- Use display: flex as the primary layout mode. Flexbox, padding, and gap are the core layout tools in Paper's interface.
- Absolute position is fully supported. Use it for decorative elements. Avoid covering the entire artboard with a single absolute element, it blocks cursor interaction underneath.
- Do NOT use: margin, display: inline, display: grid, HTML tables. Use padding and gap for spacing.
- display: block is acceptable for simple elements (text, decorative shapes) but not for layout containers
- Assume border-box sizing everywhere
- Use <pre> or white-space: pre for code blocks or indented text
- Do NOT use emojis as icons. Use SVG icons or images
- Rich text isn't supported in Paper, for code snippets make a single element with one text color and use pre for whitespace.
- Use the layer-name attribute to set names on elements in the Paper layer tree, e.g. <div layer-name="Hero">
- Images from the local file system MUST use absolute paths in an img starting with paper-asset:// protocol e.g. <img src="paper-asset:///Users/name/image.svg">`,
      annotations: { destructiveHint: !0 },
      inputSchema: kc,
    },
    {
      name: "create_artboard",
      description: Wc,
      annotations: { destructiveHint: !0 },
      inputSchema: Ic,
    },
    {
      name: "delete_nodes",
      description: `Delete one or more nodes from the design. Also deletes all descendants of the specified nodes.
IMPORTANT: Before deleting nodes that you think have an incorrect parent verify using get_node_info first.`,
      annotations: { destructiveHint: !0 },
      inputSchema: xc,
    },
    {
      name: "set_text_content",
      description:
        'Set the text content of one or more Text nodes. Only works on nodes with component type "Text". Use this instead of writeHTML replace when you only need to change text. Supports batch updates in a single call.',
      annotations: { destructiveHint: !0 },
      inputSchema: Tc,
    },
    {
      name: "rename_nodes",
      description:
        "Rename one or more layers in the design. Sets the display name shown in the layer tree. Names longer than 50 characters are automatically truncated. Supports batch renames in a single call.",
      annotations: { destructiveHint: !0 },
      inputSchema: zc,
    },
    {
      name: "update_styles",
      description:
        "Update styles on one or more nodes. Use this for targeted style changes. Supports batch updates in a single call.",
      annotations: { destructiveHint: !0 },
      inputSchema: Cc,
    },
    {
      name: "duplicate_nodes",
      description:
        "Duplicate one or more nodes in the design. Creates a deep clone of each node (including all descendants). Duplicated artboards are automatically positioned in a blank area to avoid overlap. Returns the source and new node IDs, plus a descendantIdMap that maps every original descendant ID to its cloned equivalent. Since you already know the source tree structure, you can use this map to immediately reference any cloned node (e.g. to call setTextContent) without any intermediate lookups.",
      annotations: { destructiveHint: !0 },
      inputSchema: Ec,
    },
    {
      name: "move_nodes",
      description: `Move one or more existing nodes. Preserves node identity (IDs stay the same), so any references you are holding continue to work. Prefer this over duplicate+delete or rewriting HTML when you just want to reposition or reparent existing layers.

Each move uses one of two shapes:
1. Sibling-relative: { nodeId, before: siblingId } or { nodeId, after: siblingId }. The destination parent is inferred from the sibling.
2. Parent-absolute: { nodeId, parentId, index? }. The node is placed at the given index under parentId, or appended if index is omitted. index is clamped to [0, childCount] — use 0 for first. Pass parentId: 'root' as a shortcut for the top-level page root as a parent.

Use shape sibling-relative shape 1 when you already know a neighbor; use parent-absolute shape 2 when you want to move into a specific parent (or to the end of one).

Notes:
- Moves apply sequentially; later moves in the same batch see earlier changes.
- For flex/flow parents this changes visual order. For freeform parents this changes stacking (last child renders on top) and does not move the node's world position.
- When moving to a new parent, Paper may adjust layout-related styles (width/height intents like filling available space) may be adjusted so the node does not collapse to zero size in the new parent.
- Cannot move the root. Cannot target a node that cannot have children. Cannot move a node under itself or any of its own descendants. For before/after, the sibling cannot be the moved node itself.
Returns resolved parentId and index for each successful move, plus affectedParents — the post-batch children list of every parent whose order changed (both sources and destinations, deduplicated). Use affectedParents to refresh your mental model of the tree without a follow-up get_children.`,
      annotations: { destructiveHint: !0 },
      inputSchema: Oc,
    },
    {
      name: "finish_working_on_nodes",
      description: `MUST call this when done working.
Remove the working indicator from artboards you were editing.

Call with no arguments to release all working indicators at once. Optionally pass specific artboard IDs if you want to release only some.`,
      annotations: { readOnlyHint: !0 },
      inputSchema: Zc,
    },
  ],
  Jc = [
    {
      name: "get_tokens",
      description:
        "List the file's design tokens (colors, spacing, typography, etc).",
      annotations: { readOnlyHint: !0 },
      inputSchema: Sc,
    },
    {
      name: "create_tokens",
      description:
        'Create one or more design tokens. Each entry needs `type`, `name`, and `value`.\nUse `var(--other-token)` as the value to alias another design token.\nReturns one `{name, result: "created"}` (or `{result: "error", message}`) per input entry.\nPrefer reusing design tokens before creating new ones.\n',
      annotations: { destructiveHint: !0 },
      inputSchema: Pc,
    },
    {
      name: "set_tokens",
      description:
        "Update or delete existing design tokens by their full CSS variable name. Each entry needs `name`; any of `newName`, `value`, `delete` are optional.\n- Rename: set `newName`.\n- Update value: set `value`. Use `var(--other-token)` to alias.\n- Delete the design token: set `delete: true`.\nReturns one result per input entry. Per-entry errors are reported in-band.",
      annotations: { destructiveHint: !0 },
      inputSchema: $c,
    },
  ],
  Vc = `
Paper is a professional design tool for creating user interfaces. The user is working on a 2D canvas composing designs.
The Paper MCP server gives you tools to be a talented designer for web and mobile apps and websites. You can read designs from the user's file, understand what the user is currently doing, and write HTML back into the design as new nodes.

You MUST load the full guide before other Paper tools: get_guide({ topic: "paper-mcp-instructions" }). Do this once per session; call again if a long thread may have compressed or dropped guide text.

- Context: call get_basic_info first to understand artboards and dimensions; use get_selection to see user focus.
- Typography: you MUST call get_font_family_info before your first typographic styling in a session. Prefer font families already listed in get_basic_info unless the user specifies otherwise. Use px for font sizes, em for letter-spacing, px for line-height.
- New designs: before writing HTML, generate a brief (palette, type scale, spacing, direction) unless the user provides a design system.
- Creating/editing: each write_html call should add roughly one visual group; prefer duplicate_nodes with update_styles and set_text_content when it is faster than rewriting HTML.
- Quality: use get_screenshot to review after meaningful changes. Artboard height is a starting point — when content clips switch the artboard to height: "fit-content" via update_styles rather than guessing fixed heights.
- Repeated rows (lists, nav): use fixed-width slots for icons and trailing actions (flexShrink: 0); do not rely on gap alone to align columns across rows.
- When done creating or editing, you MUST call finish_working_on_nodes.
- User-facing output: do not include raw node IDs.
- Export to the user's codebase: use get_jsx, get_computed_styles, get_fill_image, etc. for exact values — do not read sizes or colors from screenshots alone.
`.trim(),
  Bc = { type: "object", properties: {} };
function rt() {
  return en("tokens") ? [...Vt, ...Jc] : Vt;
}
function Gc() {
  return {
    tools: rt().map((e) => ({
      name: e.name,
      description: e.description,
      inputSchema: e.inputSchema ? Gi(e.inputSchema) : Bc,
      annotations: e.annotations,
    })),
    instructions: Vc,
  };
}
function Kc(e) {
  return rt().find((t) => t.name === e);
}
const Bt = 2e3,
  eo = 45e5,
  qc = 0.92;
function to(e, t) {
  let { width: n, height: o } = e,
    r = !1,
    i = e;
  const s = Math.max(n, o);
  if (s > Bt) {
    const l = Bt / s,
      c = Math.round(n * l),
      d = Math.round(o * l);
    ((i = no(e, c, d)), (n = c), (o = d), (r = !0));
  }
  const a = Ge(i, `image/${t}`, qc);
  return a.length <= eo
    ? { base64: a, mimeType: `image/${t}`, width: n, height: o, wasResized: r }
    : Yc(i, n, o, t);
}
function Yc(e, t, n, o) {
  let r = e,
    i = t,
    s = n;
  for (let l = 0; l < 8; l++) {
    for (let c = 0.75; c >= 0.4; c -= 0.15) {
      const d = Ge(r, `image/${o}`, c);
      if (d.length <= eo)
        return {
          base64: d,
          mimeType: `image/${o}`,
          width: i,
          height: s,
          wasResized: !0,
        };
    }
    ((i = Math.round(i / 2)), (s = Math.round(s / 2)), (r = no(r, i, s)));
  }
  return {
    base64: Ge(r, `image/${o}`, 0.5),
    mimeType: `image/${o}`,
    width: i,
    height: s,
    wasResized: !0,
  };
}
async function Xc(e, t = "jpeg") {
  const n = await Qc(e);
  return to(n, t);
}
function Ge(e, t, n) {
  return e.toDataURL(t, n).replace(/^data:[^;]+;base64,/, "");
}
function no(e, t, n) {
  const o = document.createElement("canvas");
  return (
    (o.width = t),
    (o.height = n),
    o.getContext("2d").drawImage(e, 0, 0, t, n),
    o
  );
}
function Qc(e) {
  return new Promise((t, n) => {
    const o = new Image(),
      r = URL.createObjectURL(e);
    ((o.onload = () => {
      const i = document.createElement("canvas");
      ((i.width = o.naturalWidth),
        (i.height = o.naturalHeight),
        i.getContext("2d").drawImage(o, 0, 0),
        URL.revokeObjectURL(r),
        t(i));
    }),
      (o.onerror = () => {
        (URL.revokeObjectURL(r), n(new Error("Failed to load image blob")));
      }),
      (o.src = r));
  });
}
let Gt, Kt;
function el(e, t, n, o, r, i) {
  var s,
    a,
    l,
    c,
    d,
    u,
    h,
    f = Symbol.metadata || Symbol.for("Symbol.metadata"),
    m = Object.defineProperty,
    y = Object.create,
    k = [y(null), y(null)],
    T = t.length;
  function E(S, A, L) {
    return function ($, Z) {
      A && ((Z = $), ($ = e));
      for (var V = 0; V < S.length; V++) Z = S[V].apply($, L ? [Z] : []);
      return L ? Z : $;
    };
  }
  function w(S, A, L, $) {
    if (typeof S != "function" && ($ || S !== void 0))
      throw new TypeError(
        A + " must " + (L || "be") + " a function" + ($ ? "" : " or undefined"),
      );
    return S;
  }
  function v(S, A, L, $, Z, V, ne, W, B, G, st) {
    function Ze(U) {
      if (!st(U))
        throw new TypeError(
          "Attempted to access private element on non-instance",
        );
    }
    var Ae = [].concat(A[0]),
      it = A[3],
      De = !ne,
      pe = Z === 1,
      at = Z === 3,
      ct = Z === 4,
      ye = Z === 2;
    function be(U, re, ut) {
      return function (_e, ht) {
        return (re && ((ht = _e), (_e = S)), ut && ut(_e), D[U].call(_e, ht));
      };
    }
    if (!De) {
      var D = {},
        Re = [],
        q = at ? "get" : ct || pe ? "set" : "value";
      if (
        (B
          ? (G || pe
              ? (D = {
                  get: qt(
                    function () {
                      return it(this);
                    },
                    $,
                    "get",
                  ),
                  set: function (U) {
                    A[4](this, U);
                  },
                })
              : (D[q] = it),
            G || qt(D[q], $, ye ? "" : q))
          : G || (D = Object.getOwnPropertyDescriptor(S, $)),
        !G && !B)
      ) {
        if ((a = k[+W][$]) && (a ^ Z) !== 7)
          throw Error(
            "Decorating two elements with the same name (" +
              D[q].name +
              ") is not supported yet",
          );
        k[+W][$] = Z < 3 ? 1 : Z;
      }
    }
    for (var F = S, ve = Ae.length - 1; ve >= 0; ve -= L ? 2 : 1) {
      var lt = w(Ae[ve], "A decorator", "be", !0),
        dt = L ? Ae[ve - 1] : void 0,
        Ue = {},
        fe = {
          kind: ["field", "accessor", "method", "getter", "setter", "class"][Z],
          name: $,
          metadata: s,
          addInitializer: function (U, re) {
            if (U.v)
              throw new TypeError(
                "attempted to call addInitializer after decoration was finished",
              );
            (w(re, "An initializer", "be", !0), V.push(re));
          }.bind(null, Ue),
        };
      if (De)
        ((a = lt.call(dt, F, fe)),
          (Ue.v = 1),
          w(a, "class decorators", "return") && (F = a));
      else if (
        ((fe.static = W),
        (fe.private = B),
        (a = fe.access =
          {
            has: B
              ? st.bind()
              : function (U) {
                  return $ in U;
                },
          }),
        ct ||
          (a.get = B
            ? ye
              ? function (U) {
                  return (Ze(U), D.value);
                }
              : be("get", 0, Ze)
            : function (U) {
                return U[$];
              }),
        ye ||
          at ||
          (a.set = B
            ? be("set", 0, Ze)
            : function (U, re) {
                U[$] = re;
              }),
        (F = lt.call(dt, pe ? { get: D.get, set: D.set } : D[q], fe)),
        (Ue.v = 1),
        pe)
      ) {
        if (typeof F == "object" && F)
          ((a = w(F.get, "accessor.get")) && (D.get = a),
            (a = w(F.set, "accessor.set")) && (D.set = a),
            (a = w(F.init, "accessor.init")) && Re.unshift(a));
        else if (F !== void 0)
          throw new TypeError(
            "accessor decorators must return an object with get, set, or init properties or undefined",
          );
      } else
        w(F, (G ? "field" : "method") + " decorators", "return") &&
          (G ? Re.unshift(F) : (D[q] = F));
    }
    return (
      Z < 2 && ne.push(E(Re, W, 1), E(V, W, 0)),
      G ||
        De ||
        (B
          ? pe
            ? ne.splice(-1, 0, be("get", W), be("set", W))
            : ne.push(ye ? D[q] : w.call.bind(D[q]))
          : m(S, $, D)),
      F
    );
  }
  function x(S) {
    return m(S, f, { configurable: !0, enumerable: !0, value: s });
  }
  return (
    (s = y(s ?? null)),
    (d = []),
    (u = function (S) {
      S && d.push(E(S));
    }),
    (h = function (S, A) {
      for (var L = 0; L < n.length; L++) {
        var $ = n[L],
          Z = $[1],
          V = 7 & Z;
        if ((8 & Z) == S && !V == A) {
          var ne = $[2],
            W = !!$[3],
            B = 16 & Z;
          v(
            S ? e : e.prototype,
            $,
            B,
            W ? "#" + ne : tl(ne),
            V,
            V < 2 ? [] : S ? (c = c || []) : (l = l || []),
            d,
            !!S,
            W,
            A,
            S && W
              ? function (G) {
                  return ol(G) === e;
                }
              : r,
          );
        }
      }
    }),
    h(8, 0),
    h(0, 0),
    h(8, 1),
    h(0, 1),
    u(l),
    u(c),
    (a = d),
    T || x(e),
    {
      e: a,
      get c() {
        var S = [];
        return T && [x((e = v(e, [t], o, e.name, 5, S))), E(S, 1)];
      },
    }
  );
}
function tl(e) {
  var t = nl(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function nl(e, t) {
  if (typeof e != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (typeof o != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function qt(e, t, n) {
  typeof t == "symbol" && (t = (t = t.description) ? "[" + t + "]" : "");
  try {
    Object.defineProperty(e, "name", {
      configurable: !0,
      value: n ? n + " " + t : t,
    });
  } catch {}
  return e;
}
function ol(e) {
  if (Object(e) !== e)
    throw TypeError(
      "right-hand side of 'in' should be an object, got " +
        (e !== null ? typeof e : "null"),
    );
  return e;
}
class J extends Error {}
function Yt(e) {
  if (e === void 0) return null;
  if (typeof e == "number") return e;
  const t = e.match(/^(\d+(?:\.\d+)?)px$/);
  return t ? parseFloat(t[1]) : null;
}
const He = 100,
  Le = 100,
  se = 100,
  rl = 50,
  sl = 6e4,
  Xt = 80;
class al {
  static {
    [Gt, Kt] = el(this, [], [[No, 1, "__internalEditorState"]]).e;
  }
  #e = Gt(this, null);
  get __internalEditorState() {
    return this.#e;
  }
  set __internalEditorState(t) {
    this.#e = t;
  }
  hasSeenUpgradeModal = (Kt(this), !1);
  __internalRoot = null;
  constructor() {
    en("tokens") &&
      ((this.toolHandlers.get_tokens = (o, r) => this.getTokens(o, r)),
      (this.toolHandlers.create_tokens = (o, r) => this.createTokens(o, r)),
      (this.toolHandlers.set_tokens = (o, r) => this.setTokens(o, r)));
    const t = rt();
    for (const o of t)
      if (!(o.name in this.toolHandlers))
        throw new Error(
          `MCP tool "${o.name}" has no handler in MCPHandlers.toolHandlers`,
        );
    const n = new Set(t.map((o) => o.name));
    for (const o of Object.keys(this.toolHandlers))
      if (!n.has(o))
        throw new Error(
          `MCPHandlers.toolHandlers has "${o}" with no matching entry in TOOL_DEFINITIONS`,
        );
  }
  setEditorState = (t) => {
    this.__internalEditorState = t;
  };
  clearEditorState = (t) => {
    this.__internalEditorState === t && (this.__internalEditorState = null);
  };
  setRoot = (t) => {
    this.__internalRoot = t;
  };
  get contentHash() {
    return { tokens: this.editorState.tokenState.contentHash };
  }
  get editorState() {
    if (!this.__internalEditorState)
      throw new J("Open a Paper file to use this tool.");
    return this.__internalEditorState;
  }
  get root() {
    if (!this.__internalRoot)
      throw new J(
        "The MCP server is taking longer than expected to start up. Please wait a moment and try again, or close and re-open Paper Desktop if the problem persists.",
      );
    return this.__internalRoot;
  }
  getMCPServerConfig = () => Gc();
  handleToolCall = async (t, n, o) => {
    const r = Kc(n);
    if (!r)
      return {
        content: [{ type: "text", text: `Unknown tool: ${n}` }],
        isError: !0,
      };
    let i = o;
    if (r.inputSchema) {
      const s = r.inputSchema.safeParse(o);
      if (!s.success) {
        const a = s.error instanceof Error ? s.error.message : String(s.error);
        return {
          content: [
            {
              type: "text",
              text: `Invalid arguments for tool ${n}: ${a}

Try once more, and if it still fails, ask the user to restart their MCP connection to get the latest tool definitions.`,
            },
          ],
          isError: !0,
        };
      }
      i = s.data;
    }
    try {
      const s = await this.dispatchToolCall(t, n, i);
      return this.toToolResult(s);
    } catch (s) {
      if (s instanceof J)
        return { content: [{ type: "text", text: s.message }], isError: !0 };
      throw s;
    }
  };
  toolHandlers = {
    get_basic_info: () => this.getBasicInfo(),
    get_selection: (t) => this.getSelection(t),
    get_node_info: (t, n) => this.getNodeInfo(t, n),
    get_children: (t, n) => this.getChildren(t, n),
    get_screenshot: (t, n) => this.getScreenshot(t, n),
    get_jsx: (t, n) => this.getJSX(t, n),
    get_tree_summary: (t, n) => this.getTreeSummary(t, n),
    get_computed_styles: (t, n) => this.getComputedStyles(t, n),
    get_fill_image: (t, n) => this.getFillImage(t, n),
    get_font_family_info: (t, n) => this.getFontFamilyInfo(t, n),
    get_guide: (t, n) => this.getGuide(n),
    open_file: (t, n) => this.openFile(t, n),
    list_files: (t, n) => this.listFiles(t, n),
    create_file: (t, n) => this.createFile(t, n),
    open_page: (t, n) => this.openPage(t, n),
    create_page: (t, n) => this.createPage(t, n),
    write_html: (t, n) => this.writeHTML(t, n),
    create_artboard: (t, n) => this.createArtboard(t, n),
    delete_nodes: (t, n) => this.deleteNodes(t, n),
    set_text_content: (t, n) => this.setTextContent(t, n),
    rename_nodes: (t, n) => this.renameNodes(t, n),
    update_styles: (t, n) => this.updateStyles(t, n),
    duplicate_nodes: (t, n) => this.duplicateNodes(t, n),
    move_nodes: (t, n) => this.moveNodes(t, n),
    finish_working_on_nodes: (t, n) => this.finishWorkingOnNodes(t, n),
    export: (t, n) => this.export(t, n),
    export_combined_pdf: (t, n) => this.exportCombinedPdf(t, n),
  };
  dispatchToolCall = (t, n, o) => {
    const r = this.toolHandlers[n];
    if (!r)
      return {
        content: [{ type: "text", text: `Unknown tool: ${n}` }],
        isError: !0,
      };
    console.log(`[mcp-tool-call]: ${n}`, { args: o });
    let i;
    return Promise.race([
      r(t, o),
      new Promise((s) => {
        i = window.setTimeout(() => {
          (Me({
            event: "mcp__toolcall_timeout",
            properties: { name: n, args: o },
          }),
            s({
              content: [
                {
                  type: "text",
                  text: "Tool call timed out. Please check your file then try again.",
                },
              ],
              isError: !0,
            }));
        }, sl);
      }),
    ]).finally(() => {
      window.clearTimeout(i);
    });
  };
  toToolResult = (t) => {
    const n = [];
    return (
      this.__internalEditorState &&
        this.editorState.fileState.isFileSizeAtLimit &&
        n.push({
          type: "text",
          text: "Warning: Your file is too large. Further changes will result in data loss. Please start a new file.",
        }),
      "content" in t
        ? { ...t, content: [...n, ...t.content] }
        : "error" in t
          ? { content: [...n, { type: "text", text: t.error }], isError: !0 }
          : "data" in t
            ? {
                content: [
                  ...n,
                  { type: "text", text: JSON.stringify(t.data, null, 2) },
                ],
              }
            : {
                content: [
                  ...n,
                  { type: "text", text: "Unexpected result format" },
                ],
                isError: !0,
              }
    );
  };
  transactionWithoutUndo = (t) =>
    this.editorState.undoManager.withoutUndo(() => ho(t));
  gatedMCPToolCall = async (t, n) => {
    return t();
  };
  getBasicInfo = () => {
    const { editorState: t } = this,
      {
        pageState: n,
        treeUtils: o,
        fileState: r,
        fontState: i,
        tokenState: s,
      } = t,
      a = this.root.teamState.getResource(r.data.id)?.name ?? null,
      l = o.artboards,
      c = l.length > He,
      d = c ? l.slice(0, He) : l,
      u = o.rootNode.descendants.length + 1,
      h = i.documentFamilies,
      f = s
        .getAllTokensSorted()
        .map((m) => ({
          name: s.getCssName(m, { prefix: !1 }),
          value: s.getCssValue(m, { prefix: !1 }),
        }));
    return {
      data: {
        fileName: a,
        pageName: n.activePage.label,
        pageId: n.activePageId,
        url: `${ft.MAIN_APP}/file/${r.data.id}/${n.activePageId}`,
        rootNodeId: o.rootNode.id,
        nodeCount: u,
        artboardCount: l.length,
        artboards: d.map((m) => ({
          id: m.id,
          name: m.label,
          childCount: m.children.length,
          width: m.width,
          height: m.height,
          top: m.styles.top,
          left: m.styles.left,
        })),
        pages: n.pageList.map((m) => ({
          id: m.id,
          name: m.label,
          isActive: m.id === n.activePageId,
        })),
        truncated: c || void 0,
        truncatedMessage: c
          ? `Showing first ${He} of ${l.length} artboards`
          : void 0,
        fontFamilies: h,
        contentHash: this.contentHash,
        tokens: { items: f },
      },
    };
  };
  parseFileId = (t) => {
    let n = t.trim();
    try {
      n.includes("://") && (n = new URL(n).pathname);
    } catch {}
    const o = n.match(/(?:^|\/)file\/([^/?#]+)/);
    return o && o[1]
      ? o[1]
      : (n.replace(/^\/+|\/+$/g, "").split(/[\/?#]/)[0] ?? n);
  };
  openFile = (t, n) =>
    this.gatedMCPToolCall(
      async () => {
        const o = this.parseFileId(n.fileId);
        if (!o)
          throw new J("Could not parse a file ID from the provided value");
        if (this.__internalEditorState?.fileState.data.id === o)
          return this.getBasicInfo();
        const r = this.__internalEditorState?.socketState ?? null;
        if ((await fo(this.root, o)).outcome === "not_found") {
          const s = Object.values(this.root.socketCollection.sockets).find(
            (a) => a.fileId === o,
          );
          throw (
            s && this.root.socketCollection.unregisterSocket(s),
            new J(`File not found: ${o}`)
          );
        }
        return (
          r && this.root.socketCollection.unregisterSocket(r),
          mo(`/file/${o}`),
          await pt(() => this.__internalEditorState?.fileState.data.id === o, {
            timeout: 1e4,
          }),
          this.getBasicInfo()
        );
      },
      { type: "open" },
    );
  listFiles = (t, n) =>
    this.gatedMCPToolCall(
      async () => {
        this.root.teamState.hasData || (await go(this.root));
        const o = this.root.authState.activeTeamId;
        if (!o) return { error: "No active team found." };
        const r = this.root.teamState.teams[o],
          i = this.root.teamState.getResources(o);
        if (!r || !i)
          return {
            error: `Team data for "${o}" is not available. Try again in a moment.`,
          };
        const s = n.limit ?? rl,
          a = [];
        for (const d of Object.values(i.resources))
          d.type !== yo.File ||
            d.archived ||
            a.push({
              id: d.id,
              name: d.name,
              updatedAt: d.updatedAt,
              createdAt: d.createdAt,
            });
        a.sort((d, u) => u.updatedAt - d.updatedAt);
        const l = a.length > s,
          c = l ? a.slice(0, s) : a;
        return {
          data: {
            teamId: r.id,
            teamName: r.name,
            files: c,
            count: a.length,
            truncated: l || void 0,
            truncatedMessage: l
              ? `Showing first ${s} of ${a.length} files. Pass a larger limit (up to 200) to see more.`
              : void 0,
          },
        };
      },
      { type: "read" },
    );
  createFile = (t, n) =>
    this.gatedMCPToolCall(
      async () => {
        const o = await bo(this.root, {
          cloneFileId: n.cloneFileId,
          fileName: n.name,
        });
        if (!o.success) throw new J(o.error.message);
        return {
          data: { fileId: o.value, url: `${ft.MAIN_APP}/file/${o.value}` },
        };
      },
      { type: "write" },
    );
  openPage = (t, n) =>
    this.gatedMCPToolCall(
      () => {
        const { pageState: o } = this.editorState;
        return o.getPage(n.pageId)
          ? (o.setActivePage(n.pageId), this.getBasicInfo())
          : {
              error: `Page not found: "${n.pageId}". Use get_basic_info to list the pages in the currently open file.`,
            };
      },
      { type: "open" },
    );
  createPage = (t, n) =>
    this.gatedMCPToolCall(
      () => {
        const { pageState: o } = this.editorState,
          r = this.transactionWithoutUndo(() => {
            const i = o.addPage(!1);
            return (n.name && o.setPageLabel(i.id, n.name), i);
          });
        return {
          data: { contentHash: this.contentHash, pageId: r.id, name: r.label },
        };
      },
      { type: "write" },
    );
  getSelection = (t) =>
    this.gatedMCPToolCall(
      () => {
        const { selectionState: n } = this.editorState,
          o = n.selectedNodes,
          r = o.length > Le,
          i = r ? o.slice(0, Le) : o;
        return (
          i.length > 0 &&
            this.recordAgentRead(
              t,
              i.map((s) => s.id),
            ),
          {
            data: {
              contentHash: this.contentHash,
              selectedNodes: i.map((s) => ({
                id: s.id,
                name: s.label,
                component: s.component,
                width: s.width,
                height: s.height,
                artboardId: s.artboardFrame?.id ?? null,
                artboardName: s.artboardFrame?.label ?? null,
                parentId: s.parent?.isRoot ? null : (s.parent?.id ?? null),
                childCount: s.children.length,
              })),
              count: o.length,
              truncated: r || void 0,
              truncatedMessage: r
                ? `Showing first ${Le} of ${o.length} selected nodes`
                : void 0,
            },
          }
        );
      },
      { type: "read" },
    );
  getTokens = (t, n) =>
    this.gatedMCPToolCall(
      () => {
        const { tokenState: o } = this.editorState,
          r = n.format ?? "json",
          i = n.types && n.types.length > 0 ? new Set(n.types) : null,
          s = n.namePattern
            ? new RegExp(
                `^${n.namePattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`,
                "i",
              )
            : null,
          a = o.getAllTokensSorted().filter((c) => {
            if (i && !i.has(c.type)) return !1;
            if (s) {
              const d = o.getCssName(c, { prefix: !1 });
              if (!s.test(d)) return !1;
            }
            return !0;
          });
        if (r === "css")
          return {
            data: mt(a, { editorState: this.editorState, format: "css" }),
          };
        if (r === "tailwind")
          return {
            data: mt(a, {
              editorState: this.editorState,
              format: "tailwind",
              resolveNamespacedAliases: !1,
            }),
          };
        const l = a.map((c) => ({
          name: o.getCssName(c, { prefix: !1 }),
          type: c.type,
          value: o.getCssValue(c, { prefix: !1 }),
          ...(c.description !== void 0 ? { description: c.description } : {}),
        }));
        return { data: { contentHash: this.contentHash, tokens: l } };
      },
      { type: "read" },
    );
  createTokens = (t, n) =>
    this.gatedMCPToolCall(
      () => {
        const { tokenState: o } = this.editorState,
          r = [];
        return (
          this.transactionWithoutUndo(() => {
            n.tokens.forEach((i) => {
              const s = o.create({ ...i, name: i.name.replace(/^--/, "") });
              r.push(Qt(s, o));
            });
          }),
          {
            data: { tokens: r, count: r.length, contentHash: this.contentHash },
          }
        );
      },
      { type: "write" },
    );
  setTokens = (t, n) =>
    this.gatedMCPToolCall(
      () => {
        const { tokenState: o } = this.editorState,
          r = [];
        return (
          this.transactionWithoutUndo(() => {
            n.tokens.forEach((i) => {
              const s = o.getTokenFromCssName(i.name);
              if (!s) {
                r.push({
                  result: "error",
                  message: `Token not found: "${i.name}". No token has that CSS variable name.`,
                });
                return;
              }
              const a = i.delete
                ? o.delete({ id: s.id })
                : o.update({
                    id: s.id,
                    name: i.newName?.replace(/^--/, ""),
                    value: i.value,
                    description: i.description,
                  });
              r.push(Qt(a, o));
            });
          }),
          {
            data: { tokens: r, count: r.length, contentHash: this.contentHash },
          }
        );
      },
      { type: "write" },
    );
  getNodeInfo = (t, n) => {
    const { nodeId: o } = n;
    return this.gatedMCPToolCall(
      () => {
        const r = this.editorState.treeUtils.getNode(o);
        if (!r)
          return {
            error: `Node not found: "${o}". The node may have been deleted or the ID is incorrect. Use get_tree_summary or get_children to discover valid node IDs.`,
          };
        const i = r.children,
          s = i.length > se,
          a = s ? i.slice(0, se) : i;
        return (
          this.recordAgentRead(t, [o]),
          {
            data: {
              contentHash: this.contentHash,
              id: r.id,
              name: r.label,
              component: r.component,
              width: r.width,
              height: r.height,
              isVisible: r.isVisible,
              isLocked: r.isLocked,
              parentId: r.parent?.isRoot ? null : (r.parent?.id ?? null),
              childIds: a.map((l) => l.id),
              childCount: i.length,
              artboardId: r.artboardFrame?.id ?? null,
              textContent: r.component === "Text" ? r.textValue : null,
              truncated: s || void 0,
              truncatedMessage: s
                ? `Showing first ${se} of ${i.length} child IDs`
                : void 0,
            },
          }
        );
      },
      { type: "read" },
    );
  };
  getChildren = (t, n) => {
    const { nodeId: o } = n;
    return this.gatedMCPToolCall(
      () => {
        const r = this.editorState.treeUtils.getNode(o);
        if (!r)
          return {
            error: `Node not found: "${o}". The node may have been deleted or the ID is incorrect. Use get_tree_summary or get_selection to discover valid node IDs.`,
          };
        const i = r.children,
          s = i.length > se,
          a = s ? i.slice(0, se) : i;
        return (
          this.recordAgentRead(t, [o]),
          {
            data: {
              contentHash: this.contentHash,
              children: a.map((l) => ({
                id: l.id,
                name: l.label,
                component: l.component,
                childCount: l.children.length,
              })),
              count: i.length,
              truncated: s || void 0,
              truncatedMessage: s
                ? `Showing first ${se} of ${i.length} children`
                : void 0,
            },
          }
        );
      },
      { type: "read" },
    );
  };
  getTreeSummary = (t, n) => {
    const { nodeId: o, depth: r = 3 } = n;
    return this.gatedMCPToolCall(
      () => {
        const i = this.editorState.treeUtils.getNode(o);
        if (!i)
          return {
            error: `Node not found: "${o}". The node may have been deleted or the ID is incorrect. Use get_selection to find selected nodes, or get_children on an artboard to explore the hierarchy.`,
          };
        const s = Math.min(Math.max(r, 1), 10),
          a = 1e3;
        let l = 0,
          c = !1;
        const d = (h, f) => {
            if (c) return "";
            if ((l++, l > a)) return ((c = !0), "");
            const m = "  ".repeat(f),
              y = `${Math.round(h.width)}×${Math.round(h.height)}`,
              k =
                h.component === "Text" && h.textValue
                  ? ` "${h.textValue.slice(0, 60)}"`
                  : "",
              T = h.isVisible ? "" : " [hidden]",
              E = `${m}${h.component} "${h.label}" (${h.id}) ${y}${k}${T}`;
            if (f >= s || h.children.length === 0) {
              const v =
                h.children.length > 0
                  ? `
${m}  ... ${h.children.length} children`
                  : "";
              return E + v;
            }
            const w = h.children.map((v) => d(v, f + 1)).filter(Boolean).join(`
`);
            return w
              ? `${E}
${w}`
              : E;
          },
          u = d(i, 0);
        return (
          this.recordAgentRead(t, [o]),
          {
            data: {
              contentHash: this.contentHash,
              summary: u,
              nodeId: i.id,
              depth: s,
              truncated: c || void 0,
              truncatedMessage: c ? `Output truncated at ${a} nodes` : void 0,
            },
          }
        );
      },
      { type: "read" },
    );
  };
  getScreenshot = async (t, n) => {
    const { nodeId: o, transparent: r = !1, scale: i = 1 } = n;
    return this.gatedMCPToolCall(
      async () => {
        const s = this.editorState.treeUtils.getNode(o);
        if (!s || !s.domEl) return { content: [] };
        const a = i >= 2 ? 2 : 1,
          c = (
            await Promise.all(
              [s, ...s.descendants].map((u) => {
                const h = u.properties.fill?.value || [];
                for (let f = h.length - 1; f >= 0; f--) {
                  const m = h[f];
                  if (!(!m || m.type !== vo.Image || !m.isVisible))
                    return this.editorState.imageState.isSettled(
                      m.imageId,
                      5e3,
                    );
                }
              }),
            )
          ).some((u) => u === !1),
          d = _o();
        try {
          const u = await wo(s, a),
            h = to(u, r ? "png" : "jpeg");
          this.recordAgentRead(t, [o]);
          const f = {
            content: [{ type: "image", data: h.base64, mimeType: h.mimeType }],
          };
          return (
            h.wasResized &&
              f.content.push({
                type: "text",
                text: `Note: Image was resized to ${h.width}x${h.height}px to fit size limits.`,
              }),
            c &&
              f.content.push({
                type: "text",
                text: "Note: Some images did not finish loading before the screenshot was taken.",
              }),
            f
          );
        } catch (u) {
          return (
            console.error("[MCPHandlers] Failed to capture screenshot:", u),
            { content: [] }
          );
        } finally {
          d();
        }
      },
      { type: "read" },
    );
  };
  getJSX = async (t, n) => {
    const { nodeId: o, format: r = "tailwind" } = n;
    return this.gatedMCPToolCall(
      async () => {
        const i = this.editorState.treeUtils.getNode(o);
        if (!i) return { error: `Node not found: ${o}` };
        try {
          let s;
          const a = {
            includeNodeIds: !1,
            includeRootPositioning: !1,
            includeCommentHeader: !1,
          };
          return (
            r === "inline-styles"
              ? (s = await So([i], a))
              : (s = await ko(this.editorState, [i], a)),
            this.recordAgentRead(t, [o]),
            { data: { jsx: s ?? "", contentHash: this.contentHash } }
          );
        } catch (s) {
          const a = s instanceof Error ? s.message : String(s);
          return (
            console.error("[MCPHandlers] Failed to generate JSX:", s),
            { error: `JSX generation failed: ${a}` }
          );
        }
      },
      { type: "read" },
    );
  };
  getComputedStyles = (t, n) => {
    const { nodeIds: o } = n;
    return this.gatedMCPToolCall(
      () => {
        const r = {};
        for (const i of o) {
          const s = this.editorState.treeUtils.getNode(i);
          if (!s) {
            r[i] = null;
            continue;
          }
          const a = {},
            l = s.computeStyleData();
          for (const [c, d] of Object.entries(l.styles))
            d != null && (a[c] = d);
          r[i] = a;
        }
        return (
          this.recordAgentRead(t, o),
          { data: { styles: r, contentHash: this.contentHash } }
        );
      },
      { type: "read" },
    );
  };
  getFillImage = async (t, n) => {
    const { nodeId: o } = n;
    return this.gatedMCPToolCall(
      async () => {
        const r = this.editorState.treeUtils.getNode(o);
        if (!r)
          return {
            content: [
              {
                type: "text",
                text: `Node not found: "${o}". The node may have been deleted or the ID is incorrect. Use get_tree_summary or get_children to discover valid node IDs.`,
              },
            ],
            isError: !0,
          };
        const i = r.properties.fill?.primaryImage?.srcOriginalQuality;
        if (!i)
          return {
            content: [
              {
                type: "text",
                text: `Node "${o}" exists but does not have an image fill.`,
              },
            ],
          };
        try {
          const a = await (await fetch(i)).blob(),
            l = await Xc(a);
          return (
            this.recordAgentRead(t, [o]),
            {
              content: [
                { type: "image", data: l.base64, mimeType: l.mimeType },
                {
                  type: "text",
                  text: JSON.stringify({
                    originalUrl: i,
                    mimeType: l.mimeType,
                    width: l.width,
                    height: l.height,
                    ...(l.wasResized
                      ? { note: "Image was resized to fit size limits." }
                      : {}),
                  }),
                },
              ],
            }
          );
        } catch (s) {
          return (
            console.error("[MCPHandlers] Failed to fetch image:", s),
            {
              content: [
                {
                  type: "text",
                  text: `Failed to fetch image from node "${o}". The image URL may be expired or inaccessible.`,
                },
              ],
              isError: !0,
            }
          );
        }
      },
      { type: "read" },
    );
  };
  createArtboard = (t, n) => {
    const { name: o, styles: r } = n;
    return this.gatedMCPToolCall(
      () => {
        const { editorState: i } = this,
          { treeUtils: s } = i,
          a = s.rootNode,
          l = a.children.filter((m) => !m.isSoftDeleted).length === 0,
          c = { width: Yt(r.width) ?? 1440, height: Yt(r.height) ?? 900 },
          d = this.editorState.cameraState.currentViewableAreaWorld,
          u = a.children.map((m) => m.aabb),
          h = gt(d, u, c, Xt);
        ((r.left = `${h.x}px`),
          (r.top = `${h.y}px`),
          (r.display ??= "flex"),
          (r.flexDirection ??= "column"));
        const f = this.transactionWithoutUndo(() => {
          const m = s.createNode("Frame", a);
          if (m)
            return (
              (m.data.label = o),
              (m.data.labelIsModified = !0),
              m.properties.width.set(c.width),
              m.properties.height.set(c.height),
              r && m.applyCss(r),
              Io.afterDraw(i, m, { skipReparent: !0 }),
              this.recordAgentWrite(t, [m.id], "write"),
              m
            );
        });
        return f
          ? (l &&
              this.editorState.cameraState.zoomToFit(
                xo.fromPoints([
                  { x: h.x, y: h.y },
                  { x: h.x + c.width, y: h.y + c.height },
                ]),
                50,
                1,
                1,
              ),
            {
              data: {
                contentHash: this.contentHash,
                id: f.id,
                name: f.label,
                top: f.yInWorld,
                left: f.xInWorld,
                width: f.width,
                height: f.height,
              },
            })
          : { error: "Failed to create artboard" };
      },
      { type: "write" },
    );
  };
  deleteNodes = (t, n) => {
    const { nodeIds: o } = n;
    return this.gatedMCPToolCall(
      () => {
        const { treeUtils: r } = this.editorState;
        for (const i of o) {
          const s = r.getNode(i);
          if (!s) return { error: `Node not found: ${i}` };
          if (s.isRoot) return { error: "Cannot delete the root node" };
        }
        return (
          this.recordAgentWrite(t, o, "delete"),
          this.transactionWithoutUndo(() => {
            r.deleteNodes(o);
          }),
          { data: { contentHash: this.contentHash, deletedNodeIds: o } }
        );
      },
      { type: "write" },
    );
  };
  setTextContent = (t, n) => {
    const { updates: o } = n;
    return this.gatedMCPToolCall(
      () => {
        if (!o.length) return { error: "No updates provided" };
        const r = [],
          i = [];
        this.transactionWithoutUndo(() => {
          for (const { nodeId: a, textContent: l } of o) {
            const c = this.editorState.treeUtils.getNode(a);
            if (!c) {
              i.push({ nodeId: a, error: `Node not found: ${a}` });
              continue;
            }
            if (c.component !== "Text") {
              i.push({
                nodeId: a,
                error: `Node "${c.label}" is a ${c.component}, not a Text node`,
              });
              continue;
            }
            (c.setTextValue(l), r.push({ nodeId: a, textContent: l }));
          }
        });
        const s = r.map((a) => a.nodeId);
        return (
          this.recordAgentWrite(t, s, "edit"),
          {
            data: {
              contentHash: this.contentHash,
              updates: r,
              ...(i.length ? { errors: i } : {}),
            },
          }
        );
      },
      { type: "write" },
    );
  };
  updateStyles = (t, n) => {
    const { updates: o } = n;
    return this.gatedMCPToolCall(
      () => {
        if (!o.length) return { error: "No updates provided" };
        const r = [],
          i = [];
        this.transactionWithoutUndo(() => {
          for (const { nodeIds: a, styles: l } of o)
            for (const c of a) {
              const d = this.editorState.treeUtils.getNode(c);
              if (!d) {
                i.push({ nodeId: c, error: `Node not found: ${c}` });
                continue;
              }
              (d.applyCss(l), r.push({ nodeId: c }));
            }
        });
        const s = r.map((a) => a.nodeId);
        return (
          this.recordAgentWrite(t, s, "edit"),
          {
            data: {
              contentHash: this.contentHash,
              updates: r,
              ...(i.length ? { errors: i } : {}),
            },
          }
        );
      },
      { type: "write" },
    );
  };
  writeHTML = async (t, n) => {
    const { html: o, targetNodeId: r, mode: i } = n;
    return this.gatedMCPToolCall(
      async () => {
        const { editorState: s } = this,
          { treeUtils: a } = s,
          l = a.getNode(r);
        if (!l) return { error: `Node not found: ${r}` };
        if (i === "replace" && l.isRoot)
          return { error: "Cannot replace the root node" };
        if (
          i === "insert-children" &&
          l.canHaveHTMLChildren === !1 &&
          l.isSVG === !1
        )
          return {
            error: `Node "${l.label}" (${l.component}) cannot have children`,
          };
        let c;
        try {
          c = await To(o, { editorState: s });
        } catch (u) {
          const h = u instanceof Error ? u.message : String(u);
          return (
            console.error("[MCPHandlers] Failed to parse HTML:", u),
            { error: `HTML parsing failed: ${h}` }
          );
        }
        if (c.length === 0) return { error: "HTML produced no design nodes" };
        const d = [];
        if (
          (Me({
            event: "mcp__write_html",
            properties: { mode: i, html: o, targetNodeId: r },
          }),
          i === "insert-children")
        )
          this.transactionWithoutUndo(() => {
            const { all: u } = yt(c, { editorState: s, parentId: r });
            for (const f of u) d.push(f.id);
            const h = a.getNode(r);
            (bt(h), this.recordAgentWrite(t, d, "write"));
          });
        else if (i === "replace") {
          const u = l.parent?.id ?? a.rootNode.id,
            h = l.previousSibling?.sortKey ?? null,
            f = l.nextSibling?.sortKey ?? null,
            m = l.xInWorld,
            y = l.yInWorld,
            k = a.getNode(u),
            T = k?.isFreeformParent ?? !1;
          this.transactionWithoutUndo(() => {
            a.deleteNodes([r]);
            const E = vt(c.length, h, f);
            for (let w = 0; w < c.length; w++) {
              const v = c[w],
                x = a.addNode(v.node, u, E[w], !1),
                { all: S } = yt(v.children, { editorState: s, parentId: x.id });
              (d.push(x.id, ...S.map((A) => A.id)), T && x.setPosInWorld(m, y));
            }
            (bt(k), this.recordAgentWrite(t, d, "write"));
          });
        }
        return {
          data: {
            contentHash: this.contentHash,
            createdNodes: d.map((u) => {
              const h = a.getNode(u);
              return {
                id: u,
                name: h?.label ?? "",
                component: h?.component ?? "",
              };
            }),
          },
        };
      },
      { type: "write" },
    );
  };
  renameNodes = (t, n) => {
    const { updates: o } = n;
    return this.gatedMCPToolCall(
      () => {
        if (!o.length) return { error: "No updates provided" };
        const r = [],
          i = [];
        this.transactionWithoutUndo(() => {
          for (const { nodeId: a, name: l } of o) {
            const c = this.editorState.treeUtils.getNode(a);
            if (!c) {
              i.push({ nodeId: a, error: `Node not found: ${a}` });
              continue;
            }
            (c.setLabel(l), r.push({ nodeId: a, name: c.label }));
          }
        });
        const s = r.map((a) => a.nodeId);
        return (
          this.recordAgentWrite(t, s, "edit"),
          {
            data: {
              contentHash: this.contentHash,
              updates: r,
              ...(i.length ? { errors: i } : {}),
            },
          }
        );
      },
      { type: "write" },
    );
  };
  duplicateNodes = (t, n) => {
    const { nodes: o } = n;
    return this.gatedMCPToolCall(
      () => {
        if (!o.length) return { error: "No node IDs provided" };
        const { treeUtils: r } = this.editorState,
          i = [];
        for (let s = 0; s < o.length; s++) {
          const { id: a, parentId: l } = o[s],
            c = r.getNode(a);
          if (!c) return { error: `Node not found: ${a}` };
          if (c.isRoot) return { error: "Cannot duplicate the root node" };
          i.push({ source: c, parentId: l, inputIndex: s });
        }
        return (
          this.transactionWithoutUndo(() => {
            for (const c of i) c.clone = r.cloneNode(c.source, c.parentId, !1);
            const s = i.filter((c) => c.source.isArtboard && c.clone);
            if (s.length > 0) {
              const c = this.editorState.cameraState.currentViewableAreaWorld,
                d = new Set(s.map((h) => h.clone.id)),
                u = r.rootNode.children
                  .filter((h) => !d.has(h.id))
                  .map((h) => h.aabb);
              for (const h of s) {
                const f = h.source,
                  m = h.clone,
                  y = { width: f.width, height: f.height },
                  k = gt(c, u, y, Xt, f.aabb);
                (m.setPosInWorld(k.x, k.y),
                  u.push({
                    minX: k.x,
                    minY: k.y,
                    maxX: k.x + y.width,
                    maxY: k.y + y.height,
                    width: y.width,
                    height: y.height,
                  }));
              }
            }
            const a = new Map();
            for (const c of i) {
              const d = c.parentId ?? c.source.parentId;
              let u = a.get(d);
              (u || ((u = []), a.set(d, u)), u.push(c));
            }
            for (const c of a.values()) {
              if (c.length < 2) continue;
              c.sort((T, E) => {
                const w = T.source.indexOfNodeInParent,
                  v = E.source.indexOfNodeInParent;
                return w !== v ? w - v : T.inputIndex - E.inputIndex;
              });
              const d = c.map((T) => T.clone),
                u = new Set(d.map((T) => T.id)),
                h = c[c.length - 1].source;
              let f = h.nextSibling;
              for (; f && u.has(f.id); ) f = f.nextSibling;
              const m = h.sortKey,
                y = f?.sortKey ?? null,
                k = vt(d.length, m, y);
              for (let T = 0; T < d.length; T++)
                r.moveNodeWithinParent(d[T], void 0, k[T]);
            }
            const l = i.filter((c) => c.clone).map((c) => c.clone.id);
            this.recordAgentWrite(t, l, "write");
          }),
          {
            data: {
              contentHash: this.contentHash,
              duplicatedNodes: i.map(({ source: s, clone: a }) => {
                const l = a,
                  c = {},
                  d = [[s, l]];
                for (; d.length > 0; ) {
                  const [u, h] = d.pop(),
                    f = Math.min(u.children.length, h.children.length);
                  for (let m = 0; m < f; m++) {
                    const y = u.children[m],
                      k = h.children[m];
                    ((c[y.id] = k.id), d.push([y, k]));
                  }
                }
                return {
                  sourceId: s.id,
                  newId: l.id,
                  name: l.label,
                  component: l.component,
                  descendantIdMap: c,
                };
              }),
            },
          }
        );
      },
      { type: "write" },
    );
  };
  moveNodes = (t, n) => {
    const { moves: o } = n;
    return this.gatedMCPToolCall(
      () => {
        const { treeUtils: r } = this.editorState,
          i = [],
          s = [],
          a = new Set();
        this.transactionWithoutUndo(() => {
          for (const d of o) {
            const { nodeId: u } = d,
              h = r.getNode(u);
            if (!h) {
              s.push({ nodeId: u, error: `Node not found: ${u}` });
              continue;
            }
            if (h.isRoot) {
              s.push({ nodeId: u, error: "Cannot move the root node" });
              continue;
            }
            let f,
              m = null,
              y = null;
            if ("before" in d || "after" in d) {
              const w = "before" in d ? d.before : d.after,
                v = r.getNode(w);
              if (!v) {
                s.push({ nodeId: u, error: `Sibling not found: ${w}` });
                continue;
              }
              if (v.id === h.id) {
                s.push({
                  nodeId: u,
                  error: "Sibling cannot be the moved node itself",
                });
                continue;
              }
              if (!v.parent) {
                s.push({
                  nodeId: u,
                  error: `Sibling "${w}" has no parent (is it the root?)`,
                });
                continue;
              }
              f = v.parent;
              const x = f.children.filter((A) => A.id !== h.id),
                S = x.indexOf(v);
              "before" in d
                ? ((m = x[S - 1]?.sortKey ?? null), (y = v.sortKey))
                : ((m = v.sortKey), (y = x[S + 1]?.sortKey ?? null));
            } else {
              const w = d.parentId === "root" ? r.rootNode.id : d.parentId;
              if (((f = r.getNode(w)), !f)) {
                s.push({
                  nodeId: u,
                  error: `Target parent not found: ${d.parentId}`,
                });
                continue;
              }
              const v = f.children.filter((x) => x.id !== h.id);
              if (d.index !== void 0) {
                const x = Math.max(0, Math.min(d.index, v.length));
                ((m = v[x - 1]?.sortKey ?? null), (y = v[x]?.sortKey ?? null));
              } else ((m = v[v.length - 1]?.sortKey ?? null), (y = null));
            }
            if (f.canHaveHTMLChildren === !1 && f.isSVG === !1) {
              s.push({
                nodeId: u,
                error: `Target parent "${f.label}" (${f.component}) cannot have children`,
              });
              continue;
            }
            if (f === h || f.ancestors.includes(h)) {
              s.push({
                nodeId: u,
                error:
                  "Cannot move node under itself or one of its descendants",
              });
              continue;
            }
            const k = h.parentId,
              T = f.id === k;
            if (T) {
              const w = h.previousSibling?.sortKey ?? null,
                v = h.nextSibling?.sortKey ?? null;
              if (m === w && y === v) {
                i.push({
                  nodeId: u,
                  parentId: f.id,
                  index: h.indexOfNodeInParent,
                });
                continue;
              }
            }
            const E = zo(m, y);
            (T
              ? r.moveNodeWithinParent(h, void 0, E)
              : r.moveNodeToNewParent(h, f, E),
              a.add(f.id),
              k && k !== f.id && a.add(k),
              i.push({
                nodeId: u,
                parentId: f.id,
                index: h.indexOfNodeInParent,
              }));
          }
        });
        const l = i.map((d) => d.nodeId);
        this.recordAgentWrite(t, l, "edit");
        const c = [];
        for (const d of a) {
          const u = r.getNode(d);
          u && c.push({ parentId: d, childIds: u.children.map((h) => h.id) });
        }
        return {
          data: {
            contentHash: this.contentHash,
            moves: i,
            ...(c.length ? { affectedParents: c } : {}),
            ...(s.length ? { errors: s } : {}),
          },
        };
      },
      { type: "write" },
    );
  };
  getGuide = (t) => ({ content: [{ type: "text", text: hc(t.topic) }] });
  getFontFamilyInfo = async (t, n) => {
    const { familyNames: o } = n;
    return this.gatedMCPToolCall(
      async () => {
        const { editorState: r } = this,
          { fontState: i } = r,
          s = [],
          a = [];
        for (const d of o) {
          const u = i.createFamily(d);
          (await u?.waitUntilReady,
            u?.isEmpty
              ? a.push(`Font family "${d}" is not available.`)
              : s.push(u));
        }
        const l = {};
        for (const d of s)
          d?.fonts &&
            (l[d.name] = d.fonts.map((u) => {
              const h = {
                style: u.style,
                weight: u.weight,
                isItalic: u.isItalic,
              };
              return (
                u.width !== void 0 && (h.width = u.width),
                u.axes !== void 0 && (h.axes = _t(u.axes)),
                u.coordinates !== void 0 && (h.coordinates = _t(u.coordinates)),
                h
              );
            }));
        const c = { data: { contentHash: this.contentHash } };
        return (
          a.length && (c.data.errors = a),
          Object.keys(l).length && (c.data.fontsPerFamily = l),
          c
        );
      },
      { type: "read" },
    );
  };
  export = async (t, n) =>
    this.gatedMCPToolCall(
      async () => {
        const { nodes: o, type: r = "image" } = n;
        let i;
        if (o === "nodes-with-exports-only") {
          const u = this.editorState.treeUtils.rootNode.descendants.filter(
            (h) => {
              const f =
                r === "image" ? h.imageExportEntries : h.videoExportEntries;
              return f && f.length > 0;
            },
          );
          if (u.length === 0)
            return {
              error:
                "Nothing found to export. Add export settings to nodes first or ask the agent to export specific elements.",
            };
          i = wt(u, r);
        } else {
          i = [];
          for (const [d, u] of Object.entries(o)) {
            const h = this.editorState.treeUtils.getNode(d);
            if (!h)
              return {
                error: `Node not found: "${d}". The node may have been deleted or the ID is incorrect. Use get_tree_summary or get_children to discover valid node IDs.`,
              };
            if (!u || u.length === 0) i.push(...wt([h], r));
            else
              for (const f of u)
                r === "video"
                  ? i.push({
                      node: h,
                      entry: {
                        format: f.format,
                        scale: f.scale,
                        suffix: St(f.scale),
                        duration: f.durationSeconds,
                      },
                    })
                  : i.push({
                      node: h,
                      entry: {
                        format: f.format,
                        scale: f.scale,
                        suffix: St(f.scale),
                        quality: f.pdfQuality,
                        resampling: f.pdfResampling,
                      },
                    });
          }
        }
        this.recordAgentRead(
          t,
          i.map((d) => d.node.id),
        );
        let s;
        r === "image" ? (s = await Po(i)) : (s = await $o(i));
        const a = [],
          l = [];
        for (const d of s)
          "error" in d
            ? l.push({ nodeId: d.nodeId, error: d.error })
            : a.push({ nodeId: d.nodeId, filePath: d.filePath ?? "" });
        return {
          data: {
            contentHash: this.contentHash,
            exports: a,
            errors: l.length > 0 ? l : void 0,
          },
        };
      },
      { type: "read" },
    );
  exportCombinedPdf = async (t, n) =>
    this.gatedMCPToolCall(
      async () => {
        const { nodeIds: o } = n,
          r = [];
        for (const c of o) {
          const d = this.editorState.treeUtils.getNode(c);
          if (!d)
            return {
              error: `Node not found: "${c}". The node may have been deleted or the ID is incorrect. Use get_tree_summary or get_children to discover valid node IDs.`,
            };
          r.push(d);
        }
        this.recordAgentRead(t, o);
        const i = await Co(r),
          s = [],
          a = [];
        for (const c of i)
          "error" in c
            ? a.push({ nodeId: c.nodeId, error: c.error })
            : s.push({ nodeId: c.nodeId, filePath: c.filePath ?? "" });
        return {
          data: {
            contentHash: this.contentHash,
            exports: s,
            errors: a.length > 0 ? a : void 0,
          },
        };
      },
      { type: "read" },
    );
  recordAgentRead = (t, n) => {
    t &&
      (this.editorState.agentState.recordActivity(t, n, "read"),
      this.editorState.agentState.startRevealAnimation(n, "read"));
  };
  recordAgentWrite = (t, n, o) => {
    t &&
      (this.editorState.agentState.recordActivity(t, n, "write"),
      this.editorState.agentState.startRevealAnimation(
        n,
        o,
        o === "write" || o === "edit",
      ));
  };
  finishWorkingOnNodes = (t, n) => (
    t && this.editorState.agentState.finishWorking(t, n.nodeIds),
    { data: "OK" }
  );
  removeAgent = (t) => {
    this.editorState.agentState.removeAgent(t);
  };
  mcpLog = (t, n = "log") => {
    console[n](t);
  };
}
function Qt(e, t) {
  return e.result === "error"
    ? { result: "error", message: e.message }
    : e.result === "deleted"
      ? {
          name: t.getCssName({ name: e.name }, { prefix: !1 }),
          result: "deleted",
        }
      : {
          name: t.getCssName({ name: e.name }, { prefix: !1 }),
          result: e.result,
        };
}
export { al as MCPHandlers };

//# chunkId=019eced5-9986-79b1-ae68-909218ab9d3c
