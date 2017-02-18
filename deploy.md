1. fork the repo
2. enable travis
3. deploy a `nuts` instance pointing to your fork
4. replace the url in `app/auto-updater` 
  github.com/gitbookIO/nuts  
  to deploy it:
  just clone and then  
  `now --npm --force -e GITHUB_REPO=zeit/hyper -e GITHUB_USERNAME='matheuss' -e GITHUB_TOKEN=@github_token`
  obviously changing the values there 
  and `@github_token` is a now secret with a personal token from github.com/settings
  
5. create draft release
6. bump the `version` on `app/package.json`  
7. wait for travis  
8. done