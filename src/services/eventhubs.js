import { EventHubClient } from "@azure/event-hubs";

export const MESSAGE_LIMIT = 220000;

export const getEventHubClient = (connectionString, name) => {
    return EventHubClient.createFromConnectionString(connectionString, name);
};
