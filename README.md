# Rhythm Sense 🎵 - Mood-Based AI-Powered Music Playlist Generator

Rhythm Sense is a dynamic web application that creates personalized Spotify playlists based on your mood. It uses Natural Language Processing (NLP) to analyze user input, identify the mood, and generate playlists curated for that emotion. The app interacts with the Spotify API to create and display playlists that users can save to their Spotify accounts.

---

## **Features**
- 🌟 **User Authentication**: Log in with your Spotify account securely using OAuth 2.0.
- 🎭 **Mood Analysis**: Input a sentence describing your mood, and the app analyzes the sentiment.
- 🎶 **Personalized Playlists**: Curates a Spotify playlist based on your mood and adds it to your Spotify account.
- 🖼️ **Dynamic Web Interface**: Displays playlists and allows users to save them directly to their accounts.

---

## **Technologies Used**
### **Backend**
- **Node.js**: Server-side runtime for building scalable applications.
- **Express**: Backend framework for handling HTTP requests and routing.
- **Spotify Web API**: API for interacting with Spotify accounts and generating playlists.
- **NLP Library**: Sentiment.js for analyzing mood from text.

### **Frontend**
- **EJS (Embedded JavaScript)**: For rendering dynamic web pages.
- **HTML/CSS/JavaScript**: Used to structure and style the frontend.

## **Usage**
### **Log In**
- Click the **"Log in with Spotify"** button and authorize the app to access your Spotify account.

### **Describe Your Mood**
- Enter a sentence describing how you feel (e.g., _"I feel relaxed and happy"_).

### **View and Save Playlist**
- The app generates a playlist based on your mood and saves it to your Spotify account. 

### **Enjoy Your Music**
- Open Spotify to listen to your personalized playlist.

---

## **Deployed Version**
The live app is available at:
[https://rhythm-sense.onrender.com](https://rhythm-sense.onrender.com)

---

## **Known Issues**
- **Cold Starts**: The deployed app on Render might experience delays during initial loads due to server cold starts.
- **Spotify API Access Restrictions**:
  - The Spotify API used in this project is currently in **development mode**, which restricts usage to:
    - The app owner (developer account).
    - Up to 25 additional users listed in the app settings under **Users and Access** in the Spotify Developer Dashboard.
  - This limitation means only registered accounts can log in and use the app. To request access to try the app, please send an email to ahanam05@gmail.com. 
---

## **Future Enhancements**
- Add more NLP capabilities for advanced mood detection.
- Include playlist recommendations based on user listening history.
- Introduce a "share playlist" feature for social interactions.
- Create a mobile-friendly UI.
