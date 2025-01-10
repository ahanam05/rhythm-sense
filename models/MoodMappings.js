const moodMappings = {
    veryNegative: {
        range: [-5, -3],
        artists: ['Radiohead', 'Linkin Park', 'Nirvana', 'Billie Eilish', 'Nine Inch Nails', 'Joy Division', 'My Chemical Romance', 'Metallica', 'System of a Down', 'Black Sabbath'],
        genres: ['grunge', 'metal', 'post rock', 'doom metal']
    },
    negative: {
        range: [-3, -1],
        artists: ['Adele', 'Lana Del Rey', 'Bon Iver', 'The Smiths', 'Elliott Smith', 'Cigarettes After Sex', 'The National', 'Mazzy Star', 'Fleetwood Mac', 'Damien Rice'],
        genres: ['indie', 'folk', 'alternative', 'acoustic']
    },
    neutral: {
        range: [-1, 1],
        artists: ['Coldplay', 'Ludovico Einaudi', 'Olivia Rodrigo', 'The Cinematic Orchestra', 'Aurora', 'Hans Zimmer', 'Yiruma', 'Explosions in the Sky', 'Enya'],
        genres: ['ambient', 'classical', 'pop', 'instrumental']
    },
    positive: {
        range: [1, 3],
        artists: ['Pharrell Williams', 'Bruno Mars', 'Sufjan Stevens', 'John Mayer', 'Tame Impala', 'Michael Bublé', 'Ed Sheeran', 'The Lumineers', 'OneRepublic', 'Alicia Keys'],
        genres: ['pop', 'funk', 'rock', 'r&b']
    },
    veryPositive: {
        range: [3, 5],
        artists: ['Daft Punk', 'Calvin Harris', 'Avicii', 'Taylor Swift', 'The Weeknd', 'Twenty One Pilots', 'ABBA', 'Queen', 'Dua Lipa', 'The Chainsmokers'],
        genres: ['dance', 'edm', 'pop', 'disco']
    }
};

module.exports = moodMappings;