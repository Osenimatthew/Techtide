import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
  event.preventDefault();

  const email = document.getElementById("Email").value;
  const password = document.getElementById("Password").value;
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      alert("signinig in, please click ok");
      window.location.href = "index.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Sorry, there was an error");
    });
});

// google sign in authentication
document.getElementById("googlesignup").addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      // Successful Google login
      const user = result.user;
      alert("Logged in with Google");
      window.location.href = "index.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});

const facebookSignUpButton = document.getElementById("facebooksignup");

facebookSignUpButton.addEventListener("click", () => {
  const provider = new FacebookAuthProvider();
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      const user = result.user;
      alert(`Logged in with Facebook as: ${user.displayName}`);
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = FacebookAuthProvider.credentialFromError(error);

      alert(`Error: ${errorMessage}`);
    });
});
