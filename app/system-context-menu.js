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

exports.add = function (callback) {
  isRegistered(registered => {
    if (!registered) {
      const regPromises = [];
      regParts.forEach(part => {
        const reg = new Registry({hive: 'HKCU', key: part.key ? `${regKey}\\${part.key}` : regKey});
        reg.create(() => {
          regPromises.push(new Promise((resolve, reject) => {
            reg.set(part.name, Registry.REG_SZ, part.value, err => {
              if (err === null) {
                resolve(true);
              } else {
                return reject(err);
              }
            });
          }));
        });
      });
      Promise.all(regPromises).then(() => callback());
    }
  });
};

exports.remove = function (callback) {
  isRegistered(registered => {
    if (registered) {
      new Registry({hive: 'HKCU', key: regKey}).destroy(() => callback());
    }
  });
};
