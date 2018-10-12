import { BlobService } from "azure-storage";
import fs from "fs";
import { promisify } from "util";

const readFileAsync = promisify(fs.readFile);
const unlinkSync = promisify(fs.unlink);

export const getBlobService = (azureAccount, azureAccessKey) => {
    return new BlobService(azureAccount, azureAccessKey);
};
export const getBlobPathList = (blobService, container, prefix) => {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmentedWithPrefix(container, prefix, null, {}, (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
};
export const getBlobToText = (blobService, container, blobName) => {
    return new Promise((resolve, reject) => {
        blobService.getBlobToText(
            container,
            blobName,
            {
                disableContentMD5Validation: true,
                timeoutIntervalInMs: 0,
                clientRequestTimeoutInMs: 0,
                useNagleAlgorithm: true,
                useTransactionalMD5: true
            },
            (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            }
        );
    });
};
export const getBlob = (blobService, container, blobName) => {
    if (blobName && blobName.indexOf(".gz") !== -1) {
        return new Promise((resolve, reject) => {
            const splitted = blobName.split("/");
            const filename = splitted[splitted.length - 1];
            blobService.getBlobToLocalFile(container, blobName, filename, async err => {
                if (err) {
                    reject(err);
                } else {
                    const content = await readFileAsync(filename, "utf8");
                    resolve(content);
                    await unlinkSync(filename);
                }
            });
        });
    }
    return getBlobToText(blobService, container, blobName);
};
export const getBlobMetadata = (blobService, container, blobName) => {
    return new Promise((resolve, reject) => {
        blobService.getBlobMetadata(container, blobName, (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
};
