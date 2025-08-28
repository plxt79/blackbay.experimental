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

// Navigation
function steamtools() { window.open("https://steamtools.net/download.html","_blank"); }
function manifestGen() { window.location.href="/manifest"; }

// Mobile block
function isMobile() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|iPod|blackberry|iemobile|opera mini/i.test(ua)
        || 'ontouchstart' in window
        || navigator.maxTouchPoints > 1
        || Math.max(window.innerWidth, window.innerHeight) <= 800;
}
if(isMobile()) {
    document.body.innerHTML = `<div style="color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;text-align:center;">
        <h2>⚠️ Access Denied</h2><p>This site is only available on desktop.</p></div>`;
}
