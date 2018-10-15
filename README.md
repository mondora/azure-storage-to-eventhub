# azure-storage-to-eventhub

Move data from azure storage to eventhub.

## usage

```javascript
import { storageToEventHubs } from "storageToEventHubs";
const option = {...};
const result = await storageToEventHubs(option)
```

## option

-   batch: [false] send data to eventhub as batches
-   concurrency: [10] concurrency level
-   containerName: (mandatory) name of the blob container
-   eventHubConnectionString: (mandatory) connection string for the eventhub
-   eventHubName: (mandatory) eventhub name
-   filePrefix: (mandatory) prefix to be applied to the blob search operation
-   formatEvent: function(value, metadata) that can be used to format data coming from blob storage, must return a json object
-   nameFilter: optional filtering function for blobstorage item
-   storageAccessKey: azure storage access key
-   storageAccount: azure storage account name
-   verbose[false]: show logs on console

## info

feel free to fork and/or contribute.
made with love in mondora.
