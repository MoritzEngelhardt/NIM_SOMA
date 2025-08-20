// Tutorial-Video als erstes definieren
const tutorialVideo = { id: 0, src: "SOMA_tutorial.mp4" };
let hasUserInteracted = false;

// Die anderen Videos
const regularVideos = [
    { id: 1, src: "SOMA_audio_BEES.mp4" },
    { id: 2, src: "SOMA_audio_BULLYING.mp4" },
    { id: 3, src: "SOMA_audio_CANDLE.mp4" },
    { id: 4, src: "SOMA_audio_CAR.mp4" },
    { id: 5, src: "SOMA_audio_CLIMATE.mp4" },
    { id: 6, src: "SOMA_audio_DATE.mp4" },
    { id: 7, src: "SOMA_audio_DRUGS.mp4" },
    { id: 8, src: "SOMA_audio_HEROES.mp4" },
    { id: 9, src: "SOMA_audio_LAUNDRY.mp4" },
    { id: 10, src: "SOMA_audio_MENTALHEALTH.mp4" },
    { id: 11, src: "SOMA_noau_INTERIOR.mp4" },
    { id: 12, src: "SOMA_noau_READING.mp4" },
    { id: 13, src: "SOMA_noau_RENT.mp4" },
    { id: 14, src: "SOMA_noau_SPORTDRINK.mp4" },
    { id: 15, src: "SOMA_noau_SNEAKER.mp4" },
    { id: 16, src: "SOMA_noau_TEA.mp4" },
    { id: 17, src: "SOMA_noau_VACATION.mp4" },
    { id: 18, src: "SOMA_noau_BBQ.mp4" },
    { id: 19, src: "SOMA_noau_VR.mp4" },
    { id: 20, src: "SOMA_noau_JUICE.mp4" },
    { id: 21, src: "SOMA_check.mp4"}
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Globaler Video-Cache
const videoCache = new Map();

// Verbesserte Preload-Funktion mit Blob-Caching
function preloadVideo(video) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Starting preload: ${video.src}`);
        
        // Fetch als Blob für besseres Caching
        fetch(video.src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Blob-URL erstellen und im Cache speichern
                const blobUrl = URL.createObjectURL(blob);
                videoCache.set(video.id, {
                    originalSrc: video.src,
                    blobUrl: blobUrl,
                    blob: blob
                });
                
                // Video-Element erstellen um sicherzustellen dass es abspielbar ist
                const testVideo = document.createElement('video');
                testVideo.src = blobUrl;
                testVideo.preload = 'auto';
                testVideo.muted = true;
                testVideo.playsInline = true;
                testVideo.style.display = 'none';
                
                const timeout = setTimeout(() => {
                    document.body.removeChild(testVideo);
                    reject(new Error(`Timeout testing ${video.src}`));
                }, 15000);
                
                testVideo.oncanplaythrough = () => {
                    clearTimeout(timeout);
                    document.body.removeChild(testVideo);
                    console.log(`✅ Preloaded and cached: ${video.src} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
                    resolve(video);
                };
                
                testVideo.onerror = (e) => {
                    clearTimeout(timeout);
                    document.body.removeChild(testVideo);
                    console.error(`❌ Video test failed: ${video.src}`, e);
                    reject(new Error(`Video test failed: ${video.src}`));
                };
                
                document.body.appendChild(testVideo);
                testVideo.load();
            })
            .catch(error => {
                console.error(`❌ Failed to fetch ${video.src}:`, error);
                reject(error);
            });
    });
}

// Alle Videos preloaden mit Progress-Updates
async function preloadAllVideos(videoList) {
    console.log("🔄 Starting to preload all videos...");
    
    const loadingScreen = showLoadingScreen();
    
    let loadedCount = 0;
    const totalCount = videoList.length;
    
    // Update Progress Function
    function updateProgress() {
        const progressPercent = Math.round((loadedCount / totalCount) * 100);
        const progressElement = document.getElementById('loadingProgress');
        const progressText = document.getElementById('loadingText');
        if (progressElement) {
            progressElement.textContent = `${loadedCount}/${totalCount} Videos loaded (${progressPercent}%)`;
        }
        if (progressText) {
            progressText.textContent = `Loading video ${loadedCount + 1} of ${totalCount}...`;
        }
    }
    
    // Videos einzeln laden für bessere Kontrolle
    const results = [];
    for (let i = 0; i < videoList.length; i++) {
        const video = videoList[i];
        updateProgress();
        
        try {
            await preloadVideo(video);
            results.push({ status: 'fulfilled', value: video });
            loadedCount++;
        } catch (error) {
            console.warn(`⚠️ Video failed to preload: ${video.src}`, error);
            results.push({ status: 'rejected', reason: error });
        }
    }
    
    updateProgress();
    
    const failedCount = results.filter(r => r.status === 'rejected').length;
    console.log(`✅ Preloading complete: ${loadedCount} loaded, ${failedCount} failed`);
    
    // Loading-Screen verstecken
    hideLoadingScreen();
    
    return { loadedCount, failedCount };
}

// Verbesserter Loading-Screen mit Progress
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
        text-align: center;
    `;
    
    loadingScreen.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">Loading Videos...</div>
        <div id="loadingText" style="font-size: 16px; opacity: 0.7; margin-bottom: 10px;">Starting...</div>
        <div id="loadingProgress" style="font-size: 14px; opacity: 0.5; margin-bottom: 20px;">0/0 Videos loaded</div>
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
        <div style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
            Please wait, this may take a while with slow internet...
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loadingScreen);
    return loadingScreen;
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

shuffleArray(regularVideos);
const videos = [tutorialVideo, ...regularVideos];

const container = document.getElementById('videoContainer');
const videoViewingDurations = {};

async function initializeApp() {
    try {
        await preloadAllVideos(videos);
        createVideoElements();
        initializeEventListeners();
        console.log("🎉 App fully initialized with cached videos!");
    } catch (error) {
        console.error("❌ Failed to initialize app:", error);
        alert("Some videos failed to load. The app may not work properly.");
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
        
        const cachedVideo = videoCache.get(video.id);
        const videoSrc = cachedVideo ? cachedVideo.blobUrl : video.src;
        
        videoBox.innerHTML = `
            <div class="video-loading-spinner" style="display: none;"></div>
            <video loop playsinline preload="auto" muted>
                <source src="${videoSrc}" type="video/mp4">
            </video>
        `;
        container.appendChild(videoBox);

        // Rating box code stays the same...
        const ratingBox = document.createElement("div");
        ratingBox.classList.add("screen", "rating-box");
        ratingBox.setAttribute("data-video-id", video.id);
        ratingBox.innerHTML = `


          <div class="rating-text">How much did you like the video?</div>
          <div class="stars" data-question="likeVideoRating">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>

          <div class="rating-text"> </div>
          <div class="rating-text"> </div>
          <div class="rating-text"> </div>

                    <div class="rating-text">How much do you feel addressed by the advertisement?</div>
          <div class="stars" data-question="addressedRating">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>

          <div class="rating-text"> </div>
          <div class="rating-text"> </div>
          <div class="rating-text"> </div>

        <div class="rating-text">How much did you like the advertised product/behavior?</div>
          <div class="stars" data-question="likeProductRating">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>

          <div class="rating-text"> </div>
          <div class="rating-text"> </div>
          <div class="rating-text"> </div>

          <div class="rating-text">How likely are you to buy the product/change your behavior?</div>
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
        const spinner = videoBox.querySelector(".video-loading-spinner");
        
        videoElement.addEventListener("loadstart", () => {
            if (spinner) spinner.style.display = "block";
        });
        
        videoElement.addEventListener("canplaythrough", () => {
            if (spinner) spinner.style.display = "none";
        });
        
        videoElement.addEventListener("error", (e) => {
            console.error(`Video playback error for ${video.src}:`, e);
            if (spinner) {
                spinner.innerHTML = "⚠️ Video error";
                spinner.style.color = "red";
            }
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target === videoElement) {
                        const currentVideoId = videoElement.closest('.video-box').getAttribute('data-video-id');

                        if (entry.isIntersecting) {
                            const playVideo = () => {
                                // Enable sound when video comes into view (after user interaction)
                                if (hasUserInteracted) {
                                    videoElement.muted = false;
                                }
                                
                                videoElement.play().catch(e => {
                                    console.error(`Play failed for video ${currentVideoId}:`, e);
                                    // Fallback to muted if audio play fails
                                    if (!videoElement.muted) {
                                        videoElement.muted = true;
                                        videoElement.play().catch(err => {
                                            console.error(`Muted play also failed:`, err);
                                        });
                                    }
                                });
                            };
                            
                            if (videoElement.readyState >= 3) {
                                playVideo();
                            } else {
                                videoElement.addEventListener('canplay', playVideo, { once: true });
                            }
                            
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

    const summaryBox = document.createElement("div");
    summaryBox.classList.add("screen", "rating-box");
    summaryBox.innerHTML = `
      <div class="rating-text">Thank you for rating all videos!</div>
      
      <div></div>
      
      <div class="rating-text">IMPORTANT: Download the answer file using the button below. Save it at a place where you can find it later.</div>
      <button class="download-btn">Download Ratings</button>
      
      <div></div>
      
      <div class="rating-text">If you have downloaded the file, click this link to access a short survey on the videos you just saw. After you answered this survey, you have completed the study.</div>
      <div class="rating-text"><a href="https://uk-erlangen.limesurvey.net/SOMA_part2" target="_blank">Link to survey</a></div>

    `;
    container.appendChild(summaryBox);
}



// Rest des Codes bleibt gleich...
let currentIndex = 0;
let screens;
const ratings = {};


function initializeEventListeners() {
    screens = document.querySelectorAll(".screen");
    
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
            markUserInteracted(); // Mark interaction on scroll
            scrollToNext();
        } else if (e.deltaY < -SCROLL_THRESHOLD) {
            isScrolling = true;
            markUserInteracted(); // Mark interaction on scroll
            scrollToPrevious();
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 800);
    }, { passive: false });

    // Star rating listeners remain the same...
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("star")) {
            markUserInteracted(); // Mark interaction on click
            
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
                    ratings[videoId] = { 
                        likeVideoRating: null, 
                        addressedRating: null, 
                        likeProductRating: null, 
                        purchaseLikelihood: null 
                    };
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
            markUserInteracted(); // Mark interaction on swipe
            
            if (swipeDistance > 0) {
                scrollToNext();
            } else {
                scrollToPrevious();
            }
        }
    }
    
    // Function to mark user interaction and enable sound for current video
    function markUserInteracted() {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            console.log("🔊 User interaction detected - sound enabled for future videos");
            
            // Enable sound for currently playing video if any
            const currentScreen = screens[currentIndex];
            if (currentScreen && currentScreen.classList.contains('video-box')) {
                const currentVideo = currentScreen.querySelector('video');
                if (currentVideo && !currentVideo.paused) {
                    currentVideo.muted = false;
                    console.log("🔊 Sound enabled for current video");
                }
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
    const csvRows = ["Video ID,Like Video Rating,Addressed Rating,Like Product Rating,Purchase Likelihood,Viewing Duration (ms)"]; // ← Korrigiert!
    videos.forEach(video => {
        const videoId = video.id;
        const videoDesc = video.src;
        const ratingData = ratings[videoId] || { 
            likeVideoRating: "N/A", 
            addressedRating: "N/A", 
            likeProductRating: "N/A", 
            purchaseLikelihood: "N/A" 
        };
        const duration = videoViewingDurations[videoId] ? videoViewingDurations[videoId].totalDuration : 0;
        csvRows.push(`${videoDesc};${ratingData.likeVideoRating};${ratingData.addressedRating};${ratingData.likeProductRating};${ratingData.purchaseLikelihood};${duration}`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ratings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}


// Cleanup function für Blob-URLs
window.addEventListener('beforeunload', () => {
    // Video viewing duration tracking
    const videoElements = document.querySelectorAll('.video-box video');
    videoElements.forEach(videoElement => {
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');
        if (videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
            const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
            videoViewingDurations[videoId].totalDuration += duration;
            videoViewingDurations[videoId].lastStartTime = null;
        }
    });
    
    // Cleanup Blob-URLs
    videoCache.forEach(cached => {
        URL.revokeObjectURL(cached.blobUrl);
    });
});

// App starten
initializeApp();
