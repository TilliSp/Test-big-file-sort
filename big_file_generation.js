import crypto from 'crypto'
import fs from "fs"

const numberLines = process.argv[2];
const file = fs.createWriteStream("input.txt")
for (let i = 0; i < numberLines; i++) {
    file.write(crypto.randomUUID() + "\n")
}
file.write(crypto.randomUUID())
file.end()
