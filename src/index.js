import { map } from "bluebird";
import { getEventHubClient } from "./services/eventhubs";
import {
    getBlobService, getBlobPathList, getBlob, getBlobMetadata
} from "./services/storage";
import { checkMandatory, sendBatch, getLogger } from "./services/utils";

const MANDATORY = ["containerName", "eventHubConnectionString", "eventHubName", "filePrefix", "storageAccessKey", "storageAccount"];

export const storageToEventHubs = async options => {
    const {
        batch,
        concurrency,
        containerName,
        eventHubConnectionString,
        eventHubName,
        filePrefix,
        formatEvent,
        nameFilter,
        storageAccessKey,
        storageAccount,
        verbose
    } = options;
    checkMandatory(options, MANDATORY);
    const logger = getLogger(verbose || false);
    const blobService = getBlobService(storageAccount, storageAccessKey);
    const ehClient = getEventHubClient(eventHubConnectionString, eventHubName);
    let blobPathList = (await getBlobPathList(blobService, containerName, filePrefix)).entries;
    if (nameFilter) {
        blobPathList = blobPathList.filter(nameFilter);
    }
    logger(`blobPathList len:${blobPathList.length}  prefix:${filePrefix}`);
    const events = { data: [], count: 0 };
    const sendBatchFunction = ehClient.sendBatch.bind(ehClient);
    logger(`start getBlobs with concurrency level${concurrency || 10}`);
    await map(
        blobPathList,
        async item => {
            const { metadata } = await getBlobMetadata(blobService, containerName, item.name);
            const value = await getBlob(blobService, containerName, item.name);
            const e = formatEvent ? formatEvent(value, metadata) : { body: { ...metadata, payload: value, filename: item.name } };
            return batch ? sendBatch(e, events, logger, sendBatchFunction) : ehClient.send(e);
        },
        { concurrency: concurrency || 10 }
    );
    if (batch && events.data.length > 0) {
        sendBatch(null, events, logger, sendBatchFunction);
    }
    logger(`storageToEventHubs completed - loaded ${events.count} elements`);
    return true;
};
