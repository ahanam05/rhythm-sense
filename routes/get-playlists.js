const express = require("express");
const router = express.Router();
const tokenManager = require('../utils/tokenManager');
const Sentiment = require("sentiment");

//get the query from the mood.ejs page, analyse it using an nlp library, map the mood to genre and pick a playlist of 5 songgs
//create a playlist and save it. display it as an iframe. 

//now - testing functionality of searching for songs and adding to playlist and saving it, later i'll do the nlp stuff

function getSentimentScore(text){
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);
    return result.score;
}

const moodMappings = {
    veryNegative: {
        range: [-5, -3],
        artists: ['Radiohead', 'Linkin Park', 'Nirvana', 'Billie Eilish'],
        genres: ['grunge', 'metal', 'post rock']
    },
    negative: {
        range: [-3, -1],
        artists: ['Adele', 'Lana Del Rey', 'Bon Iver', 'The Smiths'],
        genres: ['indie', 'folk', 'alternative']
    },
    neutral: {
        range: [-1, 1],
        artists: ['Coldplay', 'Ludovico Einaudi', 'Olivia Rodrigo', 'The Cinematic Orchestra'],
        genres: ['ambient', 'classical', 'pop']
    },
    positive: {
        range: [1, 3],
        artists: ['Pharrell Williams', 'Bruno Mars', 'Sufjan Stevens', 'John Mayer'],
        genres: ['pop', 'funk', 'rock']
    },
    veryPositive: {
        range: [3, 5],
        artists: ['Daft Punk', 'Calvin Harris', 'Avicii', 'Taylor Swift'],
        genres: ['dance', 'edm', 'pop']
    }
};

function getMoodCategory(sentimentScore) {
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

    // Shuffle both arrays
    shuffleArray(artists);
    shuffleArray(genres);

    // Create random combinations
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
        const { config } = getMoodCategory(sentimentScore);
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

router.get('/get-playlists', async (req, res) => {
    const access_token = tokenManager.getAccessToken();
    console.log("Received access token: ", access_token);
    res.render('playlists');

    
    const text = "I'm a little frustrated and impatient, waiting for things to fall into place.";
    const sentimentScore = getSentimentScore(text);
    //console.log(sentimentScore);
    const {trackIDs, matchedTracks, trackURIs} = await findTracksByMood(sentimentScore, access_token, 10);
    console.log("Tracks: ", matchedTracks);
    //console.log("Track IDs: ", trackIDs);
    //console.log("Track URIs: ", trackURIs);
    const playlistID = await createPlaylist(access_token); 
    addToPlaylist(playlistID, access_token, trackURIs);
})

module.exports = router;