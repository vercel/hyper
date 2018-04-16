// Packages
const {prompt} = require('inquirer');

module.exports = async markdown => {
  const answers = await prompt([
    {
      name: 'intro',
      message: 'One-Line Release Summary'
    }
  ]);

  const {intro} = answers;

  if (intro === '') {
    //eslint-disable-next-line no-console
    console.error('Please specify a release summary!');

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  return `${intro}\n\n${markdown}`;
};
