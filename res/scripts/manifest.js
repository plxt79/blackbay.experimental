const follower = document.querySelector('.cursor-follower');
let mouseX = 0, mouseY = 0;
let posX = 0, posY = 0;
let rafId = null;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) animateFollower();
});

function animateFollower() {
    posX += (mouseX - posX) * 0.1;
    posY += (mouseY - posY) * 0.1;

    follower.style.left = posX + 'px';
    follower.style.top = posY + 'px';

    rafId = requestAnimationFrame(animateFollower);
}

document.addEventListener("mouseleave", () => {
    cancelAnimationFrame(rafId);
    rafId = null;
});

// Toast system
function showToast(message, backgroundColor = "#333", duration = 1500, textColor = "#000") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.backgroundColor = backgroundColor;
    toast.style.color = textColor;

    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), duration);
}

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(2)';
        follower.style.background = 'rgba(0, 0, 0, 0)';
        follower.style.border = '#0080ff 1px solid';
    });

    el.addEventListener('mouseleave', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.background = '#0080ff';
        follower.style.border = "none";
    });
});

// Generate AppID / Steam URL
async function generate() {
    const inputEl = document.getElementById("AppIDInput");
    const input = inputEl.value.trim();

    const urlMatch = input.match(/^https?:\/\/store\.steampowered\.com\/app\/(\d+)/);
    const isNumeric = /^\d+$/.test(input);
    const AppID = urlMatch ? urlMatch[1] : (isNumeric ? input : null);

    if (!AppID) {
        showToast("Invalid input.", "#FF0000");
        inputEl.style.borderColor = "#FF0000";
        setTimeout(() => { inputEl.style.borderColor = ""; }, 1500);
        return;
    }

    const btn = document.getElementById('genAppID');
    btn.disabled = true;

    try {
        const WORKER_URL = 'https://cdn.farhad-0ed.workers.dev';
        const response = await fetch(`${WORKER_URL}?appid=${encodeURIComponent(AppID)}&t=${Date.now() + 30000}`);

        /*const response = await fetch(`/api/download?appid=${encodeURIComponent(AppID)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }); OLD CODE*/

        if (!response.ok) {
            if (response.status === 404) return showToast("AppID unavailable", "#FF0000");
            if (response.status === 403) return showToast("Download link expired", "#FF0000");
            throw new Error(`HTTP error ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('zip')) {
            return showToast("AppID unavailable", "#FF0000");
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${AppID}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        showToast(`Generated App: ${AppID}`, "#00FF00");
    } catch (err) {
        showToast(err.message, "#FF0000");
    } finally {
        btn.disabled = false;
    }
}

// Navigation
function home() { window.location.href = "/"; }
function requestpage() { window.location.href = "/manifest/request"; }

// File Count
async function getFileCount() {
    try {
        const res = await fetch('/api/filecount');
        const data = await res.json();
        document.getElementById("file-count").textContent = data.count;
    } catch {
        document.getElementById("file-count").textContent = "Error";
    }
}
getFileCount();

// Disable dev tools + right-click
document.addEventListener('keydown', e => {
    const key = e.key.toUpperCase();
    if (key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key))) {
        e.preventDefault();
        showToast("Action blocked", "#FF0000");
    }
    if (key === 'Enter' && !document.getElementById('genAppID').disabled) generate();
});

document.addEventListener('contextmenu', e => {
    e.preventDefault();
    showToast("Right-click disabled", "#FF0000");
});

// Mobile check
if ((/android|iphone|ipad|iPod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)) ||
    (navigator.maxTouchPoints > 1 || Math.max(window.innerWidth, window.innerHeight) <= 800)) {
    document.body.innerHTML = `<div style="color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;text-align:center;">
        <h2>⚠️ Access Denied</h2>
        <p>This app is only available on desktop.</p>
    </div>`;
}
