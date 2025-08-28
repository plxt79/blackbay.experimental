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

// Request function
async function request() {
    const appid = document.getElementById("AppIDInput").value.trim();
    const type = document.querySelector('input[name="requestType"]:checked').value;

    if (!appid) {
        showToast('Please enter an AppID.', '#FF0000');
        document.getElementById("AppIDInput").style.borderColor = '#FF0000';
        setTimeout(() => document.getElementById("AppIDInput").style.borderColor = "", 1500);
        return;
    }

    // Decide webhook endpoint based on selection
    const endpoint = type === "request" ? '/api/request' : '/api/update';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appid })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error("Invalid response from server");
        }

        if (!res.ok) {
            showToast(data.error || 'An error occurred.', '#FF0000');
            document.getElementById("submitRequest").style.borderColor = '#FF0000';
            setTimeout(() => document.getElementById("submitRequest").style.borderColor = "", 1500);
            return;
        }

        if (data.message === "Game already available.") {
            showToast("Game already available.", "#FFFF00", 1500, "#000");
            document.getElementById("AppIDInput").style.borderColor = '#FFFF00';
            setTimeout(() => document.getElementById("AppIDInput").style.borderColor = "", 1500);
        } else {
            const successMsg = type === "request" ? "Game request sent!" : "Update request sent!";
            showToast(successMsg, '#00FF00', 1500, "#000");
            document.getElementById("submitRequest").style.borderColor = '#00FF00';
            setTimeout(() => document.getElementById("submitRequest").style.borderColor = "", 1500);
        }

    } catch (err) {
        showToast('Something went wrong.', '#FF0000');
        console.error(err);
    }
}

function back() {
    const url = document.getElementById("backBtn").title;
    window.location.href = url;
}


document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        request();
    }
});

function isMobile() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const userAgentMatch = /android|iphone|ipad|iPod|blackberry|iemobile|opera mini/i.test(ua);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 1;
    const isSmallScreen = Math.max(window.innerWidth, window.innerHeight) <= 800;
    return userAgentMatch || hasTouch || isSmallScreen;
}

if (isMobile()) {
    document.body.innerHTML = `
        <div style="color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;text-align:center;">
            <h2>⚠️ Access Denied</h2>
            <p>This app is only available on desktop.</p>
        </div>
    `;
}
