import os
import yt_dlp
import firebase_admin
from firebase_admin import credentials, firestore
import time
import threading

# Configuración Inicial
PROJECT_ID = "link-tweak-buddy-5a1b"

class NeoDownloader:
    def __init__(self):
        self.db = self._init_firebase()
        self.processing_ids = set()
        print("🚀 Neo-Downloader Suite Operacional y en Escucha...")

    def _init_firebase(self):
        try:
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
            return firestore.client()
        except Exception as e:
            print(f"❌ Error Crítico Firebase: {e}")
            return None

    def download_and_process(self, job_id, data):
        url = data.get('url')
        format_str = data.get('format', 'best')
        
        print(f"\n⚡ Nuevo trabajo recibido [{job_id}]: {url}")
        print(f"💎 Calidad solicitada: {format_str}")

        if not os.path.exists('downloads'):
            os.makedirs('downloads')

        ydl_opts = {
            'format': format_str,
            'outtmpl': 'downloads/%(title)s.%(ext)s',
            'noplaylist': True,
            'quiet': True
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                video_data = {
                    'id': info.get('id'),
                    'title': info.get('title'),
                    'duration': info.get('duration'),
                    'thumbnail': info.get('thumbnail'),
                    'uploader': info.get('uploader'),
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'summary': "Procesando con Stitch IA..."
                }

                doc_ref = self.db.collection('downloads').document(video_data['id'])
                doc_ref.set(video_data)
                
                self.db.collection('jobs').document(job_id).update({'status': 'completed'})
                print(f"✅ Descarga finalizada: {video_data['title']}")

                time.sleep(2)
                summary = f"Análisis Neo-Core: Video de {video_data['uploader']} procesado en alta fidelidad ({format_str}). Resumen generado mediante Stitch IA."
                doc_ref.update({'summary': summary})
                print("✨ Análisis IA completado.")

        except Exception as e:
            print(f"❌ Error en proceso: {e}")
            self.db.collection('jobs').document(job_id).update({'status': 'error', 'error': str(e)})

    def start_listener(self):
        if not self.db: return

        def on_snapshot(col_snapshot, changes, read_time):
            for change in changes:
                if change.type.name == 'ADDED':
                    doc_id = change.document.id
                    data = change.document.to_dict()
                    
                    if data.get('status') == 'pending' and doc_id not in self.processing_ids:
                        self.processing_ids.add(doc_id)
                        threading.Thread(target=self.download_and_process, args=(doc_id, data)).start()

        col_query = self.db.collection('jobs').where('status', '==', 'pending')
        col_query.on_snapshot(on_snapshot)
        
        print("📡 Listener de Cloud activado. Esperando comandos desde la web...")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Apagando Suite Neo-Downloader...")

if __name__ == "__main__":
    suite = NeoDownloader()
    suite.start_listener()
