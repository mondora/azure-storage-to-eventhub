import locks from "semlocks";
import { MESSAGE_LIMIT } from "./eventhubs";

export const checkMandatory = (obj, fields) => {
    fields.forEach(element => {
        if (!obj[element]) throw new Error(`ERROR: ${element} is mandatory.`);
    });
};

export const sendBatch = (obj, batch, logger, send) => {
    const { data } = batch;
    const publish = (d, c) => {
        logger(`Pushing ${d.length}/${c} elements on the Eventhub`);
        send(d);
    };
    locks.acquire(batch, (err, release) => {
        if (err) {
            throw err;
        }
        if (obj) {
            if (JSON.stringify(data).length + JSON.stringify(obj).length > MESSAGE_LIMIT) {
                publish(data, batch.count);
                batch.pushed += data.length;
                data.length = 0;
            }
            batch.count += 1;
            data.push(obj);
        } else {
            publish(data, batch.count);
        }
        release();
    });
};

export const getLogger = enabled => {
    return enabled ? console.log : () => {};
};
