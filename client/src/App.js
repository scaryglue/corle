import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { get, child, set, ref, getDatabase } from "firebase/database";
import { getStorage, ref as sref, getDownloadURL } from "firebase/storage";
import { Howl } from "howler";
import AsyncSelect from "react-select/async";

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

const loadOptions = async (inputValue) => {
  return new Promise((resolve) => {
    get(child(database, "songs"))
      .then((snapshot) => {
        const recommendedSongs = [];
        if (snapshot.exists()) {
          snapshot.forEach(function (snapshot) {
            const newVal = {
              label: snapshot.key,
              value: snapshot.key,
            };
            recommendedSongs.push(newVal);
          });
        } else {
          console.log("found no data");
        }
        return resolve(filterSongs(inputValue, recommendedSongs));
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

const filterSongs = (inputValue, recommendedSongs) => {
  return recommendedSongs.filter((song) =>
    song.label.toLowerCase().includes(inputValue.toLowerCase())
  );
};

function App() {
  const [input, setInput] = useState("")
  const [progress, setProgress] = useState(0)
  const [sound, setSound] = useState(null)
  const [won, setWon] = useState(false)
  const [tries, setTries] = useState(0)
  const soundPath = "songs/Burial Plot by Dayseeker.webm"
  const title = "Burial Plot by Dayseeker"


  useEffect(() => {
    getDownloadURL(sref(storage, soundPath)).then((url) => {
      setSound(
        new Howl({
          src: [url],
          html5: true,
        })
      );
    });
  }, []);

  const playAudio = async () => {
    sound.load();
    sound.play();
    requestAnimationFrame(handleProgress);
    await timeout(5000 * (tries + 1));
    sound.stop();
  };

  function handlePause() {
    sound.pause();
    cancelAnimationFrame(handleProgress, sound);
  }

  function handleProgress() {
    setProgress(sound.seek() / sound.duration());
    requestAnimationFrame(handleProgress);
  }

  const makeGuess = () => {
    if (input.label === title) {
      setWon(true)
    }
    else {
      setTries(tries + 1)
    }
  }


  return (
    <div className="bg-dark text-white">
      <div className="py-4 flex justify-center">
        <div className="w-1/4 h-6 bg-white rounded-full">
          <div
            className="h-6 bg-green rounded-full dark:bg-blue-500"
            style={{ width: progress * 100 + "%" }}
          ></div>
        </div>
      </div>
      <div className="py-4 flex justify-center">
        <button onClick={() => playAudio()}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />
          </svg>
        </button>
      </div>
      <div className="w-full max-w-xl flex mx-auto">
        <AsyncSelect
          className="w-full placeholder-gray-400 text-gray-900"
          loadOptions={loadOptions}
          placeholder="Type in the song!"
          onChange={(inputValue) => setInput(inputValue)}
        />
      </div>
      <div className="py-4 gap-x-8 w-full max-w-xl flex mx-auto justify-between items-stretch">
        <div>
          <button
            type="button"
            className="self-center inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]" onClick={() => makeGuess()}>
            GUESS
          </button>
        </div>
        <div>
          <button
            type="button"
            className="self-center inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]"
          >
            SKIP (+5S)
          </button>
        </div>
      </div>
      {won ? <div><div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold">
        You won </div>
        <div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold"> The song was: {title}</div> </div> : <div></div>}
    </div>
  );
}

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export default App;
