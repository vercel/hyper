const Registry = require('winreg');

const appPath = `"${process.execPath}"`;
const regKeys = [
  `\\Software\\Classes\\Directory\\shell\\Hyper`,
  `\\Software\\Classes\\Directory\\background\\shell\\Hyper`
];

const regParts = [
  {key: 'command', name: '', value: `${appPath} "%V"`},
  {name: '', value: 'Open Hyper here'},
  {name: 'Icon', value: `${appPath}`}
];

function addValues(hyperKey, commandKey, callback) {
  hyperKey.set(regParts[1].name, Registry.REG_SZ, regParts[1].value, error => {
    if (error) {
      //eslint-disable-next-line no-console
      console.error(error.message);
    }
    hyperKey.set(regParts[2].name, Registry.REG_SZ, regParts[2].value, err => {
      if (err) {
        //eslint-disable-next-line no-console
        console.error(err.message);
      }
      commandKey.set(regParts[0].name, Registry.REG_SZ, regParts[0].value, err_ => {
        if (err_) {
          //eslint-disable-next-line no-console
          console.error(err_.message);
        }
        callback();
      });
    });
  });
}

exports.add = callback => {
  const hyperKeys = [
    new Registry({hive: 'HKCU', key: regKeys[0]}),
    new Registry({hive: 'HKCU', key: regKeys[1]})
  ];

  const commandKeys = [
    new Registry({
      hive: 'HKCU',
      key: `${regKeys[0]}\\${regParts[0].key}`
    }),
    new Registry({
      hive: 'HKCU',
      key: `${regKeys[1]}\\${regParts[0].key}`
    })
  ];

  let i = 0;
  hyperKeys[0].keyExists(createKey);

  function createKey(error, exists) {
    if (error) {
      //eslint-disable-next-line no-console
      console.error(error.message);
    }
    if (exists) {
      commandKeys[i].keyExists((err_, exists_) => {
        if (err_) {
          //eslint-disable-next-line no-console
          console.error(err_.message);
        }
        if (exists_) {
          addValues(hyperKeys[i], commandKeys[i],
             i ? callback : function() {i++;hyperKeys[i].keyExists(createKey);} );
        } else {
          commandKeys[i].create(err => {
            if (err) {
              //eslint-disable-next-line no-console
              console.error(err.message);
            }
            addValues(hyperKeys[i], commandKeys[i],
              i ? callback : function() {i++;hyperKeys[i].keyExists(createKey);} );
          });
        }
      });
    } else {
      hyperKeys[i].create(err => {
        if (err) {
          //eslint-disable-next-line no-console
          console.error(err.message);
        }
        commandKeys[i].create(err_ => {
          if (err_) {
            //eslint-disable-next-line no-console
            console.error(err_.message);
          }
          addValues(hyperKeys[i], commandKeys[i], 
            i ? callback : function() {i++;hyperKeys[i].keyExists(createKey);} );
        });
      });
    }
  }
};

exports.remove = callback => {
  let firstRegistry = new Registry({hive: 'HKCU', key: regKeys[0]});
  let secondRegistry = new Registry({hive: 'HKCU', key: regKeys[1]});

  firstRegistry.destroy(err => {
    if (err) {
      //eslint-disable-next-line no-console
      console.error(err.message);
    }
    secondRegistry.destroy(err => {
      if (err) {
        //eslint-disable-next-line no-console
        console.error(err.message);
      }
      callback();
    });
  });

};
