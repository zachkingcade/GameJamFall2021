import { Capacitor, Plugins, FilesystemDirectory, FilesystemEncoding } from "@capacitor/core";
const { Filesystem } = Plugins;

// Upon importing, log the read/write platform in use
console.log("Read/Write platform: ", Capacitor.platform);

// Importing node libraries when using electron
var fs: any = null;
var path: any = null;
var app: any = null;
try {
    // Import node libraries for filesystem
    fs = window.require('fs');
    path = window.require('path');
    app = window.require('electron').remote.app
} catch (e) {
    // Log if the full filesystem is not available through node
    console.log("Full filesystem access not available. (Are we on mobile/web?) ", e);
}

// Specifier type to determine what file is being read from/written to
export interface FileSpecifier {
    // relative path to the file from the directory
    filePath: string,
    // The root directory to use on desktops. This property is only used if
    // location is set to 'data'. 'app' will use a subfolder in electron app.
    // 'documents' will match files in the OS documents folder.
    desktopDataDirectory?: string
    // Preset directories to use as root.
    // Valid choices are: documents, data, app
    // For mobile, 'documents' and 'data' work as described here:
    // https://capacitorjs.com/docs/apis/filesystem#filesystemdirectory
    // For mobile, 'app' works just like 'data'. (We can't save to app directory on mobile)
    // For electron/desktop:
    // 'documents' should save to the OS's documents folder
    // 'data' should save to a folder specified in the desktopDataDirectory property
    // 'app' will save to a subdirectory of the app, 'appdata/'
    location: string,
    // When using web (such as dev server) how should we resolve save/load
    // operations? (web does not have access to filesystem)
    // THIS STILL NEEDS IMPLEMENTATION!!!!!!!
    // Choices are:
    //   - ram: simulate storage by putting data in main memory,
    //          no persistence after reload
    //   - local: use browser localStorage, the browser frequently cleans
    //            this, so it is not a long-term storage solution
    //   - pass (default): ignore the save/load statement, ensure the op is
    //           non-critical before using this.
    webResolve?: string
}

export async function readFile(file: FileSpecifier): Promise<string> {
    // If platform is electron, run internal electron read function
    if (Capacitor.platform == "electron") {
        return await _electronRead(file);
    }
    // If platform is mobile, run internal mobile read function
    else if (Capacitor.platform == 'ios' || Capacitor.platform == 'android') {
        return await _mobileRead(file);
    }
    // As a fallback, run the simulated web read
    else {
        return await _webSimulateRead(file);
    }
}

export async function writeFile(file: FileSpecifier, data: string): Promise<void> {
    // If platform is electron, run internal electron write function
    if (Capacitor.platform == "electron") {
        await _electronWrite(file, data);
    }
    // If platform is mobile, run internal mobile write function
    else if (Capacitor.platform == 'ios' || Capacitor.platform == 'android') {
        await _mobileWrite(file, data);
    }
    // As a fallback, run the simulated web write
    else {
        await _webSimulateWrite(file, data);
    }
}

async function _electronRead(file: FileSpecifier): Promise<string> {
    // Read from folder in app directory "appdata/"
    if (file.location == 'app') {
        return fs.readFileSync(path.resolve(app.getAppPath(), 'appdata', file.filePath), { encoding: 'ascii' });
    }
    // Read from standard documents folder such as "C:\Users\username\Documents\"
    else if (file.location == 'documents') {
        return (await Filesystem.readFile(
            {
                directory: FilesystemDirectory.Documents,
                path: file.filePath,
                encoding: FilesystemEncoding.ASCII
            }
        )).data;
    }
    // Read from a specified data folder on the system
    else if (file.location == 'data') {
        return fs.readFileSync(path.resolve(file.desktopDataDirectory, file.filePath), { encoding: 'ascii' });
    }
}

async function _electronWrite(file: FileSpecifier, data: string): Promise<void> {
    // Save files to the directory of the application in a folder "appdata/"
    if (file.location == 'app') {
        try {
            fs.accessSync(path.resolve(app.getAppPath(), 'appdata'));
        } catch {
            fs.mkdirSync(path.resolve(app.getAppPath(), 'appdata'));
        }
        fs.writeFileSync(path.resolve(app.getAppPath(), 'appdata', file.filePath), data, { encoding: 'ascii' });
    }
    // Save files to the standard document folder, such as "C:\Users\username\Documents\"
    else if (file.location == 'documents') {
        await Filesystem.writeFile(
            {
                directory: FilesystemDirectory.Documents,
                path: file.filePath,
                data: data,
                encoding: FilesystemEncoding.ASCII
            }
        );
    }
    // Save files to a specified data folder on the system
    else if (file.location == 'data') {
        try {
            fs.accessSync(file.desktopDataDirectory);
        } catch {
            fs.mkdirSync(file.desktopDataDirectory);
        }
        fs.writeFileSync(path.resolve(file.desktopDataDirectory, file.filePath), data, { encoding: 'ascii' });
    }
}

async function _mobileRead(file: FileSpecifier): Promise<string> {
    let directory: any;
    // Read from the devices documents folder
    // Android is the system documents folder, ios is the app's documents folder
    if (file.location == 'documents') directory = FilesystemDirectory.Documents;
    // 'data' and 'app' are treated the same, read from the mobile devices default data folder
    else if (file.location == 'data' || file.location == 'app') directory = FilesystemDirectory.Data;
    return (await Filesystem.readFile(
        {
            directory: directory,
            path: file.filePath,
            encoding: FilesystemEncoding.ASCII
        }
    )).data;
}

async function _mobileWrite(file: FileSpecifier, data: string): Promise<void> {
    let directory: any;
    // Save to the device's default for documents
    // Android is the system documents folder, ios is the app's documents folder
    // (Android document files can be accessed by other apps)
    if (file.location == 'documents') directory = FilesystemDirectory.Documents;
    // Save to the default data directory of the system. May overlap with documents
    else if (file.location == 'data' || file.location == 'app') directory = FilesystemDirectory.Data;
    await Filesystem.writeFile(
        {
            directory: directory,
            path: file.filePath,
            data: data,
            encoding: FilesystemEncoding.ASCII
        }
    );
}

async function _webSimulateRead(file: FileSpecifier): Promise<string> {
    // If using ram to simulate reads, just read it from an object
    if (file.webResolve == 'ram') {
        return _fakeStorage[file.filePath];
    }
    // If using local storage to simulate reads, make a javascript call
    else if (file.webResolve == 'local') {
        return localStorage.getItem(file.filePath);
    }
    // Just ignore the read statment
    else if (file.webResolve == 'pass') {
        return null;
    }
    // If nothing is specified, throw an error
    else {
        throw ('Attempted to simulate file ops in browser with no webResolve specified!');
    }
}

async function _webSimulateWrite(file: FileSpecifier, data: string): Promise<void> {
    // If using ram to simulate writes, just store it in an object
    if (file.webResolve == 'ram') {
        _fakeStorage[file.filePath] = data;
    }
    // If using local storage to simulate writes, make a javascript call
    else if (file.webResolve == 'local') {
        localStorage.setItem(file.filePath, data);
    }
    // Just ignore the write statment
    else if (file.webResolve == 'pass') {
        return;
    }
    // If nothing is specified, throw an error
    else {
        throw ('Attempted to simulate file ops in browser with no webResolve specified!');
    }
}

var _fakeStorage = {};