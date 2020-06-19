import { ContentProvider, Header, ChangeLogItem, Image, Sponsor,LandingPageManager } from "@landing-page/index";
import * as vscode from 'vscode';
import { changeLog } from './changelog';

export class LandingPage implements ContentProvider {
    private viewer: LandingPageManager;
    constructor(context: vscode.ExtensionContext) {
        this.viewer = new LandingPageManager(context).registerContentProvider("metaWord", this);
        context.subscriptions.push(vscode.commands.registerCommand("metaWord.showLandingPage", () => this.viewer.showPage()));
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
            message: `<b>MetaWord</b> is one part of the tool set <i>MetaGo</i>, with the goal to do cursor based moving/selecting/deleting by different kinds of words. <br/>If you like it, you may also like other tools from <i>MetaGo</i>. <a title="Star me on GitHub" href="https://github.com/metaseed/metaGo/">GitHub⭐</a>`
        };
    }

    provideChangeLog(): ChangeLogItem[] {
        return changeLog;
    }

}