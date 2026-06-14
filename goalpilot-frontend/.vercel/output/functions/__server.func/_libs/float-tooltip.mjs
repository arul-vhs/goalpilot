import { i as index$1 } from "./kapsule.mjs";
import { t, W, R } from "./preact.mjs";
import { s as select, p as pointer } from "./d3-selection.mjs";
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _defineProperty(e, r, t2) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t2,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t2, e;
}
function _iterableToArrayLimit(r, l) {
  var t2 = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t2) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t2 = t2.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t2)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t2.return && (u = t2.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t2 = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t2.push.apply(t2, o);
  }
  return t2;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t2), true).forEach(function(r2) {
      _defineProperty(e, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t2, r) {
  if ("object" != typeof t2 || !t2) return t2;
  var e = t2[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t2, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t2);
}
function _toPropertyKey(t2) {
  var i = _toPrimitive(t2, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t2 = {}.toString.call(r).slice(8, -1);
    return "Object" === t2 && r.constructor && (t2 = r.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r, a) : void 0;
  }
}
var _reactElement2VNode = function reactElement2VNode(el) {
  if (!(_typeof(el) === "object")) return el;
  var res = W(el);
  if (res.props) {
    var _res$props;
    res.props = _objectSpread2({}, res.props);
    if (res !== null && res !== void 0 && (_res$props = res.props) !== null && _res$props !== void 0 && _res$props.children) {
      res.props.children = Array.isArray(res.props.children) ? res.props.children.map(_reactElement2VNode) : _reactElement2VNode(res.props.children);
    }
  }
  return res;
};
var isReactRenderable = function isReactRenderable2(o) {
  return t(W(o));
};
var render = function render2(jsx, domEl) {
  delete domEl.__k;
  R(_reactElement2VNode(jsx), domEl);
};
function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (typeof document === "undefined") {
    return;
  }
  var head = document.head || document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  style.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}
var css_248z = ".float-tooltip-kap {\n  position: absolute;\n  width: max-content; /* prevent shrinking near right edge */\n  max-width: max(50%, 150px);\n  padding: 3px 5px;\n  border-radius: 3px;\n  font: 12px sans-serif;\n  color: #eee;\n  background: rgba(0,0,0,0.6);\n  pointer-events: none;\n}\n";
styleInject(css_248z);
var index = index$1({
  props: {
    content: {
      "default": false
    },
    offsetX: {
      triggerUpdate: false
    },
    // null or number
    offsetY: {
      triggerUpdate: false
    }
    // null or number
  },
  init: function init(domNode, state) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style;
    var isD3Selection = !!domNode && _typeof(domNode) === "object" && !!domNode.node && typeof domNode.node === "function";
    var el = select(isD3Selection ? domNode.node() : domNode);
    el.style("position") === "static" && el.style("position", "relative");
    state.tooltipEl = el.append("div").attr("class", "float-tooltip-kap");
    Object.entries(style).forEach(function(_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2), k = _ref3[0], v = _ref3[1];
      return state.tooltipEl.style(k, v);
    });
    state.tooltipEl.style("left", "-10000px").style("display", "none");
    var evSuffix = "tooltip-".concat(Math.round(Math.random() * 1e12));
    state.mouseInside = false;
    el.on("mousemove.".concat(evSuffix), function(ev) {
      state.mouseInside = true;
      var mousePos = pointer(ev);
      var domNode2 = el.node();
      var canvasWidth = domNode2.offsetWidth;
      var canvasHeight = domNode2.offsetHeight;
      var translate = [state.offsetX === null || state.offsetX === void 0 ? "-".concat(mousePos[0] / canvasWidth * 100, "%") : typeof state.offsetX === "number" ? "calc(-50% + ".concat(state.offsetX, "px)") : state.offsetX, state.offsetY === null || state.offsetY === void 0 ? canvasHeight > 130 && canvasHeight - mousePos[1] < 100 ? "calc(-100% - 6px)" : "21px" : typeof state.offsetY === "number" ? state.offsetY < 0 ? "calc(-100% - ".concat(Math.abs(state.offsetY), "px)") : "".concat(state.offsetY, "px") : state.offsetY];
      state.tooltipEl.style("left", mousePos[0] + "px").style("top", mousePos[1] + "px").style("transform", "translate(".concat(translate.join(","), ")"));
      state.content && state.tooltipEl.style("display", "inline");
    });
    el.on("mouseover.".concat(evSuffix), function() {
      state.mouseInside = true;
      state.content && state.tooltipEl.style("display", "inline");
    });
    el.on("mouseout.".concat(evSuffix), function() {
      state.mouseInside = false;
      state.tooltipEl.style("display", "none");
    });
  },
  update: function update(state) {
    state.tooltipEl.style("display", !!state.content && state.mouseInside ? "inline" : "none");
    if (!state.content) {
      state.tooltipEl.text("");
    } else if (state.content instanceof HTMLElement) {
      state.tooltipEl.text("");
      state.tooltipEl.append(function() {
        return state.content;
      });
    } else if (typeof state.content === "string") {
      state.tooltipEl.html(state.content);
    } else if (isReactRenderable(state.content)) {
      state.tooltipEl.text("");
      render(state.content, state.tooltipEl.node());
    } else {
      state.tooltipEl.style("display", "none");
      console.warn("Tooltip content is invalid, skipping.", state.content, state.content.toString());
    }
  }
});
export {
  index as i
};
