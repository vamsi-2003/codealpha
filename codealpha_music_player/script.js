const songs = [
  { title: "Forest Lullaby",   artist: "Artist A", src: "songs/forest-lullaby.mp3" },
  { title: "Midnight Forest",  artist: "Artist B", src: "songs/midnight-forest.mp3" },
  { title: "Mystery Horror",   artist: "Artist C", src: "songs/mystery-horror.mp3" },
  { title: "The Magic Tree",   artist: "Artist D", src: "songs/the-magic-tree.mp3" }
];

let idx = 0;

const audio       = document.getElementById("audio");
const titleEl     = document.getElementById("title");
const artistEl    = document.getElementById("artist");
const playBtn     = document.getElementById("play");
const prevBtn     = document.getElementById("prev");
const nextBtn     = document.getElementById("next");
const progressEl  = document.getElementById("progress");
const currentEl   = document.getElementById("current-time");
const durationEl  = document.getElementById("duration");
const volumeEl    = document.getElementById("volume");
const autoplayEl  = document.getElementById("autoplay");
const playlistEl  = document.getElementById("playlist");
const themeToggle = document.getElementById("theme-toggle");

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

function highlight() {
  [...playlistEl.children].forEach((li, i) => {
    li.classList.toggle("active", i === idx);
  });
}

function load(i) {
  idx = i;
  const s = songs[idx];
  audio.src = s.src;
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist;
  highlight();
  audio.load();
}

function play() {
  audio.play();
  playBtn.textContent = "⏸️";
}

function pause() {
  audio.pause();
  playBtn.textContent = "▶️";
}

function togglePlay() {
  if (audio.paused) {
    play();
  } else {
    pause();
  }
}

function jumpNext() {
  idx = (idx + 1) % songs.length;
  load(idx);
  play();
}

function jumpPrev() {
  idx = (idx - 1 + songs.length) % songs.length;
  load(idx);
  play();
}

// Event listeners for controls
playBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", jumpPrev);
nextBtn.addEventListener("click", jumpNext);

audio.addEventListener("timeupdate", () => {
  if (!isFinite(audio.duration) || audio.duration <= 0) return;
  currentEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
  progressEl.max = audio.duration;
  progressEl.value = audio.currentTime;
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
  progressEl.max = audio.duration || 0;
});

audio.addEventListener("ended", () => {
  if (autoplayEl.checked) {
    jumpNext();
  } else {
    pause();
    audio.currentTime = 0;
    progressEl.value = 0;
    currentEl.textContent = "0:00";
  }
});

progressEl.addEventListener("input", () => {
  if (isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = progressEl.value;
  }
});

volumeEl.addEventListener("input", () => {
  audio.volume = volumeEl.value;
});

// Keyboard: Space = play/pause
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (["INPUT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) return;
    e.preventDefault();
    togglePlay();
  }
});

// Build playlist
function createPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "left";

    const titleSpan = document.createElement("div");
    titleSpan.textContent = s.title;

    const artistSpan = document.createElement("div");
    artistSpan.textContent = s.artist;
    artistSpan.className = "small";

    left.appendChild(titleSpan);
    left.appendChild(artistSpan);

    const right = document.createElement("div");
    // duration element for this song
    right.className = "small duration";
    right.textContent = "--:--";

    li.appendChild(left);
    li.appendChild(right);

    li.addEventListener("click", () => {
      load(i);
      play();
    });

    playlistEl.appendChild(li);
  });
}

// Preload durations for playlist
function preloadDurations() {
  songs.forEach((s, i) => {
    const a = new Audio();
    a.src = s.src;
    a.preload = "metadata";

    a.addEventListener("loadedmetadata", () => {
      const li = playlistEl.children[i];
      if (!li) return;

      const durationSpan = li.querySelector(".duration");
      if (!durationSpan) return;

      durationSpan.textContent = formatTime(a.duration);
    });

    // ensure the browser actually starts loading metadata
    a.load();
  });
}

// Theme toggle
function updateThemeIcon() {
  const isLight = document.body.classList.contains("light-theme");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  updateThemeIcon();
});

// Init
volumeEl.value = 0.8;
audio.volume = 0.8;

createPlaylist();
load(0);
preloadDurations();
updateThemeIcon();
