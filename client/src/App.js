import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { set, ref, getDatabase } from "firebase/database";
import { getStorage, ref as sref, getDownloadURL } from "firebase/storage";
import { Howl } from "howler";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_ID,
  appId: process.env.REACT_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(
  app,
  process.env.REACT_APP_DATABASE
);
const storage = getStorage();

function App() {
  const downloadAudio = async (path) => {
    const uri = await getDownloadURL(sref(storage, path));

    const sound = new Howl({
      src: [uri],
      html5: true,
    });
    sound.load();
    sound.play();
    await timeout(5000);
    sound.stop();
  };
  //let date = "May 10, 2023";
  //let id = 0;

  //writeSong("Homesick by Dayseeker", id, date, "songs/file_example_MP3_700KB.mp3");
  //console.log('wrote song')

  return (
    <div>
      <button onClick={() => downloadAudio("songs/file_example_MP3_700KB.mp3")}>
        moin
      </button>
    </div>
  );
}

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

//function writeSong(name, id, date, path) {
//  set(ref(database, "songs/" + id), {
//    name: name,
//    date: date,
//    path: path
//  });
//}

export default App;
