// hack to configure important style attributes
// to work around this madness:
// https://github.com/Khan/aphrodite/pull/41

export default function overrideStyle (obj) {
  if (obj) {
    return function (ref) {
      if (ref) {
        for (const key in obj) {
          if (null != obj[key]) {
            const val = 'number' === typeof obj[key]
              ? `${obj[key]}px`
              : String(obj[key]);
            const prop = toProp(key);
            ref.style.setProperty(prop, val, 'important');
          }
        }
      }
    };
  } else {
    return null;
  }
}

// converts camelCase to camel-case
function toProp (key) {
  return key.replace(
    /[a-z]([A-Z])/,
    (a, b) => a.substr(0, a.length - 1) + '-' + b.toLowerCase()
  );
}
