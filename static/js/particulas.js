const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let vw = window.innerWidth;
let vh = window.innerHeight;

function resize(){
    const dpr = window.devicePixelRatio || 1;

    vw = window.innerWidth;
    vh = window.innerHeight;

    canvas.width = vw * dpr;
    canvas.height = vh *dpr;

    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createTextParticles(
        currentMessage < messages.length
        ? messages[currentMessage]
        : ""
    );
}

/*resize();

window.addEventListener("resize", resize);*/

ctx.shadowColor = "#e6d9ff";
ctx.shadowBlur = 12;

const messages = [
    "Mi amor hoy",
    "es tu cumpleaños",
    "quiero ser",
    "el primero en dartelo",
    "nunca fui bueno para",
    "las palabras y",
    "tu lo sabes",
    "pero desde el corazón",
    "TE AMO DEMASIADO",
    "QUE TENGAS UN",
    "MUY HERMOSO DÍA",
    "pasala muy bien",
    "con tus amigos",
    "y familia",
    "estoy y siempre",
    "estare orgulloso",
    "de ti",
    "de todo lo que eres",
    "eres la chica",
    "más grandiosa",
    "que he conocido",
    "y que conoceré",
    "TE ADORO",
    "CON TODO MI SER 💜",
    "no te olvides de mi",
    "espero que aún",
    "me ames al menos",
    "un tantito JAJA",
    ":), es todo 💜🐈‍⬛"
];

let currentMessage = 0;
let particles = [];
let alpha = 0;
let fadingIn = true;
let holdTime = 0;

let exploding = false;
let explosionDone = false;

let formingHeart = false;
let holdingHeart = false;

function getResponsiveFontSize(){
    return Math.max(26, Math.min(vw * 0.08, 110));
}

function createTextParticles(text){
    ctx.clearRect(0, 0, vw, vh);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `bold ${getResponsiveFontSize()}px Arial`;

    ctx.fillText(text, vw / 2, vh / 2);

    const image = ctx.getImageData(0, 0, vw, vh);
    particles = [];

    for (let y = 0; y < vh; y += 4){
        for (let x = 0; x < vw; x += 4){
            const i = (y * vw + x) * 4;

            if (image.data[i + 3] > 180){
                particles.push({
                    x: Math.random() * vw,
                    y: Math.random() * vh,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 1.8 + 0.5
                });
            }
        }
    }

    ctx.clearRect(0, 0, vw, vh);

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

createTextParticles(messages[currentMessage]);

function explode(){
    formingHeart = true;
    
    const cx = vw / 2;
    const cy = vh / 2;

    particles.forEach((p, i) => {
        const t = (i / particles.length) * Math.PI * 2;

        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t)
                        - 5 * Math.cos(2 * t)
                        - 2 * Math.cos(3 * t)
                        - Math.cos(4 * t));

        const scale = Math.min(vw, vh) / 22;

        p.targetX = cx + hx * scale;
        p.targetY = cy + hy * scale
    });

    setTimeout(() => {
        formingHeart = false;
        holdingHeart = true;
    }, 2000);

    setTimeout(() => {
        holdingHeart = false;
        exploding = true;

        particles.forEach(p => {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 8 + 3;

            p.vx = Math.cos(angle) * force;
            p.vy = Math.sin(angle) * force;
        });

        setTimeout(() => window.close(), 3000);
    }, 4500);
}

function animate(){
    ctx.clearRect(0, 0, vw, vh);

    if (!formingHeart && !holdingHeart && !exploding){
        if (fadingIn){
            alpha += 0.02;

            if (alpha >= 1){
                alpha = 1;
                holdTime ++;

                if (holdTime > 150){
                    fadingIn = false;
                    holdTime = 0;
                }
            }
        } else {
            alpha -= 0.02;

            if (alpha <= 0){
                alpha = 0;
                fadingIn = true;
                currentMessage ++;

                if (currentMessage >= messages.length){
                    explode();
                } else {
                    createTextParticles(messages[currentMessage]);
                }
            }
        }
    }

    particles.forEach(p => {
        if (formingHeart){
            p.x += (p.targetX - p.x) * 0.07;
            p.y += (p.targetY - p.y) * 0.07;
        } else if (holdingHeart) {
            p.x += (p.targetX - p.x) * 0.03;
            p.y += (p.targetY - p.y) * 0.03;
        } else if (exploding) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
        } else {
            p.x += (p.baseX - p.x) * 0.08;
            p.y += (p.baseY - p.y) * 0.08;
        }

        const visibleAlpha = (formingHeart || holdingHeart || exploding) ? 1 : alpha;

        const gradient = ctx.createRadialGradient(
            p.x, p.y, 8,
            p.x, p.y, p.size * 3
        );

        gradient.addColorStop(0, `rgba(247, 240, 255, ${visibleAlpha})`);
        gradient.addColorStop(1, `rgba(184, 146, 240, ${visibleAlpha})`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;

        ctx.fill();
    });

    if (!explosionDone) requestAnimationFrame(animate);
}

resize();
window.addEventListener("resize", resize);

animate();