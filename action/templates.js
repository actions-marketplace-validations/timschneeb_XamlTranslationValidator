const fs = require('fs');
const path = require('path');

module.exports =
    {
        build_summary
    }

function replace_var(input, key, value){
    return input.toString().replace(`%{${key.toUpperCase()}}`, value);
}

function build_summary(out_path, results, note = ""){
    let table = "";
    const template_row = fs.readFileSync(path.resolve(__dirname, 'templates/summary_row.md'));

    results.forEach(function (result) {
        let temp = replace_var(template_row, "lang", `${result.lang_code} (${result.lang_name})`);
        temp = replace_var(temp, "progress", `${result.percent}%`);
        temp = replace_var(temp, "missing", Object.keys(result.missing).length < 1 ? "No missing strings" :
            `${Object.keys(result.missing).length} missing string(s)`);
        temp = replace_var(temp, "link", `<a href="${result.lang_code}.md">View details</a>`);
        table = table.concat(temp);
    });

    const template = fs.readFileSync(path.resolve(__dirname, 'templates/summary.md'));
    let temp = replace_var(template, "note", note);
    temp = replace_var(temp, "table", table);

    fs.mkdirSync(path.dirname(out_path));
    fs.writeFileSync(out_path, temp);

    console.log(temp)
}

function build_details(out_dir, results){
    const details_row = fs.readFileSync(path.resolve(__dirname, 'templates/details_row.md'));
    const details = fs.readFileSync(path.resolve(__dirname, 'templates/details.md'));

    results.forEach(function (result) {
        let table_rows = "";

        Object.keys(result.missing).forEach(key => {
            let temp = replace_var(details_row, "key", `\`${key}\``);
            temp = replace_var(temp, "orig", result.missing[key]);
            table_rows = table_rows.concat(temp);
        })

        let temp = replace_var(details, "lang", `${result.lang_code} (${result.lang_name})`);
        temp = replace_var(temp, "table", table_rows);
        temp = replace_var(temp, "progress", `${result.percent}%`);
        temp = replace_var(temp, "missing", Object.keys(result.missing).length < 1 ? "No missing strings" :
            `${Object.keys(result.missing).length} missing string(s)`);

        fs.mkdirSync(out_dir);
        fs.writeFileSync(path.resolve(out_dir, `${result.lang_code}.md`), temp);
    });
}
