import path = require("path");
import * as semver from "semver";
import * as vscode from "vscode";
import { ContentProvider } from "./contentProvider";
import { LandingPageBuilder } from "./pageBuilder";
import htmlFile from './whats-new.html';
import css from './main.css';
export class LandingPageManager {

    private extensionName: string;
    private context: vscode.ExtensionContext;
    private contentProvider: ContentProvider;

    private extension: vscode.Extension<any>;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public registerContentProvider(extensionName: string, contentProvider: ContentProvider): LandingPageManager {
        this.extensionName = extensionName
        this.contentProvider = contentProvider;

        return this;
    }

    public showPageInActivation() {
        this.extension = vscode.extensions.getExtension(`metaseed.${this.extensionName}`);
        const previousExtensionVersion = this.context.globalState.get<string>(`${this.extensionName}.version`);
        this.showPageIfVersionDiffers(this.extension.packageJSON.version, previousExtensionVersion);
    }

    public showPage() {
        const panel = vscode.window.createWebviewPanel(`${this.extensionName}.whatsNew`,
            `What's New in ${this.extension.packageJSON.displayName}`, vscode.ViewColumn.One, { enableScripts: true });

        // Get path to resource on disk
        // const onDiskPath = vscode.Uri.file(
        //     path.join(this.context.extensionPath, 'ui', "landing-page", "whats-new.html"));
        // // Local path to main script run in the webview
        // const cssPathOnDisk = vscode.Uri.file(
        //     path.join(this.context.extensionPath, 'ui', "landing-page", "main.css"));
        // const cssUri = panel.webview.asWebviewUri(cssPathOnDisk);
        // Local path to main script run in the webview
        const logoPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, this.extension.packageJSON.icon));
        const logoUri = panel.webview.asWebviewUri( logoPathOnDisk);
        panel.webview.html = this.getWebviewContentLocal(htmlFile, css, logoUri.toString());
    }

    private showPageIfVersionDiffers(currentVersion: string, previousVersion: string) {

        if (previousVersion) {
            const differs: semver.ReleaseType | null = semver.diff(currentVersion, previousVersion);

            // to do "patch" suppress add || differs === "patch"
            if (!differs ) { 
                return;
            }
        }

        // "major", "minor"
        this.context.globalState.update(`${this.extensionName}.version`, currentVersion);
        this.showPage();
    }

    private getWebviewContentLocal(htmlFile: string, css: string, logoUrl: string): string {
        return new LandingPageBuilder(htmlFile)
            .updateExtensionDisplayName(this.extension.packageJSON.displayName)
            .updateExtensionName(this.extensionName)
            .updateExtensionVersion(this.extension.packageJSON.version)
            .updateRepositoryUrl(this.extension.packageJSON.repository.url)
            .updateRepositoryIssues(this.extension.packageJSON.bugs.url)
            .updateRepositoryHomepage(this.extension.packageJSON.homepage)
            .updateManual(this.extension.packageJSON.manual)
            .updateChangelogUrl(this.extension.packageJSON.changelog)
            .updateCSS(css)
            .updateHeader(this.contentProvider.provideHeader(logoUrl))
            .updateChangeLog(this.contentProvider.provideChangeLog())
            .updateSponsors(this.contentProvider.provideSponsors())
            .build();
    }
}