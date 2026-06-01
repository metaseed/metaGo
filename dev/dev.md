# Dev(NEW)
## how to dev
Now F5 on any of the three configs:

Starts the esbuild watcher, waits for the first build to finish (no more hang, no "task still running" prompt), then launches the dev host.
Keeps rebuilding on save. After a change, just press Ctrl+R in the dev host to reload the rebuilt bundle.
For MetaWord specifically: pick Launch MetaWord, F5, then press alt+; in the dev host to test space mode.

# Dev(OLD)
## How to debug now
1. Open the Run and Debug panel, pick "Launch MetaWord" from the dropdown, press F5.
	* It builds src/metaWord/dist first, then opens an Extension Development Host running your code.
	* VS Code automatically disables the installed metaseed.metaWord while you develop it, so there's no conflict.
1. In that new window, open any file, press alt+; → you should see the Space mode status-bar message. Set breakpoints in src/metaWord/src/space-mode.ts (source maps are on).
## For fast iteration
Run the "metaWord: watch" task once (Terminal → Run Task → metaWord: watch) so saves rebuild automatically, then just press Ctrl+R in the dev host to reload after each change — no need to restart the whole debug session.
