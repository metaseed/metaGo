const fs = require('fs');

var lines = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n');

let findCurrentVersion = false;
let findStart = false;
let changeType = '';

let write = fs.createWriteStream('./src/landing-page/changelog.ts', { encoding: 'utf8', flags: 'w' });
write.write(`import { ChangeLogItem, ChangeLogKind } from "./contentProvider";\n`);
write.write(`export const changeLog: ChangeLogItem[] = [\n`);

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!findCurrentVersion && line.startsWith('## Current Version')) {
        findCurrentVersion = true;
        continue;
    }

    if (findCurrentVersion && !findStart && line.startsWith('---')) {
        findStart = true;
        continue;
    }

    if (findStart) {
        if (line.startsWith('#### Added')) {
            changeType = 'Added';
            continue;
        } else if (line.startsWith('#### Removed')) {
            changeType = 'Removed';
            continue;
        } else if (line.startsWith('#### Changed')) {
            changeType = 'Changed';
            continue;
        } else if (line.startsWith('#### Fixed')) {
            changeType = 'Fixed';
            continue;
        } else if (line .startsWith('### ')) {
            changeType = 'Version';
            line = line.substring(4);
            write.write(`  { kind: ChangeLogKind.${changeType.toUpperCase()},   message: \`${line}\`},\n`);
            continue;
        }
    }

    if (findStart && line.startsWith('---')) {
        //console.log("changelog.ts generated")
        //break;
        continue;
    }
    if (findStart && changeType) {
        if(line.trim() == '') continue;
        line = line.trim().replace(/^- \[ \]/,'').replace(/^- \[x\]/,'').replace(/^- /,'').trim();
        line = line.trim().replace(/^\* \[ \]/,'').replace(/^\* \[x\]/,'').replace(/^\* /,'').trim();
        switch (changeType) {
            case 'Added':
                break;
            case 'Removed':
                break;
            case 'Fixed':
                break;
            case 'Changed':
                break;
            default:
                throw new Error(`bad change type ${changeType}`);
                break;
        }
        write.write(`  { kind: ChangeLogKind.${changeType.toUpperCase()},   message: \`${line}\`},\n`);
    }

  

}

write.write('];\n');
write.close();