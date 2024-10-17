import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD59_yC3eBaJ0ek_IF3j-beLZHusq-j_jQ",
  authDomain: "techtide-927ee.firebaseapp.com",
  databaseURL: "https://techtide-927ee-default-rtdb.firebaseio.com",
  projectId: "techtide-927ee",
  storageBucket: "techtide-927ee.appspot.com",
  messagingSenderId: "288121692868",
  appId: "1:288121692868:web:d179539b5304185950df91",
  measurementId: "G-KEWWL0R8KE",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase
const auth = getAuth();
const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const protectedContent = document.getElementById("hide-browse");
const protectedLink = document.getElementById("hide-playlist");

//check for auth status changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);
    loginButton.style.display = "none";
    protectedContent.style.display = "block";
    protectedLink.style.display = "block";
    logoutButton.style.display = "block";
    const uid = user.uid;
  } else {
    console.log("No user is logged in.");
    loginButton.style.display = "block";
    protectedContent.style.display = "none";
    protectedLink.style.display = "none";
    logoutButton.style.display = "none";
  }
});

// Login event listener
const submit = document.getElementById("submit");
if (submit) {
  submit.addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("Email").value;
    const password = document.getElementById("Password").value;

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then((userCredential) => {
        alert("Signing in, please click OK");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("Sorry, invalid login details");
      });
  });
}

// Google sign-in authentication
const googleSignInBtn = document.getElementById("googlesignin");
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        alert("Logged in with Google");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  });
}

// Facebook sign-in authentication
const facebookSignInBtn = document.getElementById("facebooksignin");
if (facebookSignInBtn) {
  facebookSignInBtn.addEventListener("click", () => {
    const provider = new FacebookAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        alert(`Logged in with Facebook`);
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  });
}

// Password reset
const reset = document.getElementById("reset");
if (reset) {
  reset.addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("Email").value;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Email sent.");
      })
      .catch((error) => {
        alert("Error, please input your email!");
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  const auth = getAuth();

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior

      // Call Firebase signOut function
      signOut(auth)
        .then(() => {
          console.log("User successfully logged out.");
          alert("You have logged out.");
        })
        .catch((error) => {
          console.error("Error logging out: ", error);
        });
    });
  }
});
