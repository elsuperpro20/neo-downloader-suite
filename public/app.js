
const historyGrid = document.getElementById('history-grid');

const mockData = [
    {
        title: "Introduction to Quantum Computing",
        duration: "12:45",
        status: "Analizado por Stitch",
        color: "var(--primary)"
    },
    {
        title: "Next.js 15 Masterclass",
        duration: "45:10",
        status: "Guardado en Cloud",
        color: "#fff"
    }
];

function startDownload() {
    const url = document.getElementById('video-url').value;
    if (!url) {
        alert("Por favor, ingresa una URL válida.");
        return;
    }

    const btn = document.querySelector('.download-btn');
    btn.innerHTML = "Iniciando Motor...";
    btn.style.opacity = "0.7";
    
    setTimeout(() => {
        addCardToHistory({
            title: "Procesando: " + url.substring(0, 20) + "...",
            duration: "N/A",
            status: "Descargando Local...",
            color: "var(--secondary)"
        });
        btn.innerHTML = "Procesar Video";
        btn.style.opacity = "1";
        document.getElementById('video-url').value = "";
    }, 1500);
}

function addCardToHistory(video) {
    const card = document.createElement('div');
    card.className = 'video-card animate';
    card.innerHTML = `
        <div class="thumb" style="background: linear-gradient(45deg, #121216, #2a2a35); display: flex; align-items:center; justify-content:center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5">
                <path d="M15 10L20 8V16L15 14M4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18Z"/>
            </svg>
        </div>
        <div class="card-content">
            <h3>${video.title}</h3>
            <div class="card-meta">
                <span>${video.duration}</span>
                <span class="badge" style="color: ${video.color}">${video.status}</span>
            </div>
        </div>
    `;
    historyGrid.prepend(card);
}

window.onload = () => {
    historyGrid.innerHTML = '';
    mockData.forEach(addCardToHistory);
};
