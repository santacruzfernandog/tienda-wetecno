import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'


// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDFwu26PFMuQJCCTVPiVbI5RavtKqjMVng",
    authDomain: "wetecno-88fcd.firebaseapp.com",
    projectId: "wetecno-88fcd",
    storageBucket: "wetecno-88fcd.appspot.com",
    messagingSenderId: "666216931073",
    appId: "1:666216931073:web:a0f99ff2254bdfa00ec500"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth()
const db = firebase.firestore()
const storage = firebase.storage()

export {auth, db, storage, firebase}