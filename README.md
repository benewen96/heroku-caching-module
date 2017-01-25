# heroku-caching-module
Caches Heroku API requests to a Redis store


## Environment variables

| Variable                    | Definition                                              |
|-----------------------------|---------------------------------------------------------|
| HTTP_PROXY (Optional)       | Proxy URL to enable developing behind corporate network |
| HEROKU_API_TOKEN (Required) | Your Heroku Platform API token                          |
| REDIS_URL (Required)        | e.g. redis://localhost:6379                             |

To run the sample: `node --use_strict sample.js`
