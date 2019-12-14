function isHexColor(color: string) {
  return /(^#[0-9A-F]{6,8}$)|(^#[0-9A-F]{3}$)/i.test(color); // https://regex101.com/
}

export {isHexColor};
