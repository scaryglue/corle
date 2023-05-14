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
      <div className="w-full max-w-xl flex mx-auto">
        <AsyncSelect className="w-full placeholder-gray-400 text-gray-900 p-4"
          loadOptions={loadOptions}
          placeholder="Type in the song!"
        />
      </div>
      <div class="gap-x-8 w-full max-w-xl flex mx-auto justify-center items-stretch">
        <div>
          <button
            type="button"
            class="self-center inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]">
            GUESS
          </button>
        </div>
        <div class="self-center">
          <button>
            <svg class="w-5 h-5 fill-current block" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <polygon id="Rectangle-161" points="4 4 16 10 4 16"></polygon>
            </svg>
          </button>
        </div>
        <div>
          <button
            type="button"
            class="self-center inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]">
            SKIP (+5S)
          </button>
        </div>
      </div>
    </div>
  );
}


function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export default App;
