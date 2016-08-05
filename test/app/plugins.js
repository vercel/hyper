require('../setup');

const {_toDependencies} = require('../../app/plugins');

describe('plugins', function () {
  describe('#toDependencies()', function () {
    it('should convert dependencies form hyperterm\'s format to npm\'s', function () {
      const plugins = ['project1', 'project2#1.0.0', 'project3@beta',
                       '@org1/project4#1.0.0', '@org2/project5@alpha',
                       '@org3/project6'];

      _toDependencies({plugins: plugins}).should.be.eql({
        'project1': 'latest',
        'project2': '1.0.0',
        'project3': 'beta',
        '@org1/project4': '1.0.0',
        '@org2/project5': 'alpha',
        '@org3/project6': 'latest'
      });
    });
  });
});
