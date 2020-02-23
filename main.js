const colors = require('colors');
const ExcelJS = require('exceljs');
const filename = "../Barrons Words.xlsx";
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let worksheet;
let words = [];
let setSize = 10;
let setsDone = 20;
let score = 0;
let questionsAsked = 0;
console.clear();

function exitHandler(options, exitCode) {
    console.log("\n\n\nScore: " + score + "/" + questionsAsked);
}

process.on('exit', exitHandler.bind(null, {
    cleanup: true
}));

process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));

process.on('SIGUSR1', exitHandler.bind(null, {
    exit: true
}));

process.on('SIGUSR2', exitHandler.bind(null, {
    exit: true
}));

process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
}));

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

async function loadData() {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(filename)
        .then(function () {
            worksheet = workbook.getWorksheet('Sheet1');
            worksheet.eachRow(function (row, rowNumber) {
                let values = row.values;
                words.push({
                    "word": values[1],
                    "meaning": values[2]
                });
            });
        });
}

async function fetchWord() {
    let setNumber = getRandomIntInclusive(1, setsDone);
    let wordNumber = getRandomIntInclusive(1, setSize);
    let wordToFetch = ((setNumber - 1) * setSize) + wordNumber;
    if (words.length > wordToFetch) {
        return words[wordToFetch];
    } else {
        return words[getRandomIntInclusive(0, words.length - 1)];
    }
}

async function askWord() {
    let wordData = await fetchWord();
    return new Promise(resolve => readline.question(wordData.word, ans => {
        readline.question(wordData.meaning, ans => {
            readline.question("Did you know the meaning?".brightYellow, ans => {
                questionsAsked++;
                wordData.response = ans;
                resolve(wordData);
            });
        });
    }));
}

async function game() {
    while (true) {
        let wordData = await askWord();
        if (wordData.response.toLowerCase() == "y") {
            // I know the word
            console.log(wordData.meaning.bold.green);
            score++;
        } else {
            // I don't know the word
            console.log(wordData.meaning.bold.red);
        }
        console.log("\n");
    }
}

async function main() {
    await loadData();
    game();
}

main();