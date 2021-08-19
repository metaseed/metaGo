export interface Image {
    src: string;
    width: number;
    height: number;
}

export interface Header {
    logo: Image;
    message: string; // html
}

export enum ChangeLogKind { ADDED = "ADDED", REMOVED = "REMOVED", CHANGED = "CHANGED", FIXED = "FIXED", PLAN="PLAN", VERSION = "VERSION" };

export interface ChangeLogItem {
    kind: ChangeLogKind;
    message: string; // html
}

export interface Sponsor {
    title: string;
    link: string;
    image: string;
    width: number;
    message: string;
    extra: string;
}

export interface ContentProvider {
    provideHeader(logoUrl: string): Header;
    provideChangeLog(): ChangeLogItem[];
    provideSponsors(): Sponsor[];
}