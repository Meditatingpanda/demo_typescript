import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
});


const getContext = async () => {
    // TODO: implement getContext for recent history of conversation
}


const setContext = async () => {
    // TODO: implement setContext for recent history of conversation
}




export default redisClient;