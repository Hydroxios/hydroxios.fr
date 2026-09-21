import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

const args = process.argv.slice(2);

if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log('Usage : npm run pack:info -- "chemin/vers/pack.zip"');
} else if (args.length !== 1) {
    console.error('Usage : npm run pack:info -- "chemin/vers/pack.zip"');
    process.exitCode = 1;
} else {
    try {
        const hash = createHash("sha256");
        let size = 0;

        // Read in chunks so large archives do not have to fit in memory.
        for await (const chunk of createReadStream(args[0])) {
            hash.update(chunk);
            size += chunk.length;
        }

        console.log(JSON.stringify({ sha256: hash.digest("hex"), size }, null, 2));
    } catch (error) {
        console.error(`Impossible de lire le fichier : ${error.message}`);
        process.exitCode = 1;
    }
}
