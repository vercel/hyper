const rendererTypes = {};

function getRendererTypes() {
  return rendererTypes;
}

function setRendererType(uid, type) {
  rendererTypes[uid] = type;
}

function unsetRendererType(uid) {
  delete rendererTypes[uid];
}

module.exports = {
  getRendererTypes,
  setRendererType,
  unsetRendererType
};
