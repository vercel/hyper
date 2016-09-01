# Contributing to HyperTerm

## Get the code

1. If you are running Linux, install the required dependencies: `sudo apt-get install -y icnsutils graphicsmagick xz-utils`
2. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
3. Install the dependencies: `npm install`
4. Build the code and watch for changes: `npm run dev`
5. In a new tab, start the application: `npm start`

## Test in production

To make sure that your code works in a **production** environment, build the binary for your platform by running the following:

```bash
$ npm run pack
```

After that, the binary will be available in `./dist`.


## Submit a pull request

When you're done with your code, [submit a pull request](https://help.github.com/articles/about-pull-requests/)! Make sure that you fill the `description` section of your PR with a concise explanation of your changes :)
