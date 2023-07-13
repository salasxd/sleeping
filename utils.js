"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCode = exports.Random = exports.DateFromTime = exports.Time = exports.StringToMap = exports.MapToString = exports.Json = exports.Folder = exports.SaveFile = exports.LoadFile = exports.Print = exports.FolderType = exports.TypePrint = exports._debug = exports._dbVersion = exports._path = exports._root = void 0;
const path_1 = require("path");
const _1 = require(".");
const fs = require('fs');
exports._root = process.cwd();
exports._path = Dir();
exports._dbVersion = 2;
exports._debug = true;
var TypePrint;
(function (TypePrint) {
    TypePrint[TypePrint["info"] = 0] = "info";
    TypePrint[TypePrint["succes"] = 1] = "succes";
    TypePrint[TypePrint["error"] = 2] = "error";
    TypePrint[TypePrint["alert"] = 3] = "alert";
    TypePrint[TypePrint["default"] = 4] = "default";
    TypePrint[TypePrint["debug"] = 5] = "debug";
})(TypePrint = exports.TypePrint || (exports.TypePrint = {}));
var FolderType;
(function (FolderType) {
    FolderType[FolderType["root"] = 0] = "root";
    FolderType[FolderType["local"] = 1] = "local";
    FolderType[FolderType["plugin"] = 2] = "plugin";
})(FolderType = exports.FolderType || (exports.FolderType = {}));
function Dir() {
    if (fs.existsSync(`${(0, path_1.join)(exports._root, '..', 'plugins', `sleeping`)}/package.json`))
        return (0, path_1.join)(exports._root, '..', 'plugins', `sleeping`);
    if (fs.existsSync(`${(0, path_1.join)(exports._root, '..', 'plugins', `sleeping-main`)}/package.json`))
        return (0, path_1.join)(exports._root, '..', 'plugins', `sleeping-main`);
    return `../node_modules/@bdsx/sleeping`;
}
/**
 * print to console
 * @param message Message
 * @param type Type
 */
function Print(message, type = TypePrint.default) {
    if (!_1.about)
        return;
    _1.about.name = _1.about.name.replace("@bdsx/", "");
    switch (type) {
        case TypePrint.info: {
            console.info(`[${_1.about.name}] `.magenta + message.blue);
            break;
        }
        case TypePrint.succes: {
            console.log(`[${_1.about.name}] `.magenta + message.green);
            break;
        }
        case TypePrint.error: {
            console.error(`[${_1.about.name}] `.magenta + message.red);
            break;
        }
        case TypePrint.alert: {
            console.warn(`[${_1.about.name}] `.magenta + message.yellow);
            break;
        }
        case TypePrint.debug: {
            if (exports._debug)
                console.warn(`[${_1.about.name}] `.magenta + message.magenta);
            break;
        }
        case TypePrint.default: {
            console.log(`[${_1.about.name}] `.magenta + message.white);
            break;
        }
    }
}
exports.Print = Print;
/**
 *
 * @param path Ruta
 * @param name Nombre de archivo
 * @param type Tipo de archivo, Por defecto JSON
 * @param default_data Regresa el texto colocado si el archivo original esta vacio
 * @returns string
 */
function LoadFile(Folder, path, name, type = "json", default_data = "{}") {
    switch (Folder) {
        case FolderType.root:
            path = `${(0, path_1.join)(exports._root, '..')}/${path}`;
            break;
        case FolderType.plugin:
            path = `${exports._path}/${path}`;
            break;
    }
    try {
        if (fs.existsSync(`${path}${name}.${type}`)) {
            Print(`Load file ${name}.${type} data is ok`, TypePrint.debug);
            return fs.readFileSync(`${path}${name}.${type}`, 'utf8');
        }
    }
    catch (err) {
        Print(err, TypePrint.error);
    }
    Print(`Load file ${name}.${type} data is default`, TypePrint.debug);
    return default_data;
}
exports.LoadFile = LoadFile;
/**
 *
 * @param path Ruta
 * @param name Nombre de archivo
 * @param data Data
 * @param type Tipo de archivo, Por defecto JSON
 */
function SaveFile(Folder, path, name, data, type = "json") {
    switch (Folder) {
        case FolderType.root:
            path = `${(0, path_1.join)(exports._root, '..')}/${path}`;
            break;
        case FolderType.plugin:
            path = `${exports._path}/${path}`;
            break;
    }
    try {
        fs.writeFileSync(`${path}${name}.${type}`, data);
        Print(`Data saved in file ${name}.${type}`, TypePrint.debug);
    }
    catch (error) {
        Print(error, TypePrint.error);
    }
}
exports.SaveFile = SaveFile;
/**
 *
 * @param path Ruta
 * @param name Nombre de carpeta
 */
function Folder(Folder, path, name) {
    switch (Folder) {
        case FolderType.root:
            path = `${(0, path_1.join)(exports._root, '..')}/${path}`;
            break;
        case FolderType.plugin:
            path = `${exports._path}/${path}`;
            break;
    }
    try {
        if (!fs.existsSync(`${path}${name}`)) {
            fs.mkdirSync(`${path}${name}`);
            Print(`Create folder ${name}`, TypePrint.debug);
        }
    }
    catch (err) {
        Print(err, TypePrint.error);
    }
}
exports.Folder = Folder;
function Json(data) {
    if (typeof data == "string")
        return JSON.parse(data);
    return JSON.stringify(data, null, 4);
}
exports.Json = Json;
/**
 * Convert Map to String
 * @param map Map<any,any>
 * @returns string
 */
function MapToString(map) {
    let list = [];
    for (var data of map.values()) {
        list.push(data);
    }
    return Json({ version: exports._dbVersion, data: list });
}
exports.MapToString = MapToString;
/**
 * Return Map
 * @param data Data
 * @param key Primary Key
 * @returns
 */
function StringToMap(data, key) {
    const map = new Map();
    const json = Json(data);
    if (Object.keys(json).length > 0 && Object.keys(json.data).length > 0) {
        for (const _data of json.data) {
            for (const _key of Object.keys(_data)) {
                if (key == _key) {
                    map.set(_data[_key], _data);
                    break;
                }
            }
        }
    }
    return map;
}
exports.StringToMap = StringToMap;
/**
 * Return time
 * @param seconds add seconds in time
 * @returns
 */
function Time(seconds = 0) {
    return new Date().getTime() + (seconds * 1000);
}
exports.Time = Time;
/**
 * Return Date
 * @param time set time number
 * @returns get date
 */
function DateFromTime(time) {
    const date = new Date(time);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
exports.DateFromTime = DateFromTime;
/**
 * Return a random number
 * @param min Minimum number
 * @param max Maximum number
 * @returns number
 */
function Random(min, max = 0) {
    if (max == 0)
        return Math.floor(Math.random() * min);
    return min + Math.floor(Math.random() * max);
}
exports.Random = Random;
/**
 * Returns a random character string
 * @param length string max number
 * @returns string
 */
function getCode(length = 8) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.getCode = getCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBNEI7QUFDNUIsd0JBQTBCO0FBRTFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNaLFFBQUEsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFBLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNkLFFBQUEsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNmLFFBQUEsTUFBTSxHQUFHLElBQUksQ0FBQztBQUUzQixJQUFZLFNBT1g7QUFQRCxXQUFZLFNBQVM7SUFDakIseUNBQUksQ0FBQTtJQUNKLDZDQUFNLENBQUE7SUFDTiwyQ0FBSyxDQUFBO0lBQ0wsMkNBQUssQ0FBQTtJQUNMLCtDQUFPLENBQUE7SUFDUCwyQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQVBXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBT3BCO0FBRUQsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ2xCLDJDQUFJLENBQUE7SUFDSiw2Q0FBSyxDQUFBO0lBQ0wsK0NBQU0sQ0FBQTtBQUNWLENBQUMsRUFKVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUlyQjtBQUVELFNBQVMsR0FBRztJQUNSLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUEsV0FBSSxFQUFDLGFBQUssRUFBRSxJQUFJLEVBQUMsU0FBUyxFQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7UUFDdkUsT0FBTyxJQUFBLFdBQUksRUFBQyxhQUFLLEVBQUUsSUFBSSxFQUFDLFNBQVMsRUFBQyxVQUFVLENBQUMsQ0FBQztJQUNsRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFBLFdBQUksRUFBQyxhQUFLLEVBQUUsSUFBSSxFQUFDLFNBQVMsRUFBQyxlQUFlLENBQUMsZUFBZSxDQUFDO1FB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