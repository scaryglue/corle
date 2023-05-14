import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { get, child, set, ref, getDatabase } from "firebase/database";
import { getStorage, ref as sref, getDownloadURL } from "firebase/storage";
import { Howl } from "howler";
import AsyncSelect from 'react-select/async';

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
const database = ref(getDatabase(app, process.env.REACT_APP_DATABASE));
const storage = getStorage();

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

const loadOptions = async (inputValue) => {
    return new Promise((resolve => {
            get(child(database, 'songs'))
                .then((snapshot) => {
                    const recommendedSongs = []
                    if (snapshot.exists()) {
                      snapshot.forEach(function (snapshot) {
                        const newVal = {
                          label: snapshot.key, value: snapshot.key
                        }
                        recommendedSongs.push(newVal)
                      })
                    }
                    else {
                      console.log('found no data')
                    }
                    return resolve(filterSongs(inputValue, recommendedSongs))
                }).catch((error) => {
                  console.error(error)
                })
              
        })
    )
}

const filterSongs = (inputValue, recommendedSongs) => {
  return recommendedSongs.filter((song) => 
  song.label.toLowerCase().includes(inputValue.toLowerCase()))
}


function App() {
  return (
    <div>
      <AsyncSelect
            loadOptions={loadOptions}
      />
    </div>
  );
}


function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export default App;
