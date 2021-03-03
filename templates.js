const fs = require('fs');
const path = require('path');

module.exports =
    {
        build_summary
    }

function replace_var(input, key, value){
    return input.replace(`%{${key.toUpperCase()}}`, value);
}

function build_summary(out_path, table, note = ""){
    const template = fs.readFileSync(out_path.resolve(__dirname, 'templates/summary.md'));
    let temp = replace_var(template, "note", note);
    temp = replace_var(temp, "table", table);

    fs.writeFileSync(out_path, temp);
}