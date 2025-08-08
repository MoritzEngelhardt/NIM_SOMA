// Tutorial-Video als erstes definieren
const tutorialVideo = { id: 0, src: "SOMA_tutorial.mp4" };

// Die anderen Videos
const regularVideos = [
    { id: 1, src: "SOMA_audio_BEES.mp4" },
    { id: 2, src: "SOMA_audio_BULLYING.mp4" },
    { id: 3, src: "SOMA_audio_candle.mp4" },
    { id: 4, src: "SOMA_audio_car.mp4" },
    { id: 5, src: "SOMA_audio_climatechange.mp4" },
    { id: 6, src: "SOMA_audio_DATE.mp4" },
    { id: 7, src: "SOMA_audio_DRUGS.mp4" },
    { id: 8, src: "SOMA_audio_everydayheroes.mp4" },
    { id: 9, src: "SOMA_audio_LAUNDRY.mp4" },
    { id: 10, src: "Soma_audio_MENTALHEALTH.mp4" },
    { id: 11, src: "SOMA_audio_Möbel.mp4" },
    { id: 12, src: "SOMA_audio_READING.mp4" },
    { id: 13, src: "SOMA_audio_RENT.mp4" }, // Error behoben
    { id: 14, src: "SOMA_audio_SPORTDRINK.mp4" },
    { id: 15, src: "SOMA_audio_sportshoe.mp4" },
    { id: 16, src: "SOMA_audio_tea.mp4" },
    { id: 17, src: "SOMA_audio_vacation.mp4" },
    { id: 19, src: "SOMA_audio_VR.mp4" },
    { id: 20, src: "SOMA_audio_applejuice.mp4" },
    { id: 21, src: "SOMA_check.mp4"}
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Verbesserte Promise-basierte Preload-Funktion
function preloadVideo(video) {
    return new Promise((resolve, reject) => {
        const tempVideo = document.createElement('video');
        tempVideo.src = video.src;
        tempVideo.preload = 'auto';
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.style.display = 'none';
        
        // Timeout nach 30 Sekunden
        const timeout = setTimeout(() => {
            document.body.removeChild(tempVideo);
            reject(new Error(`Timeout loading ${video.src}`));
        }, 30000);
        
        tempVideo.oncanplaythrough = () => {
            clearTimeout(timeout);
            document.body.removeChild(tempVideo);
            console.log(`✅ Preloaded: ${video.src}`);
            resolve(video);
        };
        
        tempVideo.onerror = () => {
            clearTimeout(timeout);
            document.body.removeChild(tempVideo);
            console.error(`❌ Failed to load: ${video.src}`);
            reject(new Error(`Failed to load ${video.src}`));
        };
        
        document.body.appendChild(tempVideo);
        tempVideo.load();
    });
}

// Alle Videos preloaden
async function preloadAllVideos(videoList) {
    console.log("🔄 Starting to preload all videos...");
    
    // Loading-Screen anzeigen
    showLoadingScreen();
    
    const results = await Promise.allSettled(
        videoList.map(video => preloadVideo(video))
    );
    
    let loadedCount = 0;
    let failedCount = 0;
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            loadedCount++;
        } else {
            failedCount++;
            console.warn(`⚠️ Video failed to preload: ${videoList[index].src}`, result.reason);
        }
    });
    
    console.log(`✅ Preloading complete: ${loadedCount} loaded, ${failedCount} failed`);
    
    // Loading-Screen verstecken
    hideLoadingScreen();
    
    return { loadedCount, failedCount };
}

// Loading-Screen Funktionen
function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    
    loadingScreen.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">Loading Videos...</div>
        <div style="font-size: 16px; opacity: 0.7;">Please wait while all videos are being loaded</div>
        <div style="margin-top: 20px;">
            <div class="spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
        </div>
    `;
    
    // CSS Animation hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingScreen);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

// Shuffle und Video-Array erstellen
shuffleArray(regularVideos);
const videos = [tutorialVideo, ...regularVideos];

// Container definieren (wird später verwendet)
const container = document.getElementById('videoContainer');
const videoViewingDurations = {};

// Hauptfunktion die alles initialisiert
async function initializeApp() {
    try {
        // Alle Videos preloaden
        await preloadAllVideos(videos);
        
        // Nach erfolgreichem Preloading die App initialisieren
        createVideoElements();
        initializeEventListeners();
        
        console.log("🎉 App fully initialized!");
        
    } catch (error) {
        console.error("❌ Failed to initialize app:", error);
        alert("Some videos failed to load. The app may not work properly.");
        // Trotzdem fortfahren
        createVideoElements();
        initializeEventListeners();
    }
}

function createVideoElements() {
    videos.forEach(video => {
        videoViewingDurations[video.id] = { totalDuration: 0, lastStartTime: null };

        const videoBox = document.createElement("div");
        videoBox.classList.add("screen", "video-box");
        videoBox.setAttribute("data-video-id", video.id);
        videoBox.innerHTML = `
      <div class="video-loading-spinner" style="display: none;"></div>
      <video loop playsinline preload="auto">
        <source src="${video.src}" type="video/mp4">
      </video>
    `;
        container.appendChild(videoBox);

        const ratingBox = document.createElement("div");
        ratingBox.classList.add("screen", "rating-box");
        ratingBox.setAttribute("data-video-id", video.id);
        ratingBox.innerHTML = `
          <div class="rating-text">Video quality?</div>
          <div class="stars" data-question="videoRating">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>
          <div class="rating-text"> </div>
          <div class="rating-text"> </div>
          <div class="rating-text"> </div>

          <div class="rating-text">How much do you feel adressed?</div>
          <div class="stars" data-question="purchaseLikelihood">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>
        `;
        container.appendChild(ratingBox);

        const videoElement = videoBox.querySelector("video");
        videoElement.muted = false;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target === videoElement) {
                        const currentVideoId = videoElement.closest('.video-box').getAttribute('data-video-id');

                        if (entry.isIntersecting) {
                            videoElement.play().catch(e => {
                                console.error(`Play failed for video ${currentVideoId}:`, e);
                            });
                            if (videoViewingDurations[currentVideoId] && !videoViewingDurations[currentVideoId].lastStartTime) {
                                videoViewingDurations[currentVideoId].lastStartTime = Date.now();
                            }
                        } else {
                            videoElement.pause();
                            if (videoViewingDurations[currentVideoId] && videoViewingDurations[currentVideoId].lastStartTime) {
                                const duration = Date.now() - videoViewingDurations[currentVideoId].lastStartTime;
                                videoViewingDurations[currentVideoId].totalDuration += duration;
                                videoViewingDurations[currentVideoId].lastStartTime = null;
                            }
                        }
                    }
                });
            },
            { threshold: 0.8 }
        );

        observer.observe(videoElement);
    });

    // Summary Box hinzufügen
    const summaryBox = document.createElement("div");
    summaryBox.classList.add("screen", "rating-box");
    summaryBox.innerHTML = `
      <div class="rating-text">Thank you for rating all videos!</div>
      <div></div>
        <div class="rating-text">IMPORTANT: Download the answer file using the button below.</div>
      <button class="download-btn">Download Ratings</button>
    `;
    container.appendChild(summaryBox);
}

// Der Rest deiner Event Listeners und Funktionen bleibt gleich
let currentIndex = 0;
let screens;
const ratings = {};

function initializeEventListeners() {
    screens = document.querySelectorAll(".screen");
    
    // Alle deine bestehenden Event Listeners hier...
    let touchStartY = 0;
    let touchEndY = 0;
    let swipeThreshold = 30;

    container.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].clientY;
    });

    container.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
    });

    container.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            touchStartY = e.clientY;
            container.classList.add('dragging');
            document.body.classList.add('dragging');
        }
    });

    container.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            touchEndY = e.clientY;
            container.classList.remove('dragging');
            document.body.classList.remove('dragging');
            handleSwipeGesture();
        }
    });

    let scrollTimeout;
    let isScrolling = false;
    const SCROLL_THRESHOLD = 21;

    container.addEventListener('wheel', (e) => {
        e.preventDefault();

        if (isScrolling) return;

        if (e.deltaY > SCROLL_THRESHOLD) {
            isScrolling = true;
            scrollToNext();
        } else if (e.deltaY < -SCROLL_THRESHOLD) {
            isScrolling = true;
            scrollToPrevious();
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 800);
    }, { passive: false });

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("star")) {
            const starContainer = event.target.parentElement;
            const ratingValue = event.target.getAttribute("data-value");
            const ratingBox = starContainer.closest(".rating-box");
            const videoId = ratingBox ? ratingBox.getAttribute("data-video-id") : null;
            const questionType = starContainer.getAttribute("data-question");

            if (videoId) {
                starContainer.querySelectorAll(".star").forEach(star => {
                    star.classList.toggle("selected", parseInt(star.getAttribute("data-value")) <= parseInt(ratingValue));
                });

                if (!ratings[videoId]) {
                    ratings[videoId] = { videoRating: null, purchaseLikelihood: null };
                }

                ratings[videoId][questionType] = parseInt(ratingValue);
            }
        }
    });

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("download-btn")) {
            downloadCSV();
        }
    });
    
    function handleSwipeGesture() {
        const swipeDistance = touchStartY - touchEndY;
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                scrollToNext();
            } else {
                scrollToPrevious();
            }
        }
    }
}

function scrollToNext() {
    if (currentIndex < screens.length - 1) {
        logVideoEnd(currentIndex);
        currentIndex++;
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });    
    }
}

function scrollToPrevious() {
    if (currentIndex > 0) {
        logVideoEnd(currentIndex);
        currentIndex--;
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });    
    }
}

function logVideoEnd(index) {
    const screen = screens[index];
    if (screen.classList.contains('video-box')) {
        const videoElement = screen.querySelector('video');
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');
        if (videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
            const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
            videoViewingDurations[videoId].totalDuration += duration;
            videoViewingDurations[videoId].lastStartTime = null;
        }
    }
}

function downloadCSV() {
    const csvRows = ["Video ID,Video Rating,Purchase Likelihood,Viewing Duration (ms)"];
    videos.forEach(video => {
        const videoId = video.id;
        const videoDesc = video.src;
        const ratingData = ratings[videoId] || { videoRating: "N/A", purchaseLikelihood: "N/A" };
        const duration = videoViewingDurations[videoId] ? videoViewingDurations[videoId].totalDuration : 0;
        csvRows.push(`${videoDesc};${ratingData.videoRating};${ratingData.purchaseLikelihood};${duration}`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ratings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

window.addEventListener('beforeunload', () => {
    const videoElements = document.querySelectorAll('.video-box video');
    videoElements.forEach(videoElement => {
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');
        if (videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
            const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
            videoViewingDurations[videoId].totalDuration += duration;
            videoViewingDurations[videoId].lastStartTime = null;
        }
    });
});

// App starten
initializeApp();
