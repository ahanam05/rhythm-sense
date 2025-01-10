const express = require("express");
const router = express.Router();
const tokenManager = require('../utils/tokenManager');
//const moodMappings = require('../models/MoodMappings');
const moodMappings = require('../models/MoodMappings');
const Sentiment = require("sentiment");

//get the query from the mood.ejs page, analyse it using an nlp library, map the mood to genre and pick a playlist of 5 songgs
//create a playlist and save it. display it as an iframe. 

function getSentimentScore(text){
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);
    const normalizedScore = Math.max(-5, Math.min(result.score, 5));
    return normalizedScore;
}

async function getMoodCategory(sentimentScore) {
    console.log("In get category with score: ", sentimentScore);
    
    for (const [category, config] of Object.entries(moodMappings)) {
        //console.log("ranges checking: ", config.range[0], config.range[1]);
        if (
            sentimentScore >= config.range[0] &&
            sentimentScore < config.range[1]
        ) {
            console.log("Picked category: ", config.range[0], config.range[1])
            return { category, config };
        }
    }
    return {
        category: 'neutral',
        config: moodMappings.neutral
    };
}

async function getUserId(access_token) {
    try {
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        })

        const data = await response.json();
        const userID = data.id;
        return userID;
    }
    catch (err) {
        console.log("Error occurred in fetching user id: ", err);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateRandomSearchCombinations(config, count) {
    const combinations = [];
    const artists = [...config.artists];
    const genres = [...config.genres];

    shuffleArray(artists);
    shuffleArray(genres);

    for (let i = 0; i < count; i++) {
        combinations.push({
            artist: artists[i % artists.length],
            genre: genres[i % genres.length]
        });
    }

    return combinations;
}

async function findTracksByMood(sentimentScore, access_token, numberOfTracks = 5) {
    try {
        const { config } = await getMoodCategory(sentimentScore);
        const matchedTracks = [];
        const trackURIs = [];
        const trackIDs = new Set();

        const searchCombinations = generateRandomSearchCombinations(config, numberOfTracks * 2);
        //console.log("Search combinations: ", searchCombinations);

        for (const combo of searchCombinations) {
            //console.log("Combo: ", combo);
            if (matchedTracks.size >= numberOfTracks) break;

            const baseURL = 'https://api.spotify.com/v1/search';
            const query = encodeURIComponent(`artist:${combo.artist} genre:${combo.genre}`);
            const limit = 3;
            const type = 'track';
            const url = `${baseURL}?q=${query}&type=${type}&limit=${limit}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: 'Bearer ' + access_token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const searchResult = await response.json();
            //console.log("Search result: ", searchResult);

            if(!searchResult){
                continue;
            }

            if (searchResult.tracks.items.length > 0) {
                const randomTrack = searchResult.tracks.items[
                    Math.floor(Math.random() * searchResult.tracks.items.length)
                ];
                //console.log(randomTrack);

                if(!trackIDs.has(randomTrack.id)){
                    trackIDs.add(randomTrack.id);
                    matchedTracks.push({
                        name: randomTrack.name,
                        artist: randomTrack.artists[0].name,
                        id: randomTrack.id,
                        url: randomTrack.external_urls.spotify,
                        popularity: randomTrack.popularity
                    });
                    trackURIs.push(randomTrack.uri);
                }
            }
        }

        return { trackIDs: Array.from(trackIDs), matchedTracks, trackURIs};

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getProfile(access_token) {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  
    const data = await response.json();
    console.log("Display name: ", data.display_name);
    return data.display_name;
}

//how to make the playlist private?
async function createPlaylist(access_token) {
    //give different name depending on mood?
    try {
        const userID = await getUserId(access_token);
        console.log("User ID: ", userID);
        const response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: 'Bearer ' + access_token
            },
            body: JSON.stringify({
                name: "your new fav songs",
                description: "some tracks curated for your current vibe",
                public: false
            })
        })
        const data = await response.json();
        //spotify playlist id
        console.log("Playlist ID: ", data.id);
        return data.id;
    }
    catch (err) {
        console.log("Error occurred: ", err);
    }
}

async function addToPlaylist(playlistID, access_token, trackURIs){
    try{
        if (!trackURIs || trackURIs.length === 0) {
            throw new Error("No track URIs provided.");
        }

        console.log("User ID: ", playlistID);
        console.log("Playlist ID: ", playlistID);
        console.log("Track URIs: ", trackURIs);

        const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: 'Bearer ' + access_token
            },
            body: JSON.stringify({
                "uris": trackURIs,
                "position": 0
            })
        });

        //console.log(`Response status: ${response.status} - ${response.statusText}`);
        if (response.status === 201) {
            console.log("Tracks added successfully");
        } else {
            const data = await response.json();
            console.log(data);
        }
    }
    catch(err){
        console.log("Error occurred while adding to playlist: ", err);
    }
}

router.post('/get-playlists', async (req, res) => {
    const { mood, state } = req.body;
    console.log('Mood:', mood);

    const access_token = tokenManager.getAccessToken();
    console.log("Received access token: ", access_token);
    
    const sentimentScore = getSentimentScore(mood);
    //console.log(sentimentScore);
    const {trackIDs, matchedTracks, trackURIs} = await findTracksByMood(sentimentScore, access_token, 10);
    console.log("Tracks: ", matchedTracks);
    //console.log("Track IDs: ", trackIDs);
    //console.log("Track URIs: ", trackURIs);

    const playlistID = await createPlaylist(access_token); 
    addToPlaylist(playlistID, access_token, trackURIs);
    const displayName = await getProfile(access_token);
    res.render('playlists', {playlistID, displayName});
})

module.exports = router;