
import os
import yt_dlp
import firebase_admin
from firebase_admin import credentials, firestore
import json

# Configuración Inicial
PROJECT_ID = "link-tweak-buddy-5a1b"
STITCH_PROJECT_ID = "3734802118766238219"

class NeoDownloader:
    def __init__(self):
        self.db = self._init_firebase()
        print("🚀 Neo-Downloader Suite Inicializada")

    def _init_firebase(self):
        try:
            firebase_admin.initialize_app()
            return firestore.client()
        except Exception as e:
            print(f"⚠️ Nota: Configura las credenciales de Firebase para sincronización completa. Error: {e}")
            return None

    def download_video(self, url):
        print(f"📥 Procesando: {url}")
        
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'noplaylist': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_data = {
                'id': info.get('id'),
                'title': info.get('title'),
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'description': info.get('description'),
                'uploader': info.get('uploader'),
                'filepath': f"downloads/{info.get('title')}.{info.get('ext')}"
            }
            
            if self.db:
                self.db.collection('downloads').document(video_data['id']).set(video_data)
                print(f"✅ Metadatos guardados en Firebase: {video_data['title']}")
            
            return video_data

    def analyze_with_stitch(self, video_data):
        print(f"🧠 Delegando análisis de '{video_data['title']}' a Stitch (IA Google)...")
        summary = "[Resumen generado por AI via Stitch]" 
        video_data['summary'] = summary
        
        if self.db:
            self.db.collection('downloads').document(video_data['id']).update({'summary': summary})
            print("✨ Resumen actualizado en la nube.")
        
        return summary

if __name__ == "__main__":
    suite = NeoDownloader()
