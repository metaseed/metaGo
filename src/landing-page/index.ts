import { ContentProvider, Header, ChangeLogItem, ChangeLogKind, Image, Sponsor } from "./contentProvider";
import { LandingPageManager } from "./manager";
import * as vscode from 'vscode';
import { changeLog } from './changelog';

export class LandingPage implements ContentProvider {
    private viewer: LandingPageManager;
    constructor(context: vscode.ExtensionContext) {
        this.viewer = new LandingPageManager(context).registerContentProvider("metaGo", this);
        context.subscriptions.push(vscode.commands.registerCommand("metago.showLandingPage", () => this.viewer.showPage()));
    }

    showIfNeed() {
        this.viewer.showPageInActivation();

    }

    provideSponsors(): Sponsor[] {
        const sponsors: Sponsor[] = [];

        return sponsors
    }

    provideHeader(logoUrl: string): Header {
        return <Header>{
            logo: <Image>{ src: logoUrl, height: 50, width: 50 },
            message: `<b>MetaGo</b> comes from the voice in my heart💖as a programmer. <i>Metago</i> tries its best to be the coolest😎 keyboard(mouseless) focused navigation tool in vscode. <i>Metago</i> tries to make your keyboard⌨ to you as meaningful as a kitchen knife to a masterchef👩‍🍳.`
        };
    }

    provideChangeLog(): ChangeLogItem[] {
        return changeLog;
    }

}