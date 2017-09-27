// Packages
const {prompt} = require('inquirer');

module.exports = async markdown => {
  const answers = await prompt([{
    name: 'intro',
    message: 'Release intro'
  }]);

  const {intro} = answers;

  if (intro === '') {
    console.error('Please specify a release intro!');

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  return `${intro}\n\n${markdown}`;
};
