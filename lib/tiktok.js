const axios = require('axios');
const searchVideo = async (keywords) => {
  var { data } = await axios(`https://disme-api.duongngu.repl.co/tiktok?search=${encodeURI(keywords)}`);
  return data
};

const getData = async (url) => {
  var { data } = await axios(`https://disme-api.duongngu.repl.co/tiktok?url=${url}`);
  return data
};
const getInfoUser = async (username) => {
  var { data } = await axios.get(`https://disme-api.duongngu.repl.co/tiktok?username=${username}`)
  return data
}

module.exports = {
  getData,
  searchVideo,
  getInfoUser
}