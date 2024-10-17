import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const db = getFirestore();
const auth = getAuth();

let playlist = [];
let currentTrackIndex = -1;
const userPlaylistElement = document.getElementById("myplaylist");
const audioPlayer = document.getElementById("audio-player");

// Initially hide the audio player
audioPlayer.style.display = "none";

// Fetch the user's playlist when the user is logged in
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userId = user.uid;
    const playlistRef = doc(db, "playlists", userId);

    try {
      const playlistSnapshot = await getDoc(playlistRef);
      if (playlistSnapshot.exists()) {
        playlist = playlistSnapshot.data().tracks || [];
        console.log("Retrieved playlist:", playlist);
        setPlaylist(playlist);
      } else {
        console.log("No playlist found for this user.");
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  } else {
    console.log("User not logged in.");
  }
});

// Function to display the playlist
const setPlaylist = (tracks) => {
  let html = "";
  tracks.forEach((track, index) => {
    const li = `
      <div class="track-info">
        <img src="${track.album_image}" alt="Album cover" class="album-cover"/>
        <div class="track-details">
          ${track.name} by ${track.artist_name}
        </div>
        <div>
        <button onclick="playTrack(${index})">Play</button>
        <button onclick="removeTrack('${track.audio}')">Remove</button>
      </div>
      </div>
    `;
	  html += li;
  });

  userPlaylistElement.innerHTML = html;
};

// Function to play a track from the playlist
window.playTrack = function (index) {
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  if (track.audio) {
    audioPlayer.style.display = "block"; // Show the audio player
    audioPlayer.src = track.audio; // Set the audio source to the track's URL
    audioPlayer
      .play() // Start playing
      .catch((error) => {
        console.error("Error playing audio:", error); // Log any error
      });
  } else {
    console.error("Audio URL is undefined for track:", track); // Debugging log
  }
};

// Function to remove track from playlist
window.removeTrack = async function (audio, index) {
  console.log("Removing track with audio:", audio);

  // Remove the track from the local playlist array
  playlist.splice(index, 1);

  // Get the user ID from the authenticated user
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const playlistRef = doc(db, "playlists", userId);

    try {
      // Update the Firestore document with the new playlist
      await updateDoc(playlistRef, {
        tracks: playlist,
      });
      console.log("Playlist updated successfully.");

      // Re-render the playlist
      setPlaylist(playlist);
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  } else {
    console.log("User not logged in.");
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  const menu = document.querySelector("#mobile_menu");
  const menulinks = document.querySelector(".nav_links");

  menu.addEventListener("click", function () {
    menu.classList.toggle("is-active");
    menulinks.classList.toggle("active");
    console.log(menu.classList);
  });
});
