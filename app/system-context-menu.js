const Registry = require('winreg');

const appPath = `"${process.execPath}"`;
const regKey = `\\Software\\Classes\\Directory\\background\\shell\\Hyper`;
const regParts = [
    {key: 'command', name: '', value: `${appPath} "%V"`},
    {name: '', value: 'Open Hyper here'},
    {name: 'Icon', value: `${appPath}`}
];

function isRegistered(callback) {
  new Registry({
    hive: 'HKCU',
    key: `${regKey}\\${regParts[0].key}`
  }).get(regParts[0].name, (err, entry) => {
    callback(!err && entry && entry.value === regParts[0].value);
  });
}

exports.add = function () {
  isRegistered(registered => {
    if (!registered) {
      regParts.forEach(part => {
        const reg = new Registry({hive: 'HKCU', key: part.key ? `${regKey}\\${part.key}` : regKey});
        reg.create(() => reg.set(part.name, Registry.REG_SZ, part.value, () => {}));
      });
    }
  });
};

exports.remove = function () {
  isRegistered(registered => {
    if (registered) {
      new Registry({hive: 'HKCU', key: regKey}).destroy(() => {});
    }
  });
};
