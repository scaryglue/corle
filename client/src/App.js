import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { get, child, ref, getDatabase } from "firebase/database";
import { getStorage, ref as sref, getDownloadURL } from "firebase/storage";
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
              label: snapshot.child('title').val(),
              value: snapshot.child('title').val(),
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
  const [won, setWon] = useState(false)
  const [tries, setTries] = useState(0)
  const [loading, setLoading] = useState(false)
  const [noTries, setNoTries] = useState(false)
  const [lost, setLost] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [title, setTitle] = useState(null)

  const audioRef = useRef()
  const [songUrl, setUrl] = useState(null)


  useEffect(() => {
    document.body.style.backgroundColor = "#212121"

    const getSong = async () => {
      await get(child(database, 'currentSong/title')).then((snapshot) => {
        if (snapshot.exists()) {
          setTitle(snapshot.val());
          const soundPath = '/songs/' + snapshot.val() + '.mp3'
          getDownloadURL(sref(storage, soundPath)).then((url) => {
            setUrl(url)
          });
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }

    getSong()
  }, []);

  
  const play = async () => {
    setLoading(true)
    await audioRef.current.load()
    setLoading(false)
    audioRef.current.play()
    requestAnimationFrame(handleProgress)
    await timeout(5000 * (tries + 1))
    stop()
  }

  const stop = () => {
    audioRef.current.pause()
    audioRef.current.currentTime = 0;
  }


  function handleProgress() {
    setProgress(audioRef.current.currentTime / audioRef.current.duration);
    requestAnimationFrame(handleProgress);
  }

  const makeGuess = () => {
    if (won) {
      return;
    }
    if (input.label === title) {
      setWon(true)
    }
    else {
      if (tries === 6) {
        setLost(true)
      }
      else {
        setTries(tries + 1)
      }
    }
  }

  const skipTime = () => {
    if (won) {
      return;
    }
    if (tries === 6) {
      //tell the user that he/she has to guess
      setNoTries(true)
    }
    else {
      setSkipped(true)
      setTries(tries + 1)
    }
  }

  return (
    <div className="text-white">
      <div className="py-4 flex justify-center">
        <div className="w-1/4 h-6 bg-white rounded-full">
          <div
            className="h-6 bg-emerald-600 rounded-full"
            style={{ width: progress * 100 + "%" }}
          ></div>
        </div>
      </div>
      <div className="py-4 flex justify-center">
        <audio preload="true" ref={audioRef} src={songUrl}></audio>
        <button onClick={() => play()}>
          {loading ? <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
          </svg> : <div>▶</div>}
        </button>
      </div>
      <div className="w-full max-w-xl flex mx-auto">
        <AsyncSelect
          className="w-full placeholder-gray-400 text-gray-900 my-react-select-container"
          classNamePrefix="my-react-select"
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
        {noTries ? <div className="text-xs text-red-600 py-3">You have no tries left!</div> : null}
        <div>
          <button
            type="button"
            className="self-center inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100 hover:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:bg-neutral-100 focus:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-[0_8px_9px_-4px_rgba(203,203,203,0.3),0_4px_18px_0_rgba(203,203,203,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(251,251,251,0.3)] dark:hover:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:focus:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)] dark:active:shadow-[0_8px_9px_-4px_rgba(251,251,251,0.1),0_4px_18px_0_rgba(251,251,251,0.05)]" onClick={() => skipTime()
            }
          >
            SKIP (+5S)
          </button>
        </div>
      </div>
      {skipped ? <div className="py-4 text-xl flex w-full max-w-xl flex mx-auto justify-center font-bold">
        Added {tries * 5}s </div> : null}
      {won ? <div><div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold">
        <span role="img" aria-label="checkmark">✅</span>You won in: {tries === 0 ? <text>1 try!</text> : <text>{tries + 1} tries!</text>}<span role="img" aria-label="checkmark">✅</span></div>
        <div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold"> The song was: {title}</div> </div> : null}
      {lost ? <div><div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold">
        <span role="img" aria-label="cross">❌</span>You lost :(<span role="img" aria-label="cross">❌</span></div>
        <div className="py-4 text-2xl flex w-full max-w-xl flex mx-auto justify-center font-bold"> The song was: {title}</div> </div> : null}
    </div>
  );
}

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export default App;
