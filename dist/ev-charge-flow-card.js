var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ??= r6.getPropertyOptions(t4), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ??= [])[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 ||= !a2(r6) || r6 !== this._$AH[n5], r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/util.ts
function stateNum(hass, entityId) {
  if (!entityId) return void 0;
  const st = hass.states[entityId];
  if (!st) return void 0;
  const v2 = parseFloat(st.state);
  return Number.isFinite(v2) ? v2 : void 0;
}
function stateWatts(hass, entityId) {
  if (!entityId) return void 0;
  const st = hass.states[entityId];
  if (!st) return void 0;
  const v2 = parseFloat(st.state);
  if (!Number.isFinite(v2)) return void 0;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "kw") return v2 * 1e3;
  return v2;
}
function resolveNumberOrEntityRaw(hass, value, fallback) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const v2 = stateNum(hass, value);
    if (v2 !== void 0) return v2;
  }
  return fallback;
}
function resolveNumberOrEntity(hass, value, fallback) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const fromEntity = stateWatts(hass, value);
    if (fromEntity !== void 0) return fromEntity;
  }
  return fallback;
}
function clamp(v2, lo, hi) {
  return Math.min(hi, Math.max(lo, v2));
}
function stateKwh(hass, entityId) {
  if (!entityId) return void 0;
  const st = hass.states[entityId];
  if (!st) return void 0;
  const v2 = parseFloat(st.state);
  if (!Number.isFinite(v2)) return void 0;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "wh") return v2 / 1e3;
  return v2;
}
function stateSeconds(hass, entityId) {
  if (!entityId) return void 0;
  const st = hass.states[entityId];
  if (!st) return void 0;
  const v2 = parseFloat(st.state);
  if (!Number.isFinite(v2)) return void 0;
  const unit = (st.attributes.unit_of_measurement || "").toLowerCase();
  if (unit === "ms") return v2 / 1e3;
  if (unit === "min") return v2 * 60;
  if (unit === "h") return v2 * 3600;
  return v2;
}
function formatDuration(totalSeconds) {
  const s4 = Math.max(0, Math.round(totalSeconds));
  const hh = Math.floor(s4 / 3600);
  const mm = Math.floor(s4 % 3600 / 60);
  const ss = s4 % 60;
  const pad = (n5) => String(n5).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}
var CURRENCY_SYMBOLS = {
  EUR: "\u20AC",
  USD: "$",
  GBP: "\xA3",
  CHF: "CHF"
};
function currencySymbol(hass) {
  const code = hass.config?.currency;
  if (code && CURRENCY_SYMBOLS[code]) return CURRENCY_SYMBOLS[code];
  return code ?? "\u20AC";
}
var CURRENCY_ICONS = {
  EUR: "mdi:currency-eur",
  USD: "mdi:currency-usd",
  GBP: "mdi:currency-gbp",
  JPY: "mdi:currency-jpy"
};
function currencyIcon(hass) {
  const code = hass.config?.currency;
  return code && CURRENCY_ICONS[code] || "mdi:cash";
}

// src/modules/gauge-ring.ts
var RING_R = 120;
var OVERLAY_R = 150;
var OVERLAY_BOX = OVERLAY_R * 2;
var OVERLAY_CENTER = OVERLAY_R;
function polar(r6, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: OVERLAY_CENTER + r6 * Math.cos(rad), y: OVERLAY_CENTER + r6 * Math.sin(rad) };
}
var EcfGaugeRing = class extends i4 {
  constructor() {
    super(...arguments);
    this.entities = {};
    this.config = { type: "gauge" };
  }
  /** Builds the tail-faded conic-gradient for one of the two animated (power) rings.
   * `spinsClockwise` decides which end is the "head" (sharp, no fade):
   * for a clockwise sweep the head is at the *end* of the arc (higher
   * angle), for a counter-clockwise sweep it's the opposite — the fade
   * must always land on the tail, never the head, regardless of direction. */
  static gradient(arcDeg, fadeDeg, dark, bright, spinsClockwise) {
    const a3 = arcDeg.toFixed(1);
    const f3 = fadeDeg.toFixed(1);
    const mid = (arcDeg / 2).toFixed(1);
    if (spinsClockwise) {
      return `conic-gradient(from 0deg,transparent 0deg,${dark} ${f3}deg,${bright} ${mid}deg,${dark} ${a3}deg,transparent ${a3}deg,transparent 360deg)`;
    }
    return `conic-gradient(from 0deg,${dark} 0deg,${bright} ${mid}deg,${dark} ${(arcDeg - fadeDeg).toFixed(1)}deg,transparent ${a3}deg,transparent 360deg)`;
  }
  /** The 10%-step tick marks around the SOC ring, like a clock face. */
  static ticks() {
    const r1 = RING_R;
    const r22 = RING_R + 9;
    return Array.from({ length: 10 }, (_2, i5) => i5 * 36).map((deg) => {
      const a3 = polar(r1, deg);
      const b3 = polar(r22, deg);
      return w`<line
        x1=${a3.x}
        y1=${a3.y}
        x2=${b3.x}
        y2=${b3.y}
        stroke="rgba(255,255,255,0.45)"
        stroke-width="1.5"
      />`;
    });
  }
  /** The bold tick marking the car's preset charge-limit, if configured. */
  static limitMarker(limitPct) {
    const deg = clamp(limitPct, 0, 100) * 3.6;
    const a3 = polar(RING_R - 17, deg);
    const b3 = polar(RING_R + 13, deg);
    return w`<line
      x1=${a3.x}
      y1=${a3.y}
      x2=${b3.x}
      y2=${b3.y}
      stroke="#ffd600"
      stroke-width="4"
      stroke-linecap="round"
    />`;
  }
  /** The pointer + label at the current SOC value. The label sits right
   * before the arrow (counter-clockwise of it) and tangent to the ring, so
   * it reads along the curve instead of overlapping the arrow. */
  static socPointer(socPct) {
    const deg = clamp(socPct, 0, 100) * 3.6;
    const tip = polar(RING_R - 2, deg);
    const baseL = polar(RING_R + 14, deg - 5);
    const baseR = polar(RING_R + 14, deg + 5);
    const labelAngle = ((deg - 8) % 360 + 360) % 360;
    const labelPt = polar(RING_R + 7, labelAngle);
    const flip = labelAngle > 90 && labelAngle < 270;
    const rotation = flip ? labelAngle + 180 : labelAngle;
    const anchor = flip ? "start" : "end";
    return w`
      <polygon
        points="${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}"
        fill="#ffffff"
        stroke="#1c1c1c"
        stroke-width="0.75"
      />
      <text
        x=${labelPt.x}
        y=${labelPt.y}
        dy="4"
        text-anchor=${anchor}
        transform="rotate(${rotation} ${labelPt.x} ${labelPt.y})"
        font-size="15"
        font-weight="700"
        fill="#ffffff"
      >
        ${socPct.toFixed(0)}%
      </text>
    `;
  }
  render() {
    if (!this.hass) return A;
    const e5 = this.entities;
    const p3 = stateWatts(this.hass, e5.wallbox_power);
    const pb = stateWatts(this.hass, e5.battery_power);
    const soc = stateNum(this.hass, e5.battery_soc);
    const maxP = resolveNumberOrEntity(this.hass, e5.wallbox_max, 7400);
    const chargeLimit = resolveNumberOrEntityRaw(this.hass, e5.charge_limit, void 0);
    const hasWallbox = p3 !== void 0 && maxP > 0;
    const hasBattery = pb !== void 0 && maxP > 0;
    const hasSoc = soc !== void 0;
    const fracWallbox = hasWallbox ? clamp(p3 / maxP, 0, 1) : 0;
    const fracBattery = hasBattery ? clamp(pb / maxP, 0, 1) : 0;
    const arcWallbox = fracWallbox * 360;
    const arcBattery = fracBattery * 360;
    const fadeWallbox = Math.min(arcWallbox / 3, 30);
    const fadeBattery = Math.min(arcBattery / 3, 30);
    const isActive = hasWallbox && p3 > 0 || hasBattery && pb > 0;
    const sharedFrac = hasWallbox ? fracWallbox : fracBattery;
    const sharedDuration = isActive ? 8 - 7.4 * sharedFrac : 999;
    const wallboxGradient = EcfGaugeRing.gradient(arcWallbox, fadeWallbox, "#e65100", "#ffb74d", true);
    const batteryGradient = EcfGaugeRing.gradient(arcBattery, fadeBattery, "#f57f17", "#ffee58", true);
    const arcSoc = hasSoc ? clamp(soc / 100, 0, 1) * 360 : 0;
    const socGradient = hasSoc ? `conic-gradient(from 0deg,#66bb6a 0deg,#66bb6a ${arcSoc.toFixed(1)}deg,rgba(255, 255, 255, 0.1) ${arcSoc.toFixed(1)}deg,rgba(255, 255, 255, 0.1) 360deg)` : "transparent";
    const resa = hasWallbox && hasBattery && p3 > 0 ? Math.round(pb / p3 * 100) : void 0;
    const style = `
      --ecf-soc-gradient: ${socGradient};
      --ecf-wallbox-gradient: ${wallboxGradient};
      --ecf-battery-gradient: ${batteryGradient};
      --ecf-wallbox-duration: ${sharedDuration}s;
      --ecf-battery-duration: ${sharedDuration}s;
    `;
    return b2`
      <div class="ring-wrap">
        <div class="ring" style=${style}>
          <div class="ring-layer ring-soc"></div>
          <div class="ring-layer ring-wallbox"></div>
          <div class="ring-layer ring-battery"></div>
          <div class="label">
            ${soc !== void 0 ? b2`<div class="soc">${soc.toFixed(0)}%</div>` : A}
            ${hasBattery ? b2`<div class="battery">${(pb / 1e3).toFixed(2)} kW</div>` : A}
            ${hasWallbox ? b2`<div class="wallbox">
                  ${(p3 / 1e3).toFixed(2)} kW${resa !== void 0 ? b2` · ${resa}%` : A}
                </div>` : A}
          </div>
        </div>
        ${hasSoc ? w`
              <svg class="overlay" viewBox="0 0 ${OVERLAY_BOX} ${OVERLAY_BOX}">
                ${EcfGaugeRing.ticks()}
                ${chargeLimit !== void 0 ? EcfGaugeRing.limitMarker(chargeLimit) : A}
                ${EcfGaugeRing.socPointer(soc)}
              </svg>
            ` : A}
      </div>
    `;
  }
};
EcfGaugeRing.styles = i`
    :host {
      display: flex;
      justify-content: center;
      padding: 8px 0;
    }
    .ring-wrap {
      position: relative;
      width: ${OVERLAY_BOX}px;
      height: ${OVERLAY_BOX}px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ring {
      position: relative;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: var(--ecf-bg, #1c1c1c);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .ring-layer {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .ring-soc {
      background: var(--ecf-soc-gradient);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px));
      z-index: 0;
    }
    .ring-wallbox {
      background: var(--ecf-wallbox-gradient);
      -webkit-mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 34px),
        #000 calc(100% - 34px),
        #000 calc(100% - 20px),
        transparent calc(100% - 20px)
      );
      mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 34px),
        #000 calc(100% - 34px),
        #000 calc(100% - 20px),
        transparent calc(100% - 20px)
      );
      animation: ecf-spin var(--ecf-wallbox-duration, 999s) linear infinite;
      z-index: 1;
    }
    .ring-battery {
      background: var(--ecf-battery-gradient);
      -webkit-mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 54px),
        #000 calc(100% - 54px),
        #000 calc(100% - 40px),
        transparent calc(100% - 40px)
      );
      mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 54px),
        #000 calc(100% - 54px),
        #000 calc(100% - 40px),
        transparent calc(100% - 40px)
      );
      animation: ecf-spin var(--ecf-battery-duration, 999s) linear infinite;
      z-index: 2;
    }
    @keyframes ecf-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .label {
      position: relative;
      z-index: 3;
      text-align: center;
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }
    .soc {
      font-size: 26px;
      font-weight: bold;
      color: var(--ecf-soc-color, #ffffff);
      line-height: 1.2;
    }
    .battery {
      font-size: 26px;
      font-weight: bold;
      color: var(--ecf-battery-text, #66bb6a);
      line-height: 1.2;
    }
    .wallbox {
      font-size: 15px;
      font-weight: bold;
      color: var(--ecf-wallbox-text, #ff9800);
      line-height: 1.2;
      margin-top: 2px;
    }
  `;
__decorateClass([
  n4({ attribute: false })
], EcfGaugeRing.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], EcfGaugeRing.prototype, "entities", 2);
__decorateClass([
  n4({ attribute: false })
], EcfGaugeRing.prototype, "config", 2);
EcfGaugeRing = __decorateClass([
  t3("ecf-gauge-ring")
], EcfGaugeRing);

// src/modules/stats-grid.ts
var EcfStatsGrid = class extends i4 {
  constructor() {
    super(...arguments);
    this.entities = {};
    this.config = { type: "stats" };
  }
  _tile(icon, value, label) {
    return b2`
      <div class="tile">
        <ha-icon icon=${icon}></ha-icon>
        <div class="value">${value}</div>
        <div class="label">${label}</div>
      </div>
    `;
  }
  render() {
    if (!this.hass) return A;
    const e5 = this.entities;
    const energyKwh = stateKwh(this.hass, e5.session_energy);
    const seconds = stateSeconds(this.hass, e5.session_time);
    let cost = stateNum(this.hass, e5.session_cost);
    if (cost === void 0 && energyKwh !== void 0 && e5.energy_cost_per_kwh !== void 0) {
      const price = resolveNumberOrEntityRaw(this.hass, e5.energy_cost_per_kwh);
      if (price !== void 0) cost = energyKwh * price;
    }
    const tiles = [
      energyKwh !== void 0 ? this._tile("mdi:lightning-bolt-outline", `${energyKwh.toFixed(2)} kWh`, "Energia") : A,
      seconds !== void 0 ? this._tile("mdi:timer-outline", formatDuration(seconds), "Tempo") : A,
      cost !== void 0 ? this._tile(currencyIcon(this.hass), `${cost.toFixed(2)} ${currencySymbol(this.hass)}`, "Costo") : A
    ].filter((t4) => t4 !== A);
    if (tiles.length === 0) return A;
    return b2`<div class="grid">${tiles}</div>`;
  }
};
EcfStatsGrid.styles = i`
    :host {
      display: block;
    }
    .grid {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: 8px;
      padding: 0 8px 8px;
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 2px;
    }
    ha-icon {
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }
    .value {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .label {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
  `;
__decorateClass([
  n4({ attribute: false })
], EcfStatsGrid.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], EcfStatsGrid.prototype, "entities", 2);
__decorateClass([
  n4({ attribute: false })
], EcfStatsGrid.prototype, "config", 2);
EcfStatsGrid = __decorateClass([
  t3("ecf-stats-grid")
], EcfStatsGrid);

// src/modules/energy-flow.ts
var EcfEnergyFlow = class extends i4 {
  constructor() {
    super(...arguments);
    this.entities = {};
    this.config = { type: "energy_flow" };
  }
  static pct(x2, y3) {
    return {
      left: `${x2 / EcfEnergyFlow.BOX_W * 100}%`,
      top: `${y3 / EcfEnergyFlow.BOX_H * 100}%`
    };
  }
  _node(icon, watts, label, x2, y3) {
    const { left, top } = EcfEnergyFlow.pct(x2, y3);
    return b2`
      <div class="node" style="left:${left};top:${top}">
        <ha-icon icon=${icon}></ha-icon>
        <div class="value">${(watts / 1e3).toFixed(2)} kW</div>
        <div class="label">${label}</div>
      </div>
    `;
  }
  _line(x1, y1, x2, y22, watts, maxW, reverse) {
    const frac = clamp(Math.abs(watts) / maxW, 0, 1);
    const flowing = Math.abs(watts) > 0;
    const dur = flowing ? 3 - 2.5 * frac : 999;
    const style = flowing ? `animation: ecf-flow-dash ${dur}s linear infinite; animation-direction: ${reverse ? "reverse" : "normal"};` : "";
    return w`<line x1=${x1} y1=${y1} x2=${x2} y2=${y22} style=${style}></line>`;
  }
  render() {
    if (!this.hass) return A;
    const e5 = this.entities;
    const wallboxW = stateWatts(this.hass, e5.wallbox_power);
    if (wallboxW === void 0) return A;
    const maxW = resolveNumberOrEntity(this.hass, e5.wallbox_max, 7400);
    const sources = [];
    const solarW = stateWatts(this.hass, e5.solar_power);
    if (solarW !== void 0) sources.push({ icon: "mdi:solar-power", label: "Solare", watts: solarW, reverse: false });
    const gridW = stateWatts(this.hass, e5.grid_power);
    if (gridW !== void 0) sources.push({ icon: "mdi:transmission-tower", label: "Rete", watts: gridW, reverse: false });
    const battW = stateWatts(this.hass, e5.home_battery_power);
    if (battW !== void 0)
      sources.push({
        icon: "mdi:home-battery",
        label: "Batteria casa",
        watts: battW,
        reverse: battW < 0
        // negative = charging: dashes flow into it, not out of it
      });
    if (sources.length === 0) {
      return b2`
        <div class="wrap">
          ${this._node("mdi:car-electric", wallboxW, "Auto", EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y)}
        </div>
      `;
    }
    const n5 = sources.length;
    const ys = sources.map((_2, i5) => (i5 + 1) / (n5 + 1) * EcfEnergyFlow.BOX_H);
    return b2`
      <div class="wrap">
        <svg viewBox="0 0 ${EcfEnergyFlow.BOX_W} ${EcfEnergyFlow.BOX_H}">
          ${sources.map(
      (s4, i5) => this._line(EcfEnergyFlow.LEFT_X, ys[i5], EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y, s4.watts, maxW, s4.reverse)
    )}
        </svg>
        ${sources.map((s4, i5) => this._node(s4.icon, s4.watts, s4.label, EcfEnergyFlow.LEFT_X, ys[i5]))}
        ${this._node("mdi:car-electric", wallboxW, "Auto", EcfEnergyFlow.RIGHT_X, EcfEnergyFlow.RIGHT_Y)}
      </div>
    `;
  }
};
EcfEnergyFlow.styles = i`
    :host {
      display: block;
    }
    .wrap {
      position: relative;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
      aspect-ratio: 240 / 200;
    }
    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    line {
      stroke: var(--ecf-flow-line-color, #555);
      stroke-width: 2;
      stroke-dasharray: 6 6;
    }
    @keyframes ecf-flow-dash {
      to {
        stroke-dashoffset: -24;
      }
    }
    .node {
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1px;
      width: 64px;
    }
    .node ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .node .value {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .node .label {
      font-size: 10px;
      color: var(--secondary-text-color);
    }
  `;
EcfEnergyFlow.BOX_W = 240;
EcfEnergyFlow.BOX_H = 200;
EcfEnergyFlow.LEFT_X = 40;
EcfEnergyFlow.RIGHT_X = 200;
EcfEnergyFlow.RIGHT_Y = 100;
__decorateClass([
  n4({ attribute: false })
], EcfEnergyFlow.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], EcfEnergyFlow.prototype, "entities", 2);
__decorateClass([
  n4({ attribute: false })
], EcfEnergyFlow.prototype, "config", 2);
EcfEnergyFlow = __decorateClass([
  t3("ecf-energy-flow")
], EcfEnergyFlow);

// src/editor.ts
var ENTITY_FIELDS = [
  { key: "wallbox_power", label: "Potenza wallbox" },
  { key: "wallbox_max", label: "Potenza massima wallbox (W, o id entit\xE0)", numberOrEntity: true },
  { key: "battery_power", label: "Potenza alla batteria" },
  { key: "battery_soc", label: "Percentuale batteria" },
  {
    key: "charge_limit",
    label: "Limite di ricarica preimpostato (%, o id entit\xE0)",
    numberOrEntity: true
  },
  { key: "session_energy", label: "Energia sessione" },
  { key: "session_time", label: "Tempo sessione" },
  { key: "session_cost", label: "Costo sessione (se gi\xE0 calcolato)" },
  { key: "energy_cost_per_kwh", label: "Prezzo per kWh (numero, o id entit\xE0)", numberOrEntity: true },
  { key: "grid_power", label: "Potenza rete", hint: "per il flusso energia" },
  { key: "solar_power", label: "Potenza fotovoltaico", hint: "per il flusso energia" },
  { key: "home_battery_power", label: "Potenza batteria di casa", hint: "per il flusso energia" }
];
var MODULE_LABELS = {
  gauge: "Quadrante rotante",
  stats: "Statistiche (energia / tempo / costo)",
  energy_flow: "Flusso energia",
  controls: "Comandi (non ancora attivo)"
};
var ALL_MODULE_TYPES = ["gauge", "stats", "energy_flow", "controls"];
function fireConfigChanged(el, config) {
  el.dispatchEvent(
    new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })
  );
}
function withAllModuleTypes(modules) {
  const list = modules ? [...modules] : [];
  const present = new Set(list.map((m2) => m2.type));
  for (const type of ALL_MODULE_TYPES) {
    if (!present.has(type)) list.push({ type, enabled: false });
  }
  return list;
}
var EvChargeFlowCardEditor = class extends i4 {
  setConfig(config) {
    this._config = config;
  }
  _entityChanged(key, value) {
    const entities = { ...this._config.entities, [key]: value === "" ? void 0 : value };
    fireConfigChanged(this, { ...this._config, entities });
  }
  _numberOrEntityChanged(key, raw) {
    let value = raw.trim() === "" ? void 0 : raw.trim();
    if (typeof value === "string") {
      const n5 = Number(value);
      if (Number.isFinite(n5) && value !== "") value = n5;
    }
    const entities = { ...this._config.entities, [key]: value };
    fireConfigChanged(this, { ...this._config, entities });
  }
  _toggleModule(index, modules) {
    const next = modules.map((m2, i5) => i5 === index ? { ...m2, enabled: !(m2.enabled !== false) } : m2);
    fireConfigChanged(this, { ...this._config, modules: next });
  }
  _moveModule(index, delta, modules) {
    const target = index + delta;
    if (target < 0 || target >= modules.length) return;
    const next = [...modules];
    [next[index], next[target]] = [next[target], next[index]];
    fireConfigChanged(this, { ...this._config, modules: next });
  }
  render() {
    if (!this._config || !this.hass) return A;
    const entities = this._config.entities ?? {};
    const modules = withAllModuleTypes(this._config.modules);
    return b2`
      <div class="section">Entità</div>
      ${ENTITY_FIELDS.map(
      (f3) => f3.numberOrEntity ? b2`
              <ha-textfield
                .label=${f3.label}
                .value=${String(entities[f3.key] ?? "")}
                @change=${(e5) => this._numberOrEntityChanged(f3.key, e5.target.value)}
              ></ha-textfield>
            ` : b2`
              ${f3.hint ? b2`<div class="hint">${f3.hint}</div>` : A}
              <ha-entity-picker
                .hass=${this.hass}
                .label=${f3.label}
                .value=${entities[f3.key] ?? ""}
                allow-custom-entity
                @value-changed=${(e5) => this._entityChanged(f3.key, e5.detail.value)}
              ></ha-entity-picker>
            `
    )}

      <div class="section">Moduli</div>
      ${modules.map(
      (m2, i5) => b2`
          <div class="module-row">
            <ha-icon-button
              .disabled=${i5 === 0}
              .path=${"M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"}
              @click=${() => this._moveModule(i5, -1, modules)}
            ></ha-icon-button>
            <ha-icon-button
              .disabled=${i5 === modules.length - 1}
              .path=${"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"}
              @click=${() => this._moveModule(i5, 1, modules)}
            ></ha-icon-button>
            <span class="module-name">${MODULE_LABELS[m2.type]}</span>
            <ha-switch
              .checked=${m2.enabled !== false}
              @change=${() => this._toggleModule(i5, modules)}
            ></ha-switch>
          </div>
        `
    )}
    `;
  }
};
EvChargeFlowCardEditor.styles = i`
    :host {
      display: block;
    }
    .section {
      margin: 16px 0 8px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: -4px 0 6px;
    }
    ha-entity-picker,
    ha-textfield {
      display: block;
      margin-bottom: 8px;
    }
    .module-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #444);
    }
    .module-name {
      flex: 1;
    }
    .module-row ha-icon-button {
      --mdc-icon-button-size: 32px;
    }
  `;
__decorateClass([
  n4({ attribute: false })
], EvChargeFlowCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], EvChargeFlowCardEditor.prototype, "_config", 2);
EvChargeFlowCardEditor = __decorateClass([
  t3("ev-charge-flow-card-editor")
], EvChargeFlowCardEditor);

// src/types.ts
var DEFAULT_MODULES = [
  { type: "gauge", enabled: true },
  { type: "energy_flow", enabled: true },
  { type: "stats", enabled: true },
  { type: "controls", enabled: false }
];

// src/ev-charge-flow-card.ts
var CARD_TAG = "ev-charge-flow-card";
var CARD_VERSION = "0.7.1";
var EvChargeFlowCard = class extends i4 {
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("ev-charge-flow-card: configurazione non valida");
    }
    if (config.modules !== void 0 && !Array.isArray(config.modules)) {
      throw new Error("ev-charge-flow-card: 'modules' deve essere un elenco");
    }
    this._config = {
      ...config,
      entities: config.entities ?? {},
      modules: config.modules ?? DEFAULT_MODULES
    };
  }
  getCardSize() {
    const enabled = (this._config?.modules ?? []).filter((m2) => m2.enabled !== false);
    return Math.max(1, enabled.length * 2);
  }
  static getConfigElement() {
    return document.createElement("ev-charge-flow-card-editor");
  }
  static getStubConfig() {
    return { type: `custom:${CARD_TAG}`, entities: {}, modules: DEFAULT_MODULES };
  }
  _renderModule(m2) {
    if (m2.enabled === false) return A;
    switch (m2.type) {
      case "gauge":
        return b2`<ecf-gauge-ring
          .hass=${this.hass}
          .entities=${this._config.entities}
          .config=${m2}
        ></ecf-gauge-ring>`;
      case "stats":
        return b2`<ecf-stats-grid
          .hass=${this.hass}
          .entities=${this._config.entities}
          .config=${m2}
        ></ecf-stats-grid>`;
      case "energy_flow":
        return b2`<ecf-energy-flow
          .hass=${this.hass}
          .entities=${this._config.entities}
          .config=${m2}
        ></ecf-energy-flow>`;
      // 'controls' lands in a later phase.
      default:
        return A;
    }
  }
  render() {
    if (!this._config || !this.hass) return A;
    return b2`
      <ha-card>
        <div class="modules">
          ${(this._config.modules ?? []).map((m2) => this._renderModule(m2))}
        </div>
      </ha-card>
    `;
  }
  static {
    this.styles = i`
    :host {
      display: block;
    }
    .modules {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }
  `;
  }
};
__decorateClass([
  n4({ attribute: false })
], EvChargeFlowCard.prototype, "hass", 2);
__decorateClass([
  r5()
], EvChargeFlowCard.prototype, "_config", 2);
customElements.define(CARD_TAG, EvChargeFlowCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "EV Charge Flow Card",
  description: "Rotating power gauge + energy flow for EV charging (wallbox + car)."
});
console.info(
  `%c EV-CHARGE-FLOW-CARD %c v${CARD_VERSION} `,
  "color: white; background: #1b5e20; font-weight: 700;",
  "color: #1b5e20; background: white; font-weight: 700;"
);
export {
  EvChargeFlowCard
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
