// Packages
const {prompt} = require('inquirer');

module.exports = async (markdown) => {
  const answers = await prompt([
    {
      name: 'intro',
      message: 'One-Line Release Summary'
    }
  ]);

  const {intro} = answers;

  if (intro === '') {
    console.error('Please specify a release summary!');

    process.exit(1);
  }

  return `${intro}\n\n${markdown}`;
};
