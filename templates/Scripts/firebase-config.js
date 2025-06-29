// Scripts/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyBmQcrMfpYRewRE3dsyPA-9FCvHnSSK4pc",
    authDomain: "brainwave-de13c.firebaseapp.com",
    projectId: "brainwave-de13c",
    storageBucket: "brainwave-de13c.firebasestorage.app",
    messagingSenderId: "652624833161",
    appId: "1:652624833161:web:d1b1a394c633e0abd8b458",
    measurementId: "G-BW90CKPVRN"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase Auth
  const auth = firebase.auth();

//   // Modify the existing Google Sign-In method to request Calendar scope
// function handleFirebaseGoogleSignIn() {
//   const provider = new firebase.auth.GoogleAuthProvider();
  
//   // Add Calendar scope to authorization request
//   provider.addScope('https://www.googleapis.com/auth/calendar');
  
//   firebase.auth().signInWithPopup(provider).then((result) => {
//       // This gives you a Google Access Token
//       const credential = result.credential;
//       const token = credential.accessToken;
      
//       // Store the token for later use with Google Calendar API
//       localStorage.setItem('googleAccessToken', token);
      
//       // Existing sign-in logic...
//       handleSuccessfulSignIn(result.user);
//   }).catch((error) => {
//       console.error('Google Sign-In Error', error);
//       document.getElementById('google-sign-in-error').style.display = 'block';
//   });
// }