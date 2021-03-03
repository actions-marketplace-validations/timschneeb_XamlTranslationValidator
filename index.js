const core = require('@actions/core');
const github = require('@actions/github');
const glob = require("glob")
const fs = require("fs")
const path = require('path');
const xml2js = require('xml2js');
const templ = require("./templates.js")

function promisify(f) {
    return function(...args) {
        return new Promise( (resolve, reject) => f(resolve, reject, ...args) );
    }
}
const glob_async = promisify(glob)

function load_xaml(path) {
    const xaml = fs.readFileSync(path);
    const content = xml2js.parseStringPromise(xaml);
    const dict = content["ResourceDictionary"];
        return dict;
    let strings = new Map();

}
    
    
(async () => {
    const source = core.getInput('source-xaml');
    const translations = core.getInput('translation-xaml');
    const out_dir = core.getInput('output-directory');
    const out_name = core.getInput('output-name-summary');
    const note = core.getInput('custom-note');

    const [err, files] = await glob_async(translations, null);
    if(err !== null)
        throw new Error("Error while finding translation files (check translation-xaml):" + err);

    let master = load_xaml(source);

    templ.build_summary(path.resolve(out_dir, out_name), master, note)

})().catch((error) => {
    core.setFailed(error.message);
});