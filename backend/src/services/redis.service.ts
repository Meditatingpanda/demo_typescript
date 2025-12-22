import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
});


const getContext = async () => {

}


const setContext = async () => {

}




export default redisClient;