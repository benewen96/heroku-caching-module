require('dotenv').config();

const fetch = require('node-fetch');
const redis = require('redis');

const HttpsProxyAgent = require('https-proxy-agent');
const Promise = require('bluebird');

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

const cacheTtlSecs = 5 * 60; // 5 minutes

let agent;

if(process.env.HTTP_PROXY) {
  agent = new HttpsProxyAgent(process.env.HTTP_PROXY);
}

/*
REDIS STRUCTURE

Key: API request URL e.g. apps
Value: API request data

*/

const herokuCall = (request) => {
  return new Promise((resolve, reject) => {
    let callHeaders = {
      "Accept": "application/vnd.heroku+json; version=3",
      "Authorization": `Bearer ${process.env.HEROKU_API_TOKEN}`,
    };

    fetch(`https://api.heroku.com/${request}`, {
      method: 'GET',
      headers: callHeaders,
      agent,
    })
    .then((res) => {
      console.log(`Remaining tokens: ${res.headers._headers["ratelimit-remaining"]}`);
      return res.text();
    })
    .then((text) => {
      resolve(text);
    })
    .catch((err) => {
      reject(err);
    });
  });

}

const heroku = (request) => {
  return new Promise((resolve, reject) => {
    let lastModified;
    let redisResp;
    // Step 1: check Redis for this API request
    client.get(request, (err, resp) => {
      // if Redis has stored a result to this API request...
      if(resp) {
        console.log('found, returning from Redis cache')
        // return the cached data
        resolve(JSON.parse(resp));
      } else {
        // Step 2: if not cached, send the request to Heroku get it
        herokuCall(request)
        .then((herokuResp) => {
          // if Heroku responds with 200 status, update Redis cache before returning data
          console.log('new data cached to Redis');
          // store result in redis for one hour
          client.setex(request, 60*61, JSON.stringify(herokuResp));
          resolve(JSON.parse(herokuResp));

        })
        .catch((error) => {
          reject(error);
        });
      }
    });
  });
}

module.exports = heroku;
