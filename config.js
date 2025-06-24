const firebaseConfig = {
    apiKey: "AIzaSyAqxAIXXERlUTtASEVG7NLjCPyDaHmaMfU",
    authDomain: "delta-community-f2068.firebaseapp.com",
    projectId: "delta-community-f2068",
    storageBucket: "delta-community-f2068.firebasestorage.app",
    messagingSenderId: "39615504175",
    appId: "1:39615504175:web:9ec5b0b8128fad119bcbda",
    databaseURL:"https://delta-community-f2068-default-rtdb.firebaseio.com"
 };
  
  const app = firebase.initializeApp(firebaseConfig)
  const auth = firebase.auth()
  const rtdb = firebase.database()
  const blogRef = rtdb.ref("blogs")
  const userProfilesRef = rtdb.ref("users")