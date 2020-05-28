import { ContentProvider, Header, ChangeLogItem, Image, Sponsor,LandingPageManager } from "@landing-page/index";
import * as vscode from 'vscode';
import { changeLog } from './changelog';

export class LandingPage implements ContentProvider {
    private viewer: LandingPageManager;
    constructor(context: vscode.ExtensionContext, name:string) {
        this.viewer = new LandingPageManager(context).registerContentProvider(name, this);
        context.subscriptions.push(vscode.commands.registerCommand(name + ".showLandingPage", () => this.viewer.showPage()));
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
            logo: <Image>{ src: logoUrl, height: 120, width: 120 },
            message: `<b>MetaGo</b> tries its best to be the coolest😎 keyboard(mouseless) focused navigation tool in vscode. With the goal to make your keyboard⌨ to you as meaningful as a kitchen knife to a master chef👩‍🍳. <a title="Star me on GitHub" href="https://github.com/metaseed/metaGo/">GitHub⭐</a>`
        };
    }

    provideChangeLog(): ChangeLogItem[] {
        return changeLog;
    }

}