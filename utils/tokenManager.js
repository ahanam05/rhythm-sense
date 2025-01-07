let access_token = null;

module.exports = {
    setAccessToken: (token) => {
        access_token = token;
    },
    getAccessToken: () => access_token
};