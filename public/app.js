// Firebase Configuration
const firebaseConfig = {
    projectId: "link-tweak-buddy-5a1b",
    appId: "1:2698376126:web:8f88fc3db2a919cafcffef",
    storageBucket: "link-tweak-buddy-5a1b.firebasestorage.app",
    apiKey: "AIzaSyDpHDZAkIEIVc6kpILu5S3j_JLxfDQCZU8",
    authDomain: "link-tweak-buddy-5a1b.firebaseapp.com",
    messagingSenderId: "2698376126"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const historyGrid = document.getElementById('history-grid');

async function startDownload() {
    const urlInput = document.getElementById('video-url');
    const url = urlInput.value;
    const format = document.querySelector('input[name="format"]:checked').value;
    
    if (!url) {
        alert("Por favor, ingresa una URL válida.");
        return;
    }

    const btn = document.querySelector('.download-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Enviando a Motor Local...";
    btn.disabled = true;
    
    try {
        await addDoc(collection(db, "jobs"), {
            url: url,
            format: format,
            status: "pending",
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error:", error);
    }

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        urlInput.value = "";
    }, 1000);
}

function addCardToHistory(video, id) {
    let card = document.getElementById(`card-${id}`);
    const isNew = !card;
    
    if (isNew) {
        card = document.createElement('div');
        card.id = `card-${id}`;
        card.className = 'video-card animate';
        historyGrid.prepend(card);
    }

    const durationStr = typeof video.duration === 'number' 
        ? Math.floor(video.duration / 60) + ":" + (video.duration % 60).toString().padStart(2, '0')
        : video.duration || "N/A";

    card.innerHTML = `
        <div class="thumb" style="${video.thumbnail ? `background-image: url('${video.thumbnail}'); background-size: cover;` : 'background: linear-gradient(45deg, #121216, #2a2a35);'} display: flex; align-items:center; justify-content:center; height: 200px;">
            ${!video.thumbnail ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"><path d="M15 10L20 8V16L15 14M4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18Z"/></svg>` : ''}
        </div>
        <div class="card-content">
            <h3>${video.title || "Procesando..."}</h3>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; height: 2.4em; overflow: hidden;">${video.summary || "Generando resumen IA..."}</p>
            <div class="card-meta">
                <span>${durationStr}</span>
                <span class="badge" style="color: ${video.summary ? 'var(--primary)' : 'var(--secondary)'}">
                    ${video.summary ? 'Analizado por Stitch' : 'Descargando...'}
                </span>
            </div>
        </div>
    `;
}

const q = query(collection(db, "downloads"), orderBy("timestamp", "desc"), limit(20));
onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
            addCardToHistory(change.doc.data(), change.doc.id);
        }
    });
});

window.startDownload = startDownload;
