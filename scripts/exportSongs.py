from __future__ import unicode_literals
import youtube_dl
from pydub import AudioSegment
from requests import get
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage
from pytube import YouTube
from pytube import Playlist
import os

# example code from https://github.com/ytdl-org/youtube-dl/blob/master/README.md#embedding-youtube-dl

cred = credentials.Certificate("/Users/hamzaahmad/Documents/corle-75b82-firebase-adminsdk-iryqs-de1a259342.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'corle-75b82.appspot.com',
    'databaseURL': 'https://corle-75b82-default-rtdb.europe-west1.firebasedatabase.app/'
})

bucket = storage.bucket()
ref = db.reference('songs')
currentMaxSong = 0

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

def exportPlaylist(link, bucket):
   p = Playlist(link)
   i = 0
   currentMaxSong = 0
   for video in p.videos:
        if not os.path.isfile(video.title +' by ' +video.author +'.mp3'):
            stream = video.streams.filter(only_audio=True).first()
            out_file = stream.download()
            new_file = video.title +' by ' +video.author + '.mp3'
            os.rename(out_file, new_file)
            song = AudioSegment.from_file(video.title +' by ' +video.author +'.mp3')
            thirty_seconds = 30 * 1000
            first_30_seconds = song[:thirty_seconds]
            first_30_seconds.export(video.title +' by ' +video.author +'.mp3')
            #song is exported with 30 second cut
            #upload to firebase storage:
            
            blob = bucket.blob('songs/' +video.title +' by ' +video.author +'.mp3')
            blob.upload_from_filename(video.title +' by ' +video.author +'.mp3')
            blob.make_public()

        #set database entry for search

        ref.update({
            i: {
                'title': video.title +' by ' +video.author,
                'path': 'songs/' +video.title +' by ' +video.author +'.mp3',
                'done': False
            }
        })

        i += 1
        currentMaxSong += 1

def getTitles(link):
    p = Playlist(link)
    for video in p.videos:
        print(video.title +' by ' +video.author)

def setDailySong():
    ref = db.reference('songs')
    snapshot = ref.order_by_key().get()
    i = 0

    for key in snapshot:
        print(ref.child('{0}'.format(i)).child('done').get())
        if ref.child('{0}'.format(i)).child('done').get() == False:
            print(key)
            newRef = db.reference('currentSong')

            newRef.set({
                'id': i,
                'title': ref.child('{0}'.format(i)).child('title').get(),
                'path': ref.child('{0}'.format(i)).child('path').get()
            })

            ref.child('{0}'.format(i)).update({
                'title': ref.child('{0}'.format(i)).child('title').get(),
                'path': ref.child('{0}'.format(i)).child('path').get(),
                'done': True
            })
            break
        i += 1


#getTitles('https://youtube.com/playlist?list=PLIzfUwhkXefcHBekIVgx-2WD_j1r5bIT0')
#exportPlaylist("https://youtube.com/playlist?list=PLIzfUwhkXefcHBekIVgx-2WD_j1r5bIT0", bucket)
setDailySong()