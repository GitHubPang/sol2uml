"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writePng = exports.writeSVG = exports.writeDot = exports.writeSolidity = exports.convertDot2Svg = exports.writeOutputFiles = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sync_1 = __importDefault(require("@aduh95/viz.js/sync"));
const { convert } = require('convert-svg-to-png');
const debug = require('debug')('sol2uml');
const writeOutputFiles = async (dot, fileFolderAddress, contractName, outputFormat = 'svg', outputFilename) => {
    // If all output then extension is svg
    const outputExt = outputFormat === 'all' ? 'svg' : outputFormat;
    if (!outputFilename) {
        outputFilename =
            path_1.default.join(process.cwd(), contractName) + '.' + outputExt;
    }
    else {
        // check if outputFilename is a folder
        try {
            const folderOrFile = (0, fs_1.lstatSync)(outputFilename);
            if (folderOrFile.isDirectory()) {
                outputFilename =
                    path_1.default.join(process.cwd(), outputFilename, contractName) +
                        '.' +
                        outputExt;
            }
        }
        catch (err) { } // we can ignore errors as it just means outputFilename does not exist yet
    }
    if (outputFormat === 'dot' || outputFormat === 'all') {
        writeDot(dot, outputFilename);
        // No need to continue if only generating a dot file
        if (outputFormat === 'dot') {
            return;
        }
    }
    const svg = convertDot2Svg(dot);
    if (outputFormat === 'svg' || outputFormat === 'all') {
        await writeSVG(svg, outputFilename, outputFormat);
    }
    if (outputFormat === 'png' || outputFormat === 'all') {
        await writePng(svg, outputFilename);
    }
};
exports.writeOutputFiles = writeOutputFiles;
function convertDot2Svg(dot) {
    debug(`About to convert dot to SVG`);
    try {
        return (0, sync_1.default)(dot);
    }
    catch (err) {
        console.error(`Failed to convert dot to SVG. ${err.message}`);
        console.log(dot);
        throw new Error(`Failed to parse dot string`, { cause: err });
    }
}
exports.convertDot2Svg = convertDot2Svg;
function writeSolidity(code, filename = 'solidity') {
    const extension = path_1.default.extname(filename);
    const outputFile = extension === '.sol' ? filename : filename + '.sol';
    debug(`About to write Solidity to file ${outputFile}`);
    (0, fs_1.writeFile)(outputFile, code, (err) => {
        if (err) {
            throw new Error(`Failed to write Solidity to file ${outputFile}`, {
                cause: err,
            });
        }
        else {
            console.log(`Solidity written to ${outputFile}`);
        }
    });
}
exports.writeSolidity = writeSolidity;
function writeDot(dot, filename) {
    debug(`About to write Dot file to ${filename}`);
    (0, fs_1.writeFile)(filename, dot, (err) => {
        if (err) {
            throw new Error(`Failed to write Dot file to ${filename}`, {
                cause: err,
            });
        }
        else {
            console.log(`Dot file written to ${filename}`);
        }
    });
}
exports.writeDot = writeDot;
function writeSVG(svg, svgFilename = 'classDiagram.svg', outputFormats = 'png') {
    debug(`About to write SVN file to ${svgFilename}`);
    if (outputFormats === 'png') {
        const parsedFile = path_1.default.parse(svgFilename);
        if (!parsedFile.dir) {
            svgFilename = process.cwd() + '/' + parsedFile.name + '.svg';
        }
        else {
            svgFilename = parsedFile.dir + '/' + parsedFile.name + '.svg';
        }
    }
    return new Promise((resolve, reject) => {
        (0, fs_1.writeFile)(svgFilename, svg, (err) => {
            if (err) {
                reject(new Error(`Failed to write SVG file to ${svgFilename}`, {
                    cause: err,
                }));
            }
            else {
                console.log(`Generated svg file ${svgFilename}`);
                resolve();
            }
        });
    });
}
exports.writeSVG = writeSVG;
async function writePng(svg, filename) {
    // get svg file name from png file name
    const parsedPngFile = path_1.default.parse(filename);
    const pngDir = parsedPngFile.dir === '' ? '.' : path_1.default.resolve(parsedPngFile.dir);
    const pngFilename = pngDir + '/' + parsedPngFile.name + '.png';
    debug(`About to write png file ${pngFilename}`);
    try {
        const png = await convert(svg, {
            outputFilePath: pngFilename,
        });
        return new Promise((resolve, reject) => {
            (0, fs_1.writeFile)(pngFilename, png, (err) => {
                if (err) {
                    reject(new Error(`Failed to write PNG file to ${pngFilename}`, {
                        cause: err,
                    }));
                }
                else {
                    console.log(`Generated png file ${pngFilename}`);
                    resolve();
                }
            });
        });
    }
    catch (err) {
        throw new Error(`Failed to convert PNG file ${pngFilename}`, {
            cause: err,
        });
    }
    console.log(`Generated png file ${pngFilename}`);
}
exports.writePng = writePng;
//# sourceMappingURL=writerFiles.js.map