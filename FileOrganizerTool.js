const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const readline = require('readline');

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

r1.question('Please enter the directory path: ', async (directoryPath) => {
    try {
        // Check if the directory exists before proceeding
        await fsp.access(directoryPath);

        let directoryFiles = await fsp.readdir(directoryPath);

        // Make sure summary.txt exists, if not, create it
        const summaryFilePath = path.join(directoryPath, 'summary.txt');
        if (!fs.existsSync(summaryFilePath)) {
            fs.writeFileSync(summaryFilePath, ''); // Create empty summary.txt if not present
        }

        for (const fileName of directoryFiles) {
            let fileParts = fileName.split(".");

            // Only move if there is an extension (i.e., length > 1)
            if (fileParts.length > 1) {
                let fileExtension = fileParts[fileParts.length - 1];
                let extensionFolderPath = path.join(directoryPath, fileExtension);

                // Check if folder exists, and create it if not
                try {
                    await fsp.mkdir(extensionFolderPath, { recursive: true });
                } catch (err) {
                    console.error(`Failed to create folder ${extensionFolderPath}:`, err.message);
                    continue;
                }

                // Move file to the folder with extension
                await fsp.rename(
                    path.join(directoryPath, fileName),
                    path.join(extensionFolderPath, fileName)
                );

                // Log to summary.txt
                fs.appendFileSync(
                    summaryFilePath,
                    `The file ${fileName} is added to the folder ${fileExtension}\n`
                );
            } else {
                console.log(`Skipping file without an extension: ${fileName}`);
            }
        }

        console.log('Files have been organized successfully.');
    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        r1.close();
    }
});
