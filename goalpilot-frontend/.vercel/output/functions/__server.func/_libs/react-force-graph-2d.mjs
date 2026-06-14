import { i as index } from "./react-kapsule.mjs";
import { f as forceGraph } from "./force-graph.mjs";
import { P as PropTypes } from "./prop-types.mjs";
import "./react.mjs";
import "./jerrypick.mjs";
import "./d3-zoom.mjs";
import "./d3-transition.mjs";
import "./d3-dispatch.mjs";
import "./d3-timer.mjs";
import "./d3-interpolate.mjs";
import "./d3-color.mjs";
import "./d3-selection.mjs";
import "./d3-ease.mjs";
import "./d3-drag.mjs";
import "./tweenjs__tween.js.mjs";
import "./kapsule.mjs";
import "./lodash-es.mjs";
import "./accessor-fn.mjs";
import "./canvas-color-tracker.mjs";
import "./tinycolor2.mjs";
import "./float-tooltip.mjs";
import "./preact.mjs";
import "./bezier-js.mjs";
import "./index-array-by.mjs";
import "./d3-scale.mjs";
import "./internmap.mjs";
import "./d3-scale-chromatic.mjs";
import "./d3-force-3d.mjs";
import "./d3-binarytree.mjs";
import "./d3-quadtree.mjs";
import "./d3-octree.mjs";
import "./d3-array.mjs";
const commonPropTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  graphData: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired
  }),
  backgroundColor: PropTypes.string,
  nodeRelSize: PropTypes.number,
  nodeId: PropTypes.string,
  nodeLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  nodeVal: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  nodeVisibility: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.func]),
  nodeColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  nodeAutoColorBy: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onNodeHover: PropTypes.func,
  onNodeClick: PropTypes.func,
  linkSource: PropTypes.string,
  linkTarget: PropTypes.string,
  linkLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkVisibility: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.func]),
  linkColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkAutoColorBy: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkCurvature: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalArrowLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalArrowColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkDirectionalArrowRelPos: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalParticles: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalParticleSpeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalParticleOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalParticleWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkDirectionalParticleColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onLinkHover: PropTypes.func,
  onLinkClick: PropTypes.func,
  dagMode: PropTypes.oneOf(["td", "bu", "lr", "rl", "zin", "zout", "radialin", "radialout"]),
  dagLevelDistance: PropTypes.number,
  dagNodeFilter: PropTypes.func,
  onDagError: PropTypes.func,
  d3AlphaMin: PropTypes.number,
  d3AlphaDecay: PropTypes.number,
  d3VelocityDecay: PropTypes.number,
  warmupTicks: PropTypes.number,
  cooldownTicks: PropTypes.number,
  cooldownTime: PropTypes.number,
  onEngineTick: PropTypes.func,
  onEngineStop: PropTypes.func,
  getGraphBbox: PropTypes.func
};
const pointerBasedPropTypes = {
  zoomToFit: PropTypes.func,
  onNodeRightClick: PropTypes.func,
  onNodeDrag: PropTypes.func,
  onNodeDragEnd: PropTypes.func,
  onLinkRightClick: PropTypes.func,
  linkHoverPrecision: PropTypes.number,
  onBackgroundClick: PropTypes.func,
  onBackgroundRightClick: PropTypes.func,
  showPointerCursor: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  enablePointerInteraction: PropTypes.bool,
  enableNodeDrag: PropTypes.bool
};
const threeBasedPropTypes = {
  showNavInfo: PropTypes.bool,
  nodeOpacity: PropTypes.number,
  nodeResolution: PropTypes.number,
  nodeThreeObject: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  nodeThreeObjectExtend: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.func]),
  nodePositionUpdate: PropTypes.func,
  linkOpacity: PropTypes.number,
  linkResolution: PropTypes.number,
  linkCurveRotation: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.func]),
  linkMaterial: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  linkThreeObject: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  linkThreeObjectExtend: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.func]),
  linkPositionUpdate: PropTypes.func,
  linkDirectionalArrowResolution: PropTypes.number,
  linkDirectionalParticleResolution: PropTypes.number,
  linkDirectionalParticleThreeObject: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
  forceEngine: PropTypes.oneOf(["d3", "ngraph"]),
  ngraphPhysics: PropTypes.object,
  numDimensions: PropTypes.oneOf([1, 2, 3])
};
const ForceGraph2DPropTypes = Object.assign({}, commonPropTypes, pointerBasedPropTypes, {
  linkLineDash: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.string, PropTypes.func]),
  nodeCanvasObjectMode: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  nodeCanvasObject: PropTypes.func,
  nodePointerAreaPaint: PropTypes.func,
  linkCanvasObjectMode: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkCanvasObject: PropTypes.func,
  linkPointerAreaPaint: PropTypes.func,
  linkDirectionalParticleCanvasObject: PropTypes.func,
  autoPauseRedraw: PropTypes.bool,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  enableZoomInteraction: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  enablePanInteraction: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onZoom: PropTypes.func,
  onZoomEnd: PropTypes.func,
  onRenderFramePre: PropTypes.func,
  onRenderFramePost: PropTypes.func
});
Object.assign({}, commonPropTypes, pointerBasedPropTypes, threeBasedPropTypes, {
  enableNavigationControls: PropTypes.bool,
  controlType: PropTypes.oneOf(["trackball", "orbit", "fly"]),
  rendererConfig: PropTypes.object,
  extraRenderers: PropTypes.arrayOf(PropTypes.shape({
    render: PropTypes.func.isRequired
  }))
});
Object.assign({}, commonPropTypes, threeBasedPropTypes, {
  nodeDesc: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  linkDesc: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
});
Object.assign({}, commonPropTypes, threeBasedPropTypes, {
  markerAttrs: PropTypes.object,
  yOffset: PropTypes.number,
  glScale: PropTypes.number
});
const ForceGraph2D = index(forceGraph, {
  methodNames: [
    // bind methods
    "emitParticle",
    "d3Force",
    "d3ReheatSimulation",
    "stopAnimation",
    "pauseAnimation",
    "resumeAnimation",
    "centerAt",
    "zoom",
    "zoomToFit",
    "getGraphBbox",
    "screen2GraphCoords",
    "graph2ScreenCoords"
  ]
});
ForceGraph2D.displayName = "ForceGraph2D";
ForceGraph2D.propTypes = ForceGraph2DPropTypes;
export {
  ForceGraph2D as default
};
