from __future__ import unicode_literals
import youtube_dl
from pydub import AudioSegment
from requests import get
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import pytube
from pytube import YouTube
from pytube import Playlist

# example code from https://github.com/ytdl-org/youtube-dl/blob/master/README.md#embedding-youtube-dl

cred = credentials.Certificate("/Users/hamzaahmad/Documents/corle-75b82-firebase-adminsdk-iryqs-de1a259342.json")
firebase_admin.initialize_app(cred)


class MyLogger(object):
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)

def my_hook(d):
    if d['status'] == 'finished':
        print('Done downloading, now converting ...')

def search(arg):
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
        'logger': MyLogger(),
        'progress_hooks': [my_hook],
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        try:
            get(arg) 
        except:
            video = ydl.extract_info(f"ytsearch:{arg}", download=False)['entries'][0]
        else:
            video = ydl.extract_info(arg, download=False)

    return video



def downloadSong(title):
    filename = f'{title}.mp3'
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
        'logger': MyLogger(),
        'progress_hooks': [my_hook],
        'outtmpl': f'{title}.%(ext)s'
    }
    video = search(title)
    
    print(video)
    
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video['webpage_url']])
    
    thirty_seconds = 1000 * 30
    
    song = AudioSegment.from_mp3(filename)
    first_thirty_seconds = song[:thirty_seconds]
    
    first_thirty_seconds.export(filename, format="mp3")
    print(filename)

p = Playlist('https://www.youtube.com/playlist?list=PLIzfUwhkXefcHBekIVgx-2WD_j1r5bIT0')

for video in p.videos:
    stream = video.streams.get_by_itag(251)
    stream.download()