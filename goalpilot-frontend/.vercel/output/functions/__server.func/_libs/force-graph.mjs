import { t as transform, z as zoom } from "./d3-zoom.mjs";
import { G as Group, T as Tween, E as Easing } from "./tweenjs__tween.js.mjs";
import { i as index } from "./kapsule.mjs";
import { i as index$1 } from "./accessor-fn.mjs";
import { _ as _default } from "./canvas-color-tracker.mjs";
import { i as index$3 } from "./float-tooltip.mjs";
import { B as Bezier } from "./bezier-js.mjs";
import { i as index$2 } from "./index-array-by.mjs";
import { o as ordinal } from "./d3-scale.mjs";
import { s as schemePaired } from "./d3-scale-chromatic.mjs";
import { f as forceRadial, a as forceSimulation, b as forceLink, c as forceManyBody, d as forceCenter } from "./d3-force-3d.mjs";
import { s as select } from "./d3-selection.mjs";
import { a as drag } from "./d3-drag.mjs";
import { s as sum, m as min, a as max } from "./d3-array.mjs";
import { t as throttle } from "./lodash-es.mjs";
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
var css_248z = ".force-graph-container canvas {\n  display: block;\n  user-select: none;\n  outline: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.force-graph-container .clickable {\n  cursor: pointer;\n}\n\n.force-graph-container .grabbable {\n  cursor: move;\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n\n.force-graph-container .grabbable:active {\n  cursor: grabbing;\n  cursor: -moz-grabbing;\n  cursor: -webkit-grabbing;\n}\n";
styleInject(css_248z);
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return p;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function() {
    return !!t;
  })();
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
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
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
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
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
var autoColorScale = ordinal(schemePaired);
function autoColorObjects(objects, colorByAccessor, colorField) {
  if (!colorByAccessor || typeof colorField !== "string") return;
  objects.filter(function(obj) {
    return !obj[colorField];
  }).forEach(function(obj) {
    obj[colorField] = autoColorScale(colorByAccessor(obj));
  });
}
function getDagDepths(_ref, idAccessor) {
  var nodes = _ref.nodes, links = _ref.links;
  var _ref2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref2$nodeFilter = _ref2.nodeFilter, nodeFilter = _ref2$nodeFilter === void 0 ? function() {
    return true;
  } : _ref2$nodeFilter, _ref2$onLoopError = _ref2.onLoopError, onLoopError = _ref2$onLoopError === void 0 ? function(loopIds) {
    throw "Invalid DAG structure! Found cycle in node path: ".concat(loopIds.join(" -> "), ".");
  } : _ref2$onLoopError;
  var graph = {};
  nodes.forEach(function(node) {
    return graph[idAccessor(node)] = {
      data: node,
      out: [],
      depth: -1,
      skip: !nodeFilter(node)
    };
  });
  links.forEach(function(_ref3) {
    var source = _ref3.source, target = _ref3.target;
    var sourceId = getNodeId(source);
    var targetId = getNodeId(target);
    if (!graph.hasOwnProperty(sourceId)) throw "Missing source node with id: ".concat(sourceId);
    if (!graph.hasOwnProperty(targetId)) throw "Missing target node with id: ".concat(targetId);
    var sourceNode = graph[sourceId];
    var targetNode = graph[targetId];
    sourceNode.out.push(targetNode);
    function getNodeId(node) {
      return _typeof(node) === "object" ? idAccessor(node) : node;
    }
  });
  var foundLoops = [];
  traverse(Object.values(graph));
  var nodeDepths = Object.assign.apply(Object, [{}].concat(_toConsumableArray(Object.entries(graph).filter(function(_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2), node = _ref5[1];
    return !node.skip;
  }).map(function(_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2), id = _ref7[0], node = _ref7[1];
    return _defineProperty({}, id, node.depth);
  }))));
  return nodeDepths;
  function traverse(nodes2) {
    var nodeStack = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    var currentDepth = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    var _loop = function _loop2() {
      var node = nodes2[i];
      if (nodeStack.indexOf(node) !== -1) {
        var loop = [].concat(_toConsumableArray(nodeStack.slice(nodeStack.indexOf(node))), [node]).map(function(d) {
          return idAccessor(d.data);
        });
        if (!foundLoops.some(function(foundLoop) {
          return foundLoop.length === loop.length && foundLoop.every(function(id, idx) {
            return id === loop[idx];
          });
        })) {
          foundLoops.push(loop);
          onLoopError(loop);
        }
        return 1;
      }
      if (currentDepth > node.depth) {
        node.depth = currentDepth;
        traverse(node.out, [].concat(_toConsumableArray(nodeStack), [node]), currentDepth + (node.skip ? 0 : 1));
      }
    };
    for (var i = 0, l = nodes2.length; i < l; i++) {
      if (_loop()) continue;
    }
  }
}
var DAG_LEVEL_NODE_RATIO = 2;
var notifyRedraw = function notifyRedraw2(_, state) {
  return state.onNeedsRedraw && state.onNeedsRedraw();
};
var updDataPhotons = function updDataPhotons2(_, state) {
  if (!state.isShadow) {
    var linkParticlesAccessor = index$1(state.linkDirectionalParticles);
    state.graphData.links.forEach(function(link) {
      var numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));
      if (numPhotons) {
        link.__photons = _toConsumableArray(Array(numPhotons)).map(function() {
          return {};
        });
      } else {
        delete link.__photons;
      }
    });
  }
};
var CanvasForceGraph = index({
  props: {
    graphData: {
      "default": {
        nodes: [],
        links: []
      },
      onChange: function onChange(_, state) {
        state.engineRunning = false;
        updDataPhotons(_, state);
      }
    },
    dagMode: {
      onChange: function onChange2(dagMode, state) {
        !dagMode && (state.graphData.nodes || []).forEach(function(n) {
          return n.fx = n.fy = void 0;
        });
      }
    },
    dagLevelDistance: {},
    dagNodeFilter: {
      "default": function _default2(node) {
        return true;
      }
    },
    onDagError: {
      triggerUpdate: false
    },
    nodeRelSize: {
      "default": 4,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    // area per val unit
    nodeId: {
      "default": "id"
    },
    nodeVal: {
      "default": "val",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeColor: {
      "default": "color",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeAutoColorBy: {},
    nodeCanvasObject: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeCanvasObjectMode: {
      "default": function _default3() {
        return "replace";
      },
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeVisibility: {
      "default": true,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkSource: {
      "default": "source"
    },
    linkTarget: {
      "default": "target"
    },
    linkVisibility: {
      "default": true,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkColor: {
      "default": "color",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkAutoColorBy: {},
    linkLineDash: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkWidth: {
      "default": 1,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCurvature: {
      "default": 0,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCanvasObject: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCanvasObjectMode: {
      "default": function _default4() {
        return "replace";
      },
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowLength: {
      "default": 0,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowColor: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowRelPos: {
      "default": 0.5,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    // value between 0<>1 indicating the relative pos along the (exposed) line
    linkDirectionalParticles: {
      "default": 0,
      triggerUpdate: false,
      onChange: updDataPhotons
    },
    // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: {
      "default": 0.01,
      triggerUpdate: false
    },
    // in link length ratio per frame
    linkDirectionalParticleOffset: {
      "default": 0,
      triggerUpdate: false
    },
    // starting position offset along the link's length, like a pre-delay. Values between [0, 1]
    linkDirectionalParticleWidth: {
      "default": 4,
      triggerUpdate: false
    },
    linkDirectionalParticleColor: {
      triggerUpdate: false
    },
    linkDirectionalParticleCanvasObject: {
      triggerUpdate: false
    },
    globalScale: {
      "default": 1,
      triggerUpdate: false
    },
    d3AlphaMin: {
      "default": 0,
      triggerUpdate: false
    },
    d3AlphaDecay: {
      "default": 0.0228,
      triggerUpdate: false,
      onChange: function onChange3(alphaDecay, state) {
        state.forceLayout.alphaDecay(alphaDecay);
      }
    },
    d3AlphaTarget: {
      "default": 0,
      triggerUpdate: false,
      onChange: function onChange4(alphaTarget, state) {
        state.forceLayout.alphaTarget(alphaTarget);
      }
    },
    d3VelocityDecay: {
      "default": 0.4,
      triggerUpdate: false,
      onChange: function onChange5(velocityDecay, state) {
        state.forceLayout.velocityDecay(velocityDecay);
      }
    },
    warmupTicks: {
      "default": 0,
      triggerUpdate: false
    },
    // how many times to tick the force engine at init before starting to render
    cooldownTicks: {
      "default": Infinity,
      triggerUpdate: false
    },
    cooldownTime: {
      "default": 15e3,
      triggerUpdate: false
    },
    // ms
    onUpdate: {
      "default": function _default5() {
      },
      triggerUpdate: false
    },
    onFinishUpdate: {
      "default": function _default6() {
      },
      triggerUpdate: false
    },
    onEngineTick: {
      "default": function _default7() {
      },
      triggerUpdate: false
    },
    onEngineStop: {
      "default": function _default8() {
      },
      triggerUpdate: false
    },
    onNeedsRedraw: {
      triggerUpdate: false
    },
    isShadow: {
      "default": false,
      triggerUpdate: false
    }
  },
  methods: {
    // Expose d3 forces for external manipulation
    d3Force: function d3Force(state, forceName, forceFn) {
      if (forceFn === void 0) {
        return state.forceLayout.force(forceName);
      }
      state.forceLayout.force(forceName, forceFn);
      return this;
    },
    d3ReheatSimulation: function d3ReheatSimulation(state) {
      state.forceLayout.alpha(1);
      this.resetCountdown();
      return this;
    },
    // reset cooldown state
    resetCountdown: function resetCountdown(state) {
      state.cntTicks = 0;
      state.startTickTime = /* @__PURE__ */ new Date();
      state.engineRunning = true;
      return this;
    },
    isEngineRunning: function isEngineRunning(state) {
      return !!state.engineRunning;
    },
    tickFrame: function tickFrame(state) {
      !state.isShadow && layoutTick();
      paintLinks();
      !state.isShadow && paintArrows();
      !state.isShadow && paintPhotons();
      paintNodes();
      return this;
      function layoutTick() {
        if (state.engineRunning) {
          if (++state.cntTicks > state.cooldownTicks || /* @__PURE__ */ new Date() - state.startTickTime > state.cooldownTime || state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin) {
            state.engineRunning = false;
            state.onEngineStop();
          } else {
            state.forceLayout.tick();
            state.onEngineTick();
          }
        }
      }
      function paintNodes() {
        var getVisibility = index$1(state.nodeVisibility);
        var getVal = index$1(state.nodeVal);
        var getColor = index$1(state.nodeColor);
        var getNodeCanvasObjectMode = index$1(state.nodeCanvasObjectMode);
        var ctx = state.ctx;
        var padAmount = state.isShadow / state.globalScale;
        var visibleNodes = state.graphData.nodes.filter(getVisibility);
        ctx.save();
        visibleNodes.forEach(function(node) {
          var nodeCanvasObjectMode = getNodeCanvasObjectMode(node);
          if (state.nodeCanvasObject && (nodeCanvasObjectMode === "before" || nodeCanvasObjectMode === "replace")) {
            state.nodeCanvasObject(node, ctx, state.globalScale);
            if (nodeCanvasObjectMode === "replace") {
              ctx.restore();
              return;
            }
          }
          var r = Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize + padAmount;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = getColor(node) || "rgba(31, 120, 180, 0.92)";
          ctx.fill();
          if (state.nodeCanvasObject && nodeCanvasObjectMode === "after") {
            state.nodeCanvasObject(node, state.ctx, state.globalScale);
          }
        });
        ctx.restore();
      }
      function paintLinks() {
        var getVisibility = index$1(state.linkVisibility);
        var getColor = index$1(state.linkColor);
        var getWidth = index$1(state.linkWidth);
        var getLineDash = index$1(state.linkLineDash);
        var getCurvature = index$1(state.linkCurvature);
        var getLinkCanvasObjectMode = index$1(state.linkCanvasObjectMode);
        var ctx = state.ctx;
        var padAmount = state.isShadow * 2;
        var visibleLinks = state.graphData.links.filter(getVisibility);
        visibleLinks.forEach(calcLinkControlPoints);
        var beforeCustomLinks = [], afterCustomLinks = [], defaultPaintLinks = visibleLinks;
        if (state.linkCanvasObject) {
          var replaceCustomLinks = [], otherCustomLinks = [];
          visibleLinks.forEach(function(d) {
            return ({
              before: beforeCustomLinks,
              after: afterCustomLinks,
              replace: replaceCustomLinks
            }[getLinkCanvasObjectMode(d)] || otherCustomLinks).push(d);
          });
          defaultPaintLinks = [].concat(_toConsumableArray(beforeCustomLinks), afterCustomLinks, otherCustomLinks);
          beforeCustomLinks = beforeCustomLinks.concat(replaceCustomLinks);
        }
        ctx.save();
        beforeCustomLinks.forEach(function(link) {
          return state.linkCanvasObject(link, ctx, state.globalScale);
        });
        ctx.restore();
        var linksPerColor = index$2(defaultPaintLinks, [getColor, getWidth, getLineDash]);
        ctx.save();
        Object.entries(linksPerColor).forEach(function(_ref) {
          var _ref2 = _slicedToArray(_ref, 2), color = _ref2[0], linksPerWidth = _ref2[1];
          var lineColor = !color || color === "undefined" ? "rgba(0,0,0,0.15)" : color;
          Object.entries(linksPerWidth).forEach(function(_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2), width = _ref4[0], linesPerLineDash = _ref4[1];
            var lineWidth = (width || 1) / state.globalScale + padAmount;
            Object.entries(linesPerLineDash).forEach(function(_ref5) {
              var _ref6 = _slicedToArray(_ref5, 2);
              _ref6[0];
              var links = _ref6[1];
              var lineDashSegments = getLineDash(links[0]);
              ctx.beginPath();
              links.forEach(function(link) {
                var start = link.source;
                var end = link.target;
                if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
                ctx.moveTo(start.x, start.y);
                var controlPoints = link.__controlPoints;
                if (!controlPoints) {
                  ctx.lineTo(end.x, end.y);
                } else {
                  ctx[controlPoints.length === 2 ? "quadraticCurveTo" : "bezierCurveTo"].apply(ctx, _toConsumableArray(controlPoints).concat([end.x, end.y]));
                }
              });
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = lineWidth;
              ctx.setLineDash(lineDashSegments || []);
              ctx.stroke();
            });
          });
        });
        ctx.restore();
        ctx.save();
        afterCustomLinks.forEach(function(link) {
          return state.linkCanvasObject(link, ctx, state.globalScale);
        });
        ctx.restore();
        function calcLinkControlPoints(link) {
          var curvature = getCurvature(link);
          if (!curvature) {
            link.__controlPoints = null;
            return;
          }
          var start = link.source;
          var end = link.target;
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var l = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          if (l > 0) {
            var a = Math.atan2(end.y - start.y, end.x - start.x);
            var d = l * curvature;
            var cp = {
              // control point
              x: (start.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
              y: (start.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2)
            };
            link.__controlPoints = [cp.x, cp.y];
          } else {
            var _d = curvature * 70;
            link.__controlPoints = [end.x, end.y - _d, end.x + _d, end.y];
          }
        }
      }
      function paintArrows() {
        var ARROW_WH_RATIO = 1.6;
        var ARROW_VLEN_RATIO = 0.2;
        var getLength = index$1(state.linkDirectionalArrowLength);
        var getRelPos = index$1(state.linkDirectionalArrowRelPos);
        var getVisibility = index$1(state.linkVisibility);
        var getColor = index$1(state.linkDirectionalArrowColor || state.linkColor);
        var getNodeVal = index$1(state.nodeVal);
        var ctx = state.ctx;
        ctx.save();
        state.graphData.links.filter(getVisibility).forEach(function(link) {
          var arrowLength = getLength(link);
          if (!arrowLength || arrowLength < 0) return;
          var start = link.source;
          var end = link.target;
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var startR = Math.sqrt(Math.max(0, getNodeVal(start) || 1)) * state.nodeRelSize;
          var endR = Math.sqrt(Math.max(0, getNodeVal(end) || 1)) * state.nodeRelSize;
          var arrowRelPos = Math.min(1, Math.max(0, getRelPos(link)));
          var arrowColor = getColor(link) || "rgba(0,0,0,0.28)";
          var arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2;
          var bzLine = link.__controlPoints && _construct(Bezier, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y]));
          var getCoordsAlongLine = bzLine ? function(t) {
            return bzLine.get(t);
          } : function(t) {
            return {
              // straight line: interpolate linearly
              x: start.x + (end.x - start.x) * t || 0,
              y: start.y + (end.y - start.y) * t || 0
            };
          };
          var lineLen = bzLine ? bzLine.length() : Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          var posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;
          var arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
          var arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
          var arrowTailVertex = getCoordsAlongLine((posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen);
          var arrowTailAngle = Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(arrowHead.x, arrowHead.y);
          ctx.lineTo(arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle));
          ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y);
          ctx.lineTo(arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle));
          ctx.fillStyle = arrowColor;
          ctx.fill();
        });
        ctx.restore();
      }
      function paintPhotons() {
        var getNumPhotons = index$1(state.linkDirectionalParticles);
        var getSpeed = index$1(state.linkDirectionalParticleSpeed);
        var getOffset = index$1(state.linkDirectionalParticleOffset);
        var getDiameter = index$1(state.linkDirectionalParticleWidth);
        var getVisibility = index$1(state.linkVisibility);
        var getColor = index$1(state.linkDirectionalParticleColor || state.linkColor);
        var ctx = state.ctx;
        ctx.save();
        state.graphData.links.filter(getVisibility).forEach(function(link) {
          var numCyclePhotons = getNumPhotons(link);
          if (!link.hasOwnProperty("__photons") || !link.__photons.length) return;
          var start = link.source;
          var end = link.target;
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var particleSpeed = getSpeed(link);
          var particleOffset = Math.abs(getOffset(link));
          var photons = link.__photons || [];
          var photonR = Math.max(0, getDiameter(link) / 2) / Math.sqrt(state.globalScale);
          var photonColor = getColor(link) || "rgba(0,0,0,0.28)";
          ctx.fillStyle = photonColor;
          var bzLine = link.__controlPoints ? _construct(Bezier, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y])) : null;
          var cyclePhotonIdx = 0;
          var needsCleanup = false;
          photons.forEach(function(photon) {
            var singleHop = !!photon.__singleHop;
            if (!photon.hasOwnProperty("__progressRatio")) {
              photon.__progressRatio = singleHop ? particleSpeed < 0 ? 1 : 0 : (cyclePhotonIdx + particleOffset) / numCyclePhotons;
            }
            !singleHop && cyclePhotonIdx++;
            photon.__progressRatio += particleSpeed;
            if (photon.__progressRatio >= 1 || photon.__progressRatio < 0) {
              if (!singleHop) {
                photon.__progressRatio = photon.__progressRatio % 1;
                photon.__progressRatio < 0 && photon.__progressRatio++;
              } else {
                needsCleanup = true;
                return;
              }
            }
            var photonPosRatio = photon.__progressRatio;
            var coords = bzLine ? bzLine.get(photonPosRatio) : {
              // straight line: interpolate linearly
              x: start.x + (end.x - start.x) * photonPosRatio || 0,
              y: start.y + (end.y - start.y) * photonPosRatio || 0
            };
            if (state.linkDirectionalParticleCanvasObject) {
              state.linkDirectionalParticleCanvasObject(coords.x, coords.y, link, ctx, state.globalScale);
            } else {
              ctx.beginPath();
              ctx.arc(coords.x, coords.y, photonR, 0, 2 * Math.PI, false);
              ctx.fill();
            }
          });
          if (needsCleanup) {
            link.__photons = link.__photons.filter(function(photon) {
              return !photon.__singleHop || photon.__progressRatio <= 1 && photon.__progressRatio >= 0;
            });
          }
        });
        ctx.restore();
      }
    },
    emitParticle: function emitParticle(state, link) {
      if (link) {
        !link.__photons && (link.__photons = []);
        link.__photons.push({
          __singleHop: true
        });
      }
      return this;
    }
  },
  stateInit: function stateInit() {
    return {
      forceLayout: forceSimulation().force("link", forceLink()).force("charge", forceManyBody()).force("center", forceCenter()).force("dagRadial", null).stop(),
      engineRunning: false
    };
  },
  init: function init(canvasCtx, state) {
    state.ctx = canvasCtx;
  },
  update: function update(state, changedProps) {
    state.engineRunning = false;
    state.onUpdate();
    if (state.nodeAutoColorBy !== null) {
      autoColorObjects(state.graphData.nodes, index$1(state.nodeAutoColorBy), state.nodeColor);
    }
    if (state.linkAutoColorBy !== null) {
      autoColorObjects(state.graphData.links, index$1(state.linkAutoColorBy), state.linkColor);
    }
    state.graphData.links.forEach(function(link) {
      link.source = link[state.linkSource];
      link.target = link[state.linkTarget];
    });
    state.forceLayout.stop().alpha(1).nodes(state.graphData.nodes);
    var linkForce = state.forceLayout.force("link");
    if (linkForce) {
      linkForce.id(function(d) {
        return d[state.nodeId];
      }).links(state.graphData.links);
    }
    var nodeDepths = state.dagMode && getDagDepths(state.graphData, function(node) {
      return node[state.nodeId];
    }, {
      nodeFilter: state.dagNodeFilter,
      onLoopError: state.onDagError || void 0
    });
    var maxDepth = Math.max.apply(Math, _toConsumableArray(Object.values(nodeDepths || [])));
    var dagLevelDistance = state.dagLevelDistance || state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO * (["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? 0.7 : 1);
    if (["lr", "rl", "td", "bu"].includes(changedProps.dagMode)) {
      var resetProp = ["lr", "rl"].includes(changedProps.dagMode) ? "fx" : "fy";
      state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
        return delete node[resetProp];
      });
    }
    if (["lr", "rl", "td", "bu"].includes(state.dagMode)) {
      var invert = ["rl", "bu"].includes(state.dagMode);
      var fixFn = function fixFn2(node) {
        return (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
      };
      var _resetProp = ["lr", "rl"].includes(state.dagMode) ? "fx" : "fy";
      state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
        return node[_resetProp] = fixFn(node);
      });
    }
    state.forceLayout.force("dagRadial", ["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? forceRadial(function(node) {
      var nodeDepth = nodeDepths[node[state.nodeId]] || -1;
      return (state.dagMode === "radialin" ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
    }).strength(function(node) {
      return state.dagNodeFilter(node) ? 1 : 0;
    }) : null);
    for (var i = 0; i < state.warmupTicks && !(state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin); i++) {
      state.forceLayout.tick();
    }
    this.resetCountdown();
    state.onFinishUpdate();
  }
});
function linkKapsule(kapsulePropNames, kapsuleType) {
  var propNames = kapsulePropNames instanceof Array ? kapsulePropNames : [kapsulePropNames];
  var dummyK = new kapsuleType();
  dummyK._destructor && dummyK._destructor();
  return {
    linkProp: function linkProp(prop) {
      return {
        "default": dummyK[prop](),
        onChange: function onChange15(v, state) {
          propNames.forEach(function(propName) {
            return state[propName][prop](v);
          });
        },
        triggerUpdate: false
      };
    },
    linkMethod: function linkMethod(method) {
      return function(state) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        var returnVals = [];
        propNames.forEach(function(propName) {
          var kapsuleInstance = state[propName];
          var returnVal = kapsuleInstance[method].apply(kapsuleInstance, args);
          if (returnVal !== kapsuleInstance) {
            returnVals.push(returnVal);
          }
        });
        return returnVals.length ? returnVals[0] : this;
      };
    }
  };
}
var HOVER_CANVAS_THROTTLE_DELAY = 800;
var ZOOM2NODES_FACTOR = 4;
var DRAG_CLICK_TOLERANCE_PX = 5;
var bindFG = linkKapsule("forceGraph", CanvasForceGraph);
var bindBoth = linkKapsule(["forceGraph", "shadowGraph"], CanvasForceGraph);
var linkedProps = Object.assign.apply(Object, _toConsumableArray(["nodeColor", "nodeAutoColorBy", "nodeCanvasObject", "nodeCanvasObjectMode", "linkColor", "linkAutoColorBy", "linkLineDash", "linkWidth", "linkCanvasObject", "linkCanvasObjectMode", "linkDirectionalArrowLength", "linkDirectionalArrowColor", "linkDirectionalArrowRelPos", "linkDirectionalParticles", "linkDirectionalParticleSpeed", "linkDirectionalParticleOffset", "linkDirectionalParticleWidth", "linkDirectionalParticleColor", "linkDirectionalParticleCanvasObject", "dagMode", "dagLevelDistance", "dagNodeFilter", "onDagError", "d3AlphaMin", "d3AlphaDecay", "d3VelocityDecay", "warmupTicks", "cooldownTicks", "cooldownTime", "onEngineTick", "onEngineStop"].map(function(p) {
  return _defineProperty({}, p, bindFG.linkProp(p));
})).concat(_toConsumableArray(["nodeRelSize", "nodeId", "nodeVal", "nodeVisibility", "linkSource", "linkTarget", "linkVisibility", "linkCurvature"].map(function(p) {
  return _defineProperty({}, p, bindBoth.linkProp(p));
}))));
var linkedMethods = Object.assign.apply(Object, _toConsumableArray(["d3Force", "d3ReheatSimulation", "emitParticle"].map(function(p) {
  return _defineProperty({}, p, bindFG.linkMethod(p));
})));
function adjustCanvasSize(state) {
  if (state.canvas) {
    var curWidth = state.canvas.width;
    var curHeight = state.canvas.height;
    if (curWidth === 300 && curHeight === 150) {
      curWidth = curHeight = 0;
    }
    var pxScale = window.devicePixelRatio;
    curWidth /= pxScale;
    curHeight /= pxScale;
    [state.canvas, state.shadowCanvas].forEach(function(canvas) {
      canvas.style.width = "".concat(state.width, "px");
      canvas.style.height = "".concat(state.height, "px");
      canvas.width = state.width * pxScale;
      canvas.height = state.height * pxScale;
      if (!curWidth && !curHeight) {
        canvas.getContext("2d").scale(pxScale, pxScale);
      }
    });
    var k = transform(state.canvas).k;
    state.zoom.translateBy(state.zoom.__baseElem, (state.width - curWidth) / 2 / k, (state.height - curHeight) / 2 / k);
    state.needsRedraw = true;
  }
}
function resetTransform(ctx) {
  var pxRatio = window.devicePixelRatio;
  ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
}
function clearCanvas(ctx, width, height) {
  ctx.save();
  resetTransform(ctx);
  ctx.clearRect(0, 0, width, height);
  ctx.restore();
}
var forceGraph = index({
  props: _objectSpread2({
    width: {
      "default": window.innerWidth,
      onChange: function onChange6(_, state) {
        return adjustCanvasSize(state);
      },
      triggerUpdate: false
    },
    height: {
      "default": window.innerHeight,
      onChange: function onChange7(_, state) {
        return adjustCanvasSize(state);
      },
      triggerUpdate: false
    },
    graphData: {
      "default": {
        nodes: [],
        links: []
      },
      onChange: function onChange8(d, state) {
        [d.nodes, d.links].every(function(arr) {
          return (arr || []).every(function(d2) {
            return !d2.hasOwnProperty("__indexColor");
          });
        }) && state.colorTracker.reset();
        [{
          type: "Node",
          objs: d.nodes
        }, {
          type: "Link",
          objs: d.links
        }].forEach(hexIndex);
        state.forceGraph.graphData(d);
        state.shadowGraph.graphData(d);
        function hexIndex(_ref4) {
          var type = _ref4.type, objs = _ref4.objs;
          objs.filter(function(d2) {
            if (!d2.hasOwnProperty("__indexColor")) return true;
            var cur = state.colorTracker.lookup(d2.__indexColor);
            return !cur || !cur.hasOwnProperty("d") || cur.d !== d2;
          }).forEach(function(d2) {
            d2.__indexColor = state.colorTracker.register({
              type,
              d: d2
            });
          });
        }
      },
      triggerUpdate: false
    },
    backgroundColor: {
      onChange: function onChange9(color, state) {
        state.canvas && color && (state.canvas.style.background = color);
      },
      triggerUpdate: false
    },
    nodeLabel: {
      "default": "name",
      triggerUpdate: false
    },
    nodePointerAreaPaint: {
      onChange: function onChange10(paintFn, state) {
        state.shadowGraph.nodeCanvasObject(!paintFn ? null : function(node, ctx, globalScale) {
          return paintFn(node, node.__indexColor, ctx, globalScale);
        });
        state.flushShadowCanvas && state.flushShadowCanvas();
      },
      triggerUpdate: false
    },
    linkPointerAreaPaint: {
      onChange: function onChange11(paintFn, state) {
        state.shadowGraph.linkCanvasObject(!paintFn ? null : function(link, ctx, globalScale) {
          return paintFn(link, link.__indexColor, ctx, globalScale);
        });
        state.flushShadowCanvas && state.flushShadowCanvas();
      },
      triggerUpdate: false
    },
    linkLabel: {
      "default": "name",
      triggerUpdate: false
    },
    linkHoverPrecision: {
      "default": 4,
      triggerUpdate: false
    },
    minZoom: {
      "default": 0.01,
      onChange: function onChange12(minZoom, state) {
        state.zoom.scaleExtent([minZoom, state.zoom.scaleExtent()[1]]);
      },
      triggerUpdate: false
    },
    maxZoom: {
      "default": 1e3,
      onChange: function onChange13(maxZoom, state) {
        state.zoom.scaleExtent([state.zoom.scaleExtent()[0], maxZoom]);
      },
      triggerUpdate: false
    },
    enableNodeDrag: {
      "default": true,
      triggerUpdate: false
    },
    enableZoomInteraction: {
      "default": true,
      triggerUpdate: false
    },
    enablePanInteraction: {
      "default": true,
      triggerUpdate: false
    },
    enableZoomPanInteraction: {
      "default": true,
      triggerUpdate: false
    },
    // to be deprecated
    enablePointerInteraction: {
      "default": true,
      onChange: function onChange14(_, state) {
        state.hoverObj = null;
      },
      triggerUpdate: false
    },
    autoPauseRedraw: {
      "default": true,
      triggerUpdate: false
    },
    onNodeDrag: {
      "default": function _default9() {
      },
      triggerUpdate: false
    },
    onNodeDragEnd: {
      "default": function _default10() {
      },
      triggerUpdate: false
    },
    onNodeClick: {
      triggerUpdate: false
    },
    onNodeRightClick: {
      triggerUpdate: false
    },
    onNodeHover: {
      triggerUpdate: false
    },
    onLinkClick: {
      triggerUpdate: false
    },
    onLinkRightClick: {
      triggerUpdate: false
    },
    onLinkHover: {
      triggerUpdate: false
    },
    onBackgroundClick: {
      triggerUpdate: false
    },
    onBackgroundRightClick: {
      triggerUpdate: false
    },
    showPointerCursor: {
      "default": true,
      triggerUpdate: false
    },
    onZoom: {
      triggerUpdate: false
    },
    onZoomEnd: {
      triggerUpdate: false
    },
    onRenderFramePre: {
      triggerUpdate: false
    },
    onRenderFramePost: {
      triggerUpdate: false
    }
  }, linkedProps),
  aliases: {
    // Prop names supported for backwards compatibility
    stopAnimation: "pauseAnimation"
  },
  methods: _objectSpread2({
    graph2ScreenCoords: function graph2ScreenCoords(state, x, y) {
      var t = transform(state.canvas);
      return {
        x: x * t.k + t.x,
        y: y * t.k + t.y
      };
    },
    screen2GraphCoords: function screen2GraphCoords(state, x, y) {
      var t = transform(state.canvas);
      return {
        x: (x - t.x) / t.k,
        y: (y - t.y) / t.k
      };
    },
    centerAt: function centerAt(state, x, y, transitionDuration) {
      if (!state.canvas) return null;
      if (x !== void 0 || y !== void 0) {
        var finalPos = Object.assign({}, x !== void 0 ? {
          x
        } : {}, y !== void 0 ? {
          y
        } : {});
        if (!transitionDuration) {
          setCenter(finalPos);
        } else {
          state.tweenGroup.add(new Tween(getCenter()).to(finalPos, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(setCenter).onComplete(function() {
            state.tweenGroup.remove(this);
          }).start());
        }
        return this;
      }
      return getCenter();
      function getCenter() {
        var t = transform(state.canvas);
        return {
          x: (state.width / 2 - t.x) / t.k,
          y: (state.height / 2 - t.y) / t.k
        };
      }
      function setCenter(_ref5) {
        var x2 = _ref5.x, y2 = _ref5.y;
        state.zoom.translateTo(state.zoom.__baseElem, x2 === void 0 ? getCenter().x : x2, y2 === void 0 ? getCenter().y : y2);
        state.needsRedraw = true;
      }
    },
    zoom: function zoom2(state, k, transitionDuration) {
      if (!state.canvas) return null;
      if (k !== void 0) {
        if (!transitionDuration) {
          setZoom(k);
        } else {
          state.tweenGroup.add(new Tween({
            k: getZoom()
          }).to({
            k
          }, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(function(_ref6) {
            var k2 = _ref6.k;
            return setZoom(k2);
          }).onComplete(function() {
            state.tweenGroup.remove(this);
          }).start());
        }
        return this;
      }
      return getZoom();
      function getZoom() {
        return transform(state.canvas).k;
      }
      function setZoom(k2) {
        state.zoom.scaleTo(state.zoom.__baseElem, k2);
        state.needsRedraw = true;
      }
    },
    zoomToFit: function zoomToFit(state) {
      var transitionDuration = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      var padding = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
      for (var _len = arguments.length, bboxArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        bboxArgs[_key - 3] = arguments[_key];
      }
      var bbox = this.getGraphBbox.apply(this, bboxArgs);
      if (bbox) {
        var center = {
          x: (bbox.x[0] + bbox.x[1]) / 2,
          y: (bbox.y[0] + bbox.y[1]) / 2
        };
        var zoomK = Math.max(1e-12, Math.min(1e12, (state.width - padding * 2) / (bbox.x[1] - bbox.x[0]), (state.height - padding * 2) / (bbox.y[1] - bbox.y[0])));
        this.centerAt(center.x, center.y, transitionDuration);
        this.zoom(zoomK, transitionDuration);
      }
      return this;
    },
    getGraphBbox: function getGraphBbox(state) {
      var nodeFilter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
        return true;
      };
      var getVal = index$1(state.nodeVal);
      var getR = function getR2(node) {
        return Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize;
      };
      var nodesPos = state.graphData.nodes.filter(nodeFilter).map(function(node) {
        return {
          x: node.x,
          y: node.y,
          r: getR(node)
        };
      });
      return !nodesPos.length ? null : {
        x: [min(nodesPos, function(node) {
          return node.x - node.r;
        }), max(nodesPos, function(node) {
          return node.x + node.r;
        })],
        y: [min(nodesPos, function(node) {
          return node.y - node.r;
        }), max(nodesPos, function(node) {
          return node.y + node.r;
        })]
      };
    },
    pauseAnimation: function pauseAnimation(state) {
      if (state.animationFrameRequestId) {
        cancelAnimationFrame(state.animationFrameRequestId);
        state.animationFrameRequestId = null;
      }
      return this;
    },
    resumeAnimation: function resumeAnimation(state) {
      if (!state.animationFrameRequestId) {
        this._animationCycle();
      }
      return this;
    },
    _destructor: function _destructor() {
      this.pauseAnimation();
      this.graphData({
        nodes: [],
        links: []
      });
    }
  }, linkedMethods),
  stateInit: function stateInit2() {
    return {
      lastSetZoom: 1,
      zoom: zoom(),
      forceGraph: new CanvasForceGraph(),
      shadowGraph: new CanvasForceGraph().cooldownTicks(0).nodeColor("__indexColor").linkColor("__indexColor").isShadow(true),
      colorTracker: new _default(),
      // indexed objects for rgb lookup
      tweenGroup: new Group()
    };
  },
  init: function init2(domNode, state) {
    var _this = this;
    domNode.innerHTML = "";
    var container = document.createElement("div");
    container.classList.add("force-graph-container");
    container.style.position = "relative";
    domNode.appendChild(container);
    state.canvas = document.createElement("canvas");
    if (state.backgroundColor) state.canvas.style.background = state.backgroundColor;
    container.appendChild(state.canvas);
    state.shadowCanvas = document.createElement("canvas");
    var ctx = state.canvas.getContext("2d");
    var shadowCtx = state.shadowCanvas.getContext("2d", {
      willReadFrequently: true
    });
    var pointerPos = {
      x: -1e12,
      y: -1e12
    };
    var getObjUnderPointer = function getObjUnderPointer2() {
      var obj = null;
      var pxScale = window.devicePixelRatio;
      var px = pointerPos.x > 0 && pointerPos.y > 0 ? shadowCtx.getImageData(pointerPos.x * pxScale, pointerPos.y * pxScale, 1, 1) : null;
      px && (obj = state.colorTracker.lookup(px.data));
      return obj;
    };
    select(state.canvas).call(drag().subject(function() {
      if (!state.enableNodeDrag) {
        return null;
      }
      var obj = getObjUnderPointer();
      return obj && obj.type === "Node" ? obj.d : null;
    }).on("start", function(ev) {
      var obj = ev.subject;
      obj.__initialDragPos = {
        x: obj.x,
        y: obj.y,
        fx: obj.fx,
        fy: obj.fy
      };
      if (!ev.active) {
        obj.fx = obj.x;
        obj.fy = obj.y;
      }
      state.canvas.classList.add("grabbable");
    }).on("drag", function(ev) {
      var obj = ev.subject;
      var initPos = obj.__initialDragPos;
      var dragPos = ev;
      var k = transform(state.canvas).k;
      var translate = {
        x: initPos.x + (dragPos.x - initPos.x) / k - obj.x,
        y: initPos.y + (dragPos.y - initPos.y) / k - obj.y
      };
      ["x", "y"].forEach(function(c) {
        return obj["f".concat(c)] = obj[c] = initPos[c] + (dragPos[c] - initPos[c]) / k;
      });
      if (!obj.__dragged && DRAG_CLICK_TOLERANCE_PX >= Math.sqrt(sum(["x", "y"].map(function(k2) {
        return Math.pow(ev[k2] - initPos[k2], 2);
      })))) return;
      state.forceGraph.d3AlphaTarget(0.3).resetCountdown();
      state.isPointerDragging = true;
      obj.__dragged = true;
      state.onNodeDrag(obj, translate);
    }).on("end", function(ev) {
      var obj = ev.subject;
      var initPos = obj.__initialDragPos;
      var translate = {
        x: obj.x - initPos.x,
        y: obj.y - initPos.y
      };
      if (initPos.fx === void 0) {
        obj.fx = void 0;
      }
      if (initPos.fy === void 0) {
        obj.fy = void 0;
      }
      delete obj.__initialDragPos;
      if (state.forceGraph.d3AlphaTarget()) {
        state.forceGraph.d3AlphaTarget(0).resetCountdown();
      }
      state.canvas.classList.remove("grabbable");
      state.isPointerDragging = false;
      if (obj.__dragged) {
        delete obj.__dragged;
        state.onNodeDragEnd(obj, translate);
      }
    }));
    state.zoom(state.zoom.__baseElem = select(state.canvas));
    state.zoom.__baseElem.on("dblclick.zoom", null);
    state.zoom.filter(function(ev) {
      return (
        // disable zoom interaction
        !ev.button && state.enableZoomPanInteraction && (ev.type !== "wheel" || index$1(state.enableZoomInteraction)(ev)) && (ev.type === "wheel" || index$1(state.enablePanInteraction)(ev))
      );
    }).on("zoom", function(ev) {
      var t = ev.transform;
      [ctx, shadowCtx].forEach(function(c) {
        resetTransform(c);
        c.translate(t.x, t.y);
        c.scale(t.k, t.k);
      });
      state.isPointerDragging = true;
      state.onZoom && state.onZoom(_objectSpread2(_objectSpread2({}, t), _this.centerAt()));
      state.needsRedraw = true;
    }).on("end", function(ev) {
      state.isPointerDragging = false;
      state.onZoomEnd && state.onZoomEnd(_objectSpread2(_objectSpread2({}, ev.transform), _this.centerAt()));
    });
    adjustCanvasSize(state);
    state.forceGraph.onNeedsRedraw(function() {
      return state.needsRedraw = true;
    }).onFinishUpdate(function() {
      if (transform(state.canvas).k === state.lastSetZoom && state.graphData.nodes.length) {
        state.zoom.scaleTo(state.zoom.__baseElem, state.lastSetZoom = ZOOM2NODES_FACTOR / Math.cbrt(state.graphData.nodes.length));
        state.needsRedraw = true;
      }
    });
    state.tooltip = new index$3(container);
    ["pointermove", "pointerdown"].forEach(function(evType) {
      return container.addEventListener(evType, function(ev) {
        if (evType === "pointerdown") {
          state.isPointerPressed = true;
          state.pointerDownEvent = ev;
        }
        !state.isPointerDragging && ev.type === "pointermove" && state.onBackgroundClick && (ev.pressure > 0 || state.isPointerPressed) && (ev.pointerType === "mouse" || ev.movementX === void 0 || [ev.movementX, ev.movementY].some(function(m) {
          return Math.abs(m) > 1;
        })) && (state.isPointerDragging = true);
        var offset = getOffset(container);
        pointerPos.x = ev.pageX - offset.left;
        pointerPos.y = ev.pageY - offset.top;
        function getOffset(el) {
          var rect = el.getBoundingClientRect(), scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
          };
        }
      }, {
        passive: true
      });
    });
    container.addEventListener("pointerup", function(ev) {
      if (!state.isPointerPressed) {
        return;
      }
      state.isPointerPressed = false;
      if (state.isPointerDragging) {
        state.isPointerDragging = false;
        return;
      }
      var cbEvents = [ev, state.pointerDownEvent];
      requestAnimationFrame(function() {
        if (ev.button === 0) {
          if (state.hoverObj) {
            var fn = state["on".concat(state.hoverObj.type, "Click")];
            fn && fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
          } else {
            state.onBackgroundClick && state.onBackgroundClick.apply(state, cbEvents);
          }
        }
        if (ev.button === 2) {
          if (state.hoverObj) {
            var _fn = state["on".concat(state.hoverObj.type, "RightClick")];
            _fn && _fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
          } else {
            state.onBackgroundRightClick && state.onBackgroundRightClick.apply(state, cbEvents);
          }
        }
      });
    }, {
      passive: true
    });
    container.addEventListener("contextmenu", function(ev) {
      if (!state.onBackgroundRightClick && !state.onNodeRightClick && !state.onLinkRightClick) return true;
      ev.preventDefault();
      return false;
    });
    state.forceGraph(ctx);
    state.shadowGraph(shadowCtx);
    var refreshShadowCanvas = throttle(function() {
      clearCanvas(shadowCtx, state.width, state.height);
      state.shadowGraph.linkWidth(function(l) {
        return index$1(state.linkWidth)(l) + state.linkHoverPrecision;
      });
      var t = transform(state.canvas);
      state.shadowGraph.globalScale(t.k).tickFrame();
    }, HOVER_CANVAS_THROTTLE_DELAY);
    state.flushShadowCanvas = refreshShadowCanvas.flush;
    (this._animationCycle = function animate() {
      var doRedraw = !state.autoPauseRedraw || !!state.needsRedraw || state.forceGraph.isEngineRunning() || state.graphData.links.some(function(d) {
        return d.__photons && d.__photons.length;
      });
      state.needsRedraw = false;
      if (state.enablePointerInteraction) {
        var obj = !state.isPointerDragging ? getObjUnderPointer() : null;
        if (obj !== state.hoverObj) {
          var prevObj = state.hoverObj;
          var prevObjType = prevObj ? prevObj.type : null;
          var objType = obj ? obj.type : null;
          if (prevObjType && prevObjType !== objType) {
            var fn = state["on".concat(prevObjType, "Hover")];
            fn && fn(null, prevObj.d);
          }
          if (objType) {
            var _fn2 = state["on".concat(objType, "Hover")];
            _fn2 && _fn2(obj.d, prevObjType === objType ? prevObj.d : null);
          }
          state.tooltip.content(obj ? index$1(state["".concat(obj.type.toLowerCase(), "Label")])(obj.d) || null : null);
          state.canvas.classList[(obj && state["on".concat(objType, "Click")] || !obj && state.onBackgroundClick) && index$1(state.showPointerCursor)(obj === null || obj === void 0 ? void 0 : obj.d) ? "add" : "remove"]("clickable");
          state.hoverObj = obj;
        }
        doRedraw && refreshShadowCanvas();
      }
      if (doRedraw) {
        clearCanvas(ctx, state.width, state.height);
        var globalScale = transform(state.canvas).k;
        state.onRenderFramePre && state.onRenderFramePre(ctx, globalScale);
        state.forceGraph.globalScale(globalScale).tickFrame();
        state.onRenderFramePost && state.onRenderFramePost(ctx, globalScale);
      }
      state.tweenGroup.update();
      state.animationFrameRequestId = requestAnimationFrame(animate);
    })();
  },
  update: function updateFn(state) {
  }
});
export {
  forceGraph as f
};
