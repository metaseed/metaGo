import path = require("path");
import * as semver from "semver";
import * as vscode from "vscode";
import { ContentProvider } from "./contentProvider";
import { LandingPageBuilder } from "./pageBuilder";

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
        const onDiskPath = vscode.Uri.file(
            path.join(this.context.extensionPath, 'ui', "landing-page", "whats-new.html"));
        const pageUri = onDiskPath.with({ scheme: "vscode-resource" });

        // Local path to main script run in the webview
        const cssPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, 'ui', "landing-page", "main.css"));
        const cssUri = cssPathOnDisk.with({ scheme: "vscode-resource" });

        // Local path to main script run in the webview
        const logoPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, "images", `metago.gif`));
        const logoUri = logoPathOnDisk.with({ scheme: "vscode-resource" });

        panel.webview.html = this.getWebviewContentLocal(pageUri.fsPath, cssUri.toString(), logoUri.toString());
    }

    private showPageIfVersionDiffers(currentVersion: string, previousVersion: string) {

        if (previousVersion) {
            const differs: semver.ReleaseType | null = semver.diff(currentVersion, previousVersion);

            // only "patch" should be suppressed
            if (!differs || differs === "patch") {
                return;
            }
        }

        // "major", "minor"
        this.context.globalState.update(`${this.extensionName}.version`, currentVersion);
        this.showPage();
    }

    private getWebviewContentLocal(htmlFile: string, cssUrl: string, logoUrl: string): string {
        return new LandingPageBuilder(htmlFile)
            .updateExtensionDisplayName(this.extension.packageJSON.displayName)
            .updateExtensionName(this.extensionName)
            .updateExtensionVersion(this.extension.packageJSON.version)
            .updateRepositoryUrl(this.extension.packageJSON.repository.url.slice(
                0, this.extension.packageJSON.repository.url.length - 4))
            .updateRepositoryIssues(this.extension.packageJSON.bugs.url)
            .updateRepositoryHomepage(this.extension.packageJSON.homepage)
            .updateCSS(cssUrl)
            .updateHeader(this.contentProvider.provideHeader(logoUrl))
            .updateChangeLog(this.contentProvider.provideChangeLog())
            .updateSponsors(this.contentProvider.provideSponsors())
            .build();
    }
}