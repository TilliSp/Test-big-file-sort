import fs from 'fs';
import lineReader from 'n-readlines';
import { once } from "events";
import { glob } from 'glob';

async function readBigFile(filename) {
    const stream = new lineReader(filename, {})

    let line;
    let lines = []
    let temps = []
    let i = 0

    while (line = stream.next()) {
        lines.push(line)
        if (lines.length > 1000) sortAndWriteChunk()
    }
    sortAndWriteChunk()

    function sortAndWriteChunk() {
        const tempFilename = `./tmp/${filename}.temp.${i}`
        temps.push(tempFilename)
        lines.sort()
        fs.writeFileSync(tempFilename, lines.join("\n"), "utf8")
        lines = []
        i++
    }

    return { filename, i, temps }
}

async function sorting({ filename, i, temps }) {
    let res;
    while (temps.length > 1) {
        const tempFilename = `./tmp/${filename}.temp.${i}`
        i++
        const output = fs.createWriteStream(tempFilename, "utf-8")
        const A = new lineReader(temps.pop())
        const B = new lineReader(temps.pop())
        temps.unshift(tempFilename)

        let a = A.next()
        let b = B.next()

        inner: while (a || b) {
            if (!a) {
                output.write(b)
                output.write("\n")
                b = B.next()
                continue inner
            }
            if (!b) {
                output.write(a)
                output.write("\n")
                a = A.next()
                continue inner
            }
            if (a.toString() < b.toString()) {
                output.write(a)
                output.write("\n")
                a = A.next()
            } else {
                output.write(b)
                output.write("\n")
                b = B.next()
            }
        }

        output.end();
        await once(output, "finish");
        res = output['path'];
    };
    return res;
};

async function clearTemp(pathName) {
    await fs.rename(pathName, `./output.txt`, function (err) {
        if (err) {
            console.log('ERROR: ' + err)
        } else {
            console.log('good')
        };
    });
    for (const file of await glob('**/input.txt.temp*')) {
        console.log(file)
        fs.unlink(file, (err) => {
            if (err) throw err;
            console.log(`Deleted ${file}`);
        });
    };
};

async function run() {
    const data = await readBigFile("input.txt");
    const res = await sorting(data);
    clearTemp(res);
};

run()
