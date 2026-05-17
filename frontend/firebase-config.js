const firebaseConfig = {
    apiKey: "AIzaSyAW_Tkp795decIXCQll1Ko0GhT5Wd9MF4E",
    authDomain: "roots-on-route-66.firebaseapp.com",
    projectId: "roots-on-route-66",
    storageBucket: "roots-on-route-66.firebasestorage.app",
    messagingSenderId: "844388900587",
    appId: "1:844388900587:web:b3ebd45396a9245c45e8ae",
    measurementId: "G-8TZ0K9ZWXK"
};

firebase.initializeApp(firebaseConfig);

window.firebaseAuthTools = {
    auth: firebase.auth(),
    googleProvider: new firebase.auth.GoogleAuthProvider()
};
