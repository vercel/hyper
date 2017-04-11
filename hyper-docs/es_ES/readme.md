![](https://github.com/zeit/art/blob/525bd1bb39d97dd3b91c976106a6d5cc5766b678/hyper/repo-banner.png)

[![Build Status](https://travis-ci.org/zeit/hyper.svg?branch=master)](https://travis-ci.org/zeit/hyper)
[![Build status](https://ci.appveyor.com/api/projects/status/txg5qb0x35h0h65p/branch/master?svg=true)](https://ci.appveyor.com/project/appveyor-zeit/hyper/branch/master)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Para más detalles, dirigirse a: https://hyper.is

## Uso

[Download the latest release!](https://hyper.is/#installation)

Si estás en macOS, también puedes usar [Homebrew Cask](https://caskroom.github.io/) Para descargar la aplicación ejecutando estos comandos:

```bash
brew update
brew cask install hyper
```

Si estás en windows, puedes usar [chocolatey](https://chocolatey.org/) Para instalar la aplicación ejecutando el siguiente comando (package information can be found [here](https://chocolatey.org/packages/hyper/)):
```bash
choco install hyper
```
Nota: la versión de hyper disponible de chocolatey puede no ser la última. Considere el uso del enlace de descarga directa, https://hyper-updates.now.sh/download/win


## Contribuir

1. Instalar las dependencias
  * Si está ejecutando Linux, instale `icnsutils`,` graphicsmagick`, `xz-utils` y` rpm`
  * Si está ejecutando Windows, instale `windows-build-tools` con` yam global add windows-build-tools`.
2. [Fork](https://help.github.com/articles/fork-a-repo/) Este repositorio a tu propia cuenta GitHub y luego [clone](https://help.github.com/articles/cloning-a-repository/) A su dispositivo local
3. Instalar las dependencias: `yarn`
4. Construya el código y observe los cambios: `yarn run dev`
5. En otra pestaña de terminal / ventana / panel, ejecuta la aplicación: `aplicación de ejecución de hilo`

Para asegurarse de que su código funciona en la aplicación final, puede generar los binarios de esta manera:

```bash
yarn run dist
```

Después de eso, verás el binario en la carpeta `. /dist`!

### node-pty issues

Si después de construir durante el desarrollo obtiene un diálogo de alerta relacionado con los problemas de `node-pty`,
Asegúrese de que su proceso de compilación esté funcionando correctamente ejecutando `harn run rebuild-node-pty`.

Si estás en macOS, esto suele estar relacionado con problemas de Xcode (como no haber acordado
A los Términos de servicio ejecutando `sudo xcodebuild` después de una nueva instalación de Xcode).

## Repositorios relacionados

- [Art](https://github.com/zeit/art/tree/master/hyper)
- [Website](https://github.com/zeit/hyper-website)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme](https://github.com/zeit/hyperyellow)
