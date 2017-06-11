const Registry = require('winreg');

const appPath = `"${process.execPath}"`;
const regKey = `\\Software\\Classes\\Directory\\background\\shell\\Hyper`;
const regParts = [
    {key: 'command', name: '', value: `${appPath} "%V"`},
    {name: '', value: 'Open Hyper here'},
    {name: 'Icon', value: `${appPath}`}
];

function addValues(hyperKey, commandKey, callback) {
  hyperKey.set(regParts[1].name, Registry.REG_SZ, regParts[1].value, err => {
    if (err) {
      console.error(err.message);
    }
    hyperKey.set(regParts[2].name, Registry.REG_SZ, regParts[2].value, err => {
      if (err) {
        console.error(err.message);
      }
      commandKey.set(regParts[0].name, Registry.REG_SZ, regParts[0].value, err => {
        if (err) {
          console.error(err.message);
        }
        callback();
      });
    });
  });
}

exports.add = function (callback) {
  const hyperKey = new Registry({hive: 'HKCU', key: regKey});
  const commandKey = new Registry({hive: 'HKCU', key: `${regKey}\\${regParts[0].key}`});

  hyperKey.keyExists((err, exists) => {
    if (err) {
      console.error(err.message);
    }
    if (exists) {
      commandKey.keyExists((err, exists) => {
        if (err) {
          console.error(err.message);
        }
        if (exists) {
          addValues(hyperKey, commandKey, callback);
        } else {
          commandKey.create(err => {
            if (err) {
              console.error(err.message);
            }
            addValues(hyperKey, commandKey, callback);
          });
        }
      });
    } else {
      hyperKey.create(err => {
        if (err) {
          console.error(err.message);
        }
        commandKey.create(err => {
          if (err) {
            console.error(err.message);
          }
          addValues(hyperKey, commandKey, callback);
        });
      });
    }
  });
};

exports.remove = function (callback) {
  new Registry({hive: 'HKCU', key: regKey}).destroy(err => {
    if (err) {
      console.error(err.message);
    }
    callback();
  });
};
