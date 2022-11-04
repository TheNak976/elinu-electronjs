const fs = require("fs");
const path = require('path');



function saveData(data){
    fs.writeFileSync(path.join(process.cwd(), 'src/data/data.json'), data);
    console.log("Data Saved");
}

function getData(){
    return new Promise((resolve, reject) => {
        //Read the data
        fs.readFile(path.join(process.cwd(), 'src/data/data.json'), 'utf8', function (err, data) {
            // json data
            // parse json
            const jsonParsed = JSON.parse(data);

            // access elements
            resolve(jsonParsed);
        });
    });
}




module.exports = { saveData, getData};