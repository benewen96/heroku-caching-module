const heroku = require('./cacher');

heroku('apps')
.then((herokuResp) => {
  console.log(herokuResp);
})
.catch((err) => {
  console.log(err);
});
