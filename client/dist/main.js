"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const argparse_1 = require("argparse");
// const { version } = require('./package.json');
const parser = new argparse_1.ArgumentParser({
    description: 'Argparse example'
});
parser.add_argument('-v', '--version', { action: 'version' });
parser.add_argument('-f', '--foo', { help: 'foo bar' });
parser.add_argument('-b', '--bar', { help: 'bar foo' });
parser.add_argument('--baz', { help: 'baz bar' });
console.dir(parser.parse_args());
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // request to server localhost:5000
        const res = yield axios_1.default.get("http://localhost:9999/data");
        console.log(res.data);
    }
    catch (err) {
        console.log(err);
    }
});
main();
