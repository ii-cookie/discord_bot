import path from 'path';
import getAllFiles from '../utils/getAllFiles.js';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const loadEventFolders = (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');    //no clue why doesnt work
    const eventFolders = getAllFiles('./src/events', true);

    console.log(eventFolders);
};

export default loadEventFolders;