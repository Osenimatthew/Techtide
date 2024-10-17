import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyD59_yC3eBaJ0ek_IF3j-beLZHusq-j_jQ",
  authDomain: "techtide-927ee.firebaseapp.com",
  databaseURL: "https://techtide-927ee-default-rtdb.firebaseio.com",
  projectId: "techtide-927ee",
  storageBucket: "techtide-927ee.appspot.com",
  messagingSenderId: "288121692868",
  appId: "1:288121692868:web:d179539b5304185950df91",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

// Jamendo Client ID
const clientId = "a68b3ddc";
const audioPlayer = document.getElementById("audio-player");
let currentTrackIndex = 0;
let playlist = [];

function fetchPlaylists() {
  const url = `https://api.jamendo.com/v3.0/playlists/?client_id=${clientId}&format=json&limit=6`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayPlaylists(data.results);
    })
    .catch((error) => console.error("Error fetching playlists:", error));
}

// Display playlists on the page
function displayPlaylists(playlists) {
  const limitedPlaylists = playlists.slice(0, 4); // Limit to 4 playlists
  const playlistContainer = document.getElementById("playlist-container");
  playlistContainer.innerHTML = ""; // Clear previous playlists

  limitedPlaylists.forEach((playlist) => {
    const imageUrl =
      playlist.tracks && playlist.tracks.length > 0
        ? playlist.tracks[0].album_image
        : "images/playlist.webp";
    const playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    playlistItem.innerHTML = `
      <img src="${imageUrl}" alt="${playlist.name}" />
      <h3>${playlist.name}</h3>
    `;
    playlistContainer.appendChild(playlistItem);
  });
}

// Function to search for music using Jamendo API
window.searchMusic = searchMusic;
function searchMusic() {
  const query = document.getElementById("search-input").value.trim();

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=10&search=${encodeURIComponent(
    query
  )}`;

  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.results && data.results.length > 0) {
        displaySearchResults(data.results);
      } else {
        alert("No tracks found. Please try a different search term.");
      }
    })
    .catch((error) => console.error("Error fetching search results:", error));
}

// Function to play a track directly from search results
window.playTrackDirectly = playTrackDirectly;
function playTrackDirectly(index) {
  const track = window.searchTracks[index];

  if (track.audio) {
    audioPlayer.src = track.audio; // Set the audio source to the track's URL
    audioPlayer.style.display = "block"; // Show the audio player
    audioPlayer.play(); // Start playing the track
  }
}

// Function to display search results
function displaySearchResults(tracks) {
  const searchResultsDiv = document.getElementById("search-results");
  searchResultsDiv.innerHTML = ""; // Clear previous results

  window.searchTracks = tracks;
  console.log("Search Results Tracks:", window.searchTracks);

  tracks.forEach((track, index) => {
    const trackItem = document.createElement("div");
    trackItem.classList.add("search-result");
    trackItem.innerHTML = `
      <div class="track-info">
        <img src="${track.album_image}" alt="Album cover" class="album-cover"/>
        <div class="track-details">
          <p>${track.name} by ${track.artist_name}</p>
        </div>
      </div>
      <div>
      <button onclick="addToPlaylist(${index})">Add to Playlist</button>
      <button onclick="playTrackDirectly(${index})">Play</button>
      </div>
    `;
    searchResultsDiv.appendChild(trackItem);
  });
}

// Fetch the songs from Jamendo
function fetchSongs() {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=72`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.results); // Log the results to see if data is coming
      displaySongs(data.results);
    })
    .catch((error) => console.error("Error fetching songs:", error));
}

// Function to display songs in the music container
function displaySongs(songs) {
  const musicContainer = document.getElementById("container");

  if (!musicContainer) {
    console.error("Error: container not found");
    return;
  }

  musicContainer.innerHTML = ""; // Clear existing songs
  songs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.classList.add("song-item");

    songItem.innerHTML = `
      <img src="${song.album_image}" alt="${song.name}">
      <div class="track-details">
      <h3>${song.name}</h3>
      <p>Artist: ${song.artist_name}</p>
      </div>
      <div class="button-container">
      <button class="play-btn" onclick="playSong('${song.audio}')">Play</button>
      <button class="add-btn" onclick="addToPlaylist('${song.name}','${song.audio}', '${song.album_image}', '${song.artist_name}')">Add to Playlist</button>
      </div>
    `;
    musicContainer.appendChild(songItem);
  });
}

// Function to play a song
window.playSong = playSong;
function playSong(audioUrl) {
  if (!audioUrl) {
    console.error("Audio URL is undefined or invalid");
    return;
  }

  audioPlayer.src = audioUrl; // Set the audio source to the track's URL
  audioPlayer.style.display = "block";
  audioPlayer.load(); // Load the new song
  audioPlayer.play(); // Start playing
}

// Retrieve playlist from Firestore when the page loads
window.onload = async function () {
  console.log("Window loaded, attempting to fetch user and update playlist.");
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const playlistDocRef = doc(db, "playlists", userId);

    try {
      const playlistDoc = await getDoc(playlistDocRef);
      if (playlistDoc.exists()) {
        playlist = playlistDoc.data().tracks || [];
        console.log("Playlist data fetched:", playlist);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }
};

// Function to add songs to the playlist
window.onload = async function () {
  console.log("Window loaded, attempting to fetch user and update playlist.");
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const playlistDocRef = doc(db, "playlists", userId);

    try {
      const playlistDoc = await getDoc(playlistDocRef);
      if (playlistDoc.exists()) {
        playlist = playlistDoc.data().tracks || [];
        console.log("Playlist data fetched:", playlist);
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }
};

// Function to add songs to the playlist
window.addToPlaylist = addToPlaylist;
async function addToPlaylist(trackIndexOrName, trackAudio = null) {
  const user = auth.currentUser;

  // Ensure the user is logged in
  if (!user) {
    alert("You must be logged in to add to a playlist.");
    return;
  }

  const userId = user.uid;
  const playlistRef = doc(db, "playlists", userId);
  let track;

  // Determine if we're using a search result or a direct audio URL
  if (trackAudio === null) {
    track = window.searchTracks[trackIndexOrName];
    if (!track) {
      alert("Failed to add track to the playlist: Track not found.");
      return;
    }
    track.album_image = track.album_image || "images/playlist.webp"; // Fallback image
    track.artist_name = track.artist_name || "Unknown Artist"; // Fallback artist name
  } else {
    track = {
      name: trackIndexOrName,
      audio: trackAudio,
      album_image: "images/playlist.webp",
      artist_name: "Unknown Artist",
    };
  }

  // Error handling for missing track information
  if (!track.name || !track.audio) {
    alert("Failed to add track to the playlist: Track data is incomplete.");
    return;
  }

  try {
    // Retrieve the user's playlist data from Firestore
    const snapshot = await getDoc(playlistRef);
    let playlist = snapshot.exists() ? snapshot.data()?.tracks || [] : [];

    // Check if the track already exists in the playlist
    const exists = playlist.some(
      (existingTrack) => existingTrack.audio === track.audio
    );

    if (!exists) {
      // Add the track to the playlist
      playlist.push(track);
      await setDoc(playlistRef, { tracks: playlist }); // Update the playlist in Firestore
      alert("Song has been added to the playlist.");
    } else {
      alert("This track is already in the playlist.");
    }
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    alert("Failed to add song to the playlist.");
  }
}

// Function to play a track from the playlist
function playTrack(index) {
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  if (track.audio) {
    audioPlayer.style.display = "block"; // Show the audio player
    audioPlayer.src = track.audio; // Set the audio source to the track's URL
    audioPlayer.play(); // Start playing
  } else {
    console.error("Audio URL is undefined for track:", track); // Debugging log
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const menu = document.querySelector("#mobile_menu");
  const menulinks = document.querySelector(".nav_links");

  menu.addEventListener("click", function () {
    menu.classList.toggle("is-active");
    menulinks.classList.toggle("active");
    console.log(menu.classList);
  });

  console.log("DOM fully loaded. Now fetching playlists.");
  fetchPlaylists();
  fetchSongs();

  // Retrieve playlist from Firestore when the page loads
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const playlistDocRef = doc(db, "playlists", userId);

    const playlistDoc = await getDoc(playlistDocRef);
    if (playlistDoc.exists()) {
      playlist = playlistDoc.data().tracks || [];
      console.log("Playlist data:", playlist);
      setTimeout(updatePlaylistUI, 0); // Now it will be called only after data is retrieved
    }
  }
});
