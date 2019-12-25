const rendererTypes: Record<string, string> = {};

function getRendererTypes() {
  return rendererTypes;
}

function setRendererType(uid: string, type: string) {
  rendererTypes[uid] = type;
}

function unsetRendererType(uid: string) {
  delete rendererTypes[uid];
}

export {getRendererTypes, setRendererType, unsetRendererType};
