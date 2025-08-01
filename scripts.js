const videos = [
    { id: 1, src: "video_audio_1.mp4" },
    { id: 2, src: "video_audio_2.mp4" },
    { id: 3, src: "video_audio_3.mp4" },
    { id: 4, src: "video_audio_4.mp4" }
];


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function preloadVideos(videoList) {
    videoList.forEach(video => {
        const tempVideo = document.createElement('video');
        tempVideo.src = video.src;
        tempVideo.preload = 'auto';
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.style.display = 'none';

        document.body.appendChild(tempVideo);
        tempVideo.load();

        // Remove from DOM once preloaded to free memory
        tempVideo.oncanplaythrough = () => {
            document.body.removeChild(tempVideo);
            console.log(`✅ Preloaded: ${video.src}`);
        };
    });
}

function warmVideoCache(videoList) {
    videoList.forEach(video => {
        fetch(video.src, { method: 'GET', mode: 'cors' })
            .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${video.src}`);
                return response.blob();
            })
            .then(blob => {
                console.log(`✅ Fetched to cache: ${video.src} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
            })
            .catch(err => {
                console.warn(`⚠️ Failed to preload ${video.src}`, err);
            });
    });
}

shuffleArray(videos);
preloadVideos(videos); // 👈 Add this
warmVideoCache(videos); // Optional backup

const container = document.getElementById('videoContainer');
const videoViewingDurations = {};

videos.forEach(video => {
    videoViewingDurations[video.id] = { totalDuration: 0, lastStartTime: null };

    const videoBox = document.createElement("div");
    videoBox.classList.add("screen", "video-box");
    videoBox.setAttribute("data-video-id", video.id);
    videoBox.innerHTML = `
  <div class="video-loading-spinner"></div>
  <video loop playsinline preload="auto">
    <source src="${video.src}" type="video/mp4">
  </video>
`;
    container.appendChild(videoBox);

    const ratingBox = document.createElement("div");
    ratingBox.classList.add("screen", "rating-box");
    ratingBox.setAttribute("data-video-id", video.id);
    ratingBox.innerHTML = `
    <div class="rating-text">Please rate the video you just saw:</div>
      <div class="rating-text">Quality</div>
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
<div class="rating-text"> </div>
      <div class="rating-text"> </div>
      <div class="rating-text"> </div>
      
      <div class="rating-text">How emotionally affected are you?</div>
      <div class="stars" data-question="purchaseLikelihood">
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>
<div class="rating-text"> </div>
      <div class="rating-text"> </div>
      <div class="rating-text"> </div>
      
       <div class="rating-text">How much money are you willing to spend on the product/donate to the cause? (from 1 = 'None' to 5 = 'A lot')</div>
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

    videoElement.addEventListener("canplaythrough", () => {
    if (spinner) spinner.style.display = "none";
    });

    videoElement.muted = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.target === videoElement) {
                    const currentVideoId = videoElement.closest('.video-box').getAttribute('data-video-id');

                    if (entry.isIntersecting) {
                        videoElement.play();
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
        { threshold: 0.6 }
    );

    observer.observe(videoElement);

    if (video.id === videos[0].id) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const rect = videoElement.getBoundingClientRect();
            const visibleRatio = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            const visibility = visibleRatio / rect.height;

            if (visibility >= 0.8) {
                videoElement.play().catch(err => {
                    console.warn("Autoplay on first video failed:", err);
                });
            }
        }, 100); // slight delay to allow layout to stabilize
    });
}
});

const summaryBox = document.createElement("div");
summaryBox.classList.add("screen", "rating-box");
summaryBox.innerHTML = `
  <div class="rating-text">Thank you for rating all videos! Please download your results file. It will be saved in your Downloads folder. If youre done, click on the 'Finished' button.</div>
  <button class="download-btn">Download Ratings</button>
   <a href="https://uk-erlangen.limesurvey.net/SOMA_part2" class="summary-link-button" target="_blank">
    <button class="finish-btn">I'm ready!</button>
  </a>
`;
container.appendChild(summaryBox);

let currentIndex = 0;
const screens = document.querySelectorAll(".screen");
const ratings = {};

function scrollToNext() {
    if (currentIndex < screens.length - 1) {
        logVideoEnd(currentIndex);
        currentIndex++;
screens[currentIndex].scrollIntoView({ behavior: 'smooth' });    }
}

function scrollToPrevious() {
    if (currentIndex > 0) {
        logVideoEnd(currentIndex);
        currentIndex--;
screens[currentIndex].scrollIntoView({ behavior: 'smooth' });    }
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
        document.body.classList.add('dragging'); // 👈
    }
});

container.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        touchEndY = e.clientY;
        container.classList.remove('dragging');
        document.body.classList.remove('dragging'); // 👈
        handleSwipeGesture();
    }
});

let scrollTimeout;
let isScrolling = false;

const SCROLL_THRESHOLD = 20; // Try 80–120 for less sensitive, 10–30 for more

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
    }, 800); // adjust debounce delay if needed
}, { passive: false });

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
    //link.download = `ratings_${new Date().toISOString().split("T")[0]}.csv`;
    link.download = `SOMA_${Date.now()}.csv`;
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

document.querySelectorAll('.intro-text').forEach(el => {
    el.setAttribute('onmousedown', 'return false');
});
