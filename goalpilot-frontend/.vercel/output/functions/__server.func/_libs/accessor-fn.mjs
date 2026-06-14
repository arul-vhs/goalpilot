var index = (function(p) {
  return typeof p === "function" ? p : typeof p === "string" ? function(obj) {
    return obj[p];
  } : function(obj) {
    return p;
  };
});
export {
  index as i
};
