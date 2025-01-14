require('dotenv').config();
const querystring = require('querystring');

const stateStore = new Map();
const client_id = process.env.CLIENT_ID;
const redirect_uri = "http://localhost:5001/mood";

const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const login_get = (req, res) => {
    const state = generateRandomString(16);
    stateStore.set(state, true);
    const scope = 'user-read-private user-read-email playlist-modify-private ugc-image-upload';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));

    console.log(`State stored: ${state}`);
    //compare this state sent with the state received in the redirect uri
}

module.exports = {
    login_get,
    stateStore
}