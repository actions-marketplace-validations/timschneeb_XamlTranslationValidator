const core = require('@actions/core');
const github = require('@actions/github');
const glob = require("glob");
const fs = require("fs");
const path = require('path');
const xml2js = require('xml2js');
const templ = require("./templates.js");
const country = require('country-list');
const {promisify} = require('util');

const glob_async = promisify(glob)

async function load_xaml(xaml_path) {
    const xaml = fs.readFileSync(xaml_path);
    const content = await xml2js.parseStringPromise(xaml);

    const strings = new Map();
    const dict = content["ResourceDictionary"]["sys:String"];

    for (const entry of dict) {
        if(entry['_'].startsWith("Loc-"))
            continue;

        try {
            strings[entry['$']['x:Key']] = entry['_'];
        }
        catch (e) {
            core.warning(e);
        }
    }

    return strings;
}

class Result {

    /**
     * @constructs Result
     * @param {Object}   p         Properties
     * @param {String}   p.path    XAML file path
     * @param {number}   p.percent Translation progress
     * @param {String[]} p.missing Missing strings
     */
    constructor(p={}) {
        this.path = p.path;
        this.percent = p.percent;
        this.missing = p.missing;

        this.lang_code = path.parse(this.path).name.replace("_", "");
        this.lang_name = country.getName(this.lang_code);
    }
}

async function main() {
    const source = core.getInput('source-xaml');
    const translations = core.getInput('translation-xaml');
    const out_dir = core.getInput('output-directory');
    const out_name = core.getInput('output-name-summary');
    const note = core.getInput('custom-note');

    const files = await glob_async(translations, {"ignore":[source]});
    let master = await load_xaml(source);
    let results = [];

    for (const file of files) {
        let result = new Result({ "path": file });
        core.debug(file)
        let strings = await load_xaml(file);

        let count = 0;
        let missing = [];

        Object.keys(master).forEach(k => {
            if(k in strings)
                count++;
            else
                missing.push(k);
        })

        result.missing = missing;
        result.percent = Math.floor(count / Object.keys(master).length * 100);
        results.push(result);
    }

    templ.build_summary(path.resolve(out_dir, out_name), results, note);
    core.debug(path.resolve(out_dir, out_name));
}

main().catch((error) => {
    core.setFailed(error.message);
});