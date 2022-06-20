import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

function copyFileSync(source: string, target: string) {
    var targetFile = target;
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source: string, target: string) {
    var files = [];

    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function copyEnvVariable() {
    const USDC_ADDRESS = process.env.USDC_ADDRESS;
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
    const env = `REACT_APP_USDC_ADDRESS=${USDC_ADDRESS}\nREACT_APP_TOKEN_ADDRESS=${TOKEN_ADDRESS}\nREACT_APP_FACTORY_ADDRESS=${FACTORY_ADDRESS}\n`;
    fs.writeFileSync("frontend/.env", env);
}

copyFolderRecursiveSync("artifacts", "frontend");
copyFolderRecursiveSync("typechain", "frontend");
copyEnvVariable();