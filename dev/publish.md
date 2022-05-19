## steps
1. modify changelog, and syc version with package.json
1. `npm run changelog`
1. check and commit all changes in repo.
1. `npm publish`

## Token
1. go to https://metaseed.visualstudio.com/
1. follow steps: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
   1. personal access tokens: https://metaseed.visualstudio.com/_usersSettings/tokens
     ![](https://code.visualstudio.com/assets/api/working-with-extensions/publishing-extension/token1.png)
   1. new token: {name:vscode-ext, organization: all accessible organizations, expiration: 90days, scopes: custom defined, show more scopes => marketplace: Manage}
    ![](https://code.visualstudio.com/assets/api/working-with-extensions/publishing-extension/token2.png)
   1. copy toeken and store it in .env of workspace folder for further ref, note: it is ignored from git.
   1. run `npm run login` it's the same as `vsce login metaseed`
   1. `npm run publishOnly`

   > npm install --global vsce