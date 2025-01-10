require("dotenv").config();
const querystring = require('querystring');
const { stateStore } = require('../controller/login');
const tokenManager = require('../utils/tokenManager');
const { get } = require("http");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://localhost:5001/mood";
let access_token;

mood_get = async (req, res) => {
    console.log(req.query);
    const {state, code, error } = req.query;

    if(error){
        console.log("Authorization error occurred: ", error);
        res.status(400).send('Authorization failed');
        return;
    }

    if(stateStore.has(state)){
        console.log('States match');
        stateStore.delete(state);
        res.render('mood', { state: state });
    }
    else{
        console.error('State mismatch');
        return res.status(400).send('State mismatch');
    }

    //POST request to get access token
    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
          },
          body: querystring.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri,
          }),
        });
    
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
        }
    
        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokenData;
        tokenManager.setAccessToken(access_token);
    
        console.log("Access token:", access_token);
        console.log("Refresh token:", refresh_token);
        console.log("Expires in:", expires_in);
        
      } catch (error) {
        console.error("Failed to exchange authorization code for access token:", error.message);
        res.status(500).send("Failed to exchange authorization code for access token.");
      }
    
}

module.exports = {
    mood_get,
    access_token
}