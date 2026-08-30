console.log("Spotify Clone JS Loaded");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// All albums and their songs
// These names match your actual folders/files
const albums = {
    "ncs": [
        "Chunnari Chunnari - Udit Narayan.mp3"
    ],

    "Diljit": [
        "Hass Hass - Hass Hass (128 kbps).mp3"
    ],

    "Bright_(mood)": [
        "Bairan - Bairan (128 kbps).mp3"
    ],

    "Chill_(mood)": [
        "Bahu Kale Ki - Khasha aala.mp3"
    ],

    "Funky-(mood)": [
        "Sheesha - mashum Sharma.mp3",
        "Run Down The City  Monica - Atif Aslam.mp3"
    ],

    "Angry-(mood)": [
        "Zigane - Dhanda Nyoliwala.mp3"
    ],

    "Love_(mood)": [
        "Gehra Hua - Arjit Singh.mp3"
    ],

    "karan aujla": [
        "I Really Do... - P-POP CULTURE (128 kbps).mp3"
    ],

    "cs": []
};


// Convert seconds to MM:SS
function secondsToMinutesSeconds(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}


// Get songs from selected album
async function getSongs(folder) {

    currFolder = folder;

    console.log("Current folder:", currFolder);

    // Remove "songs/" from folder name
    const albumName = folder.replace("songs/", "");

    songs = albums[albumName] || [];

    console.log("SONGS:", songs);

    // Show songs in left song list
    let songUL = document.querySelector(".songList ul");

    if (!songUL) {
        console.log("songList ul not found");
        return songs;
    }

    songUL.innerHTML = "";

    for (const song of songs) {

        let songName = decodeURIComponent(song);

        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg">

                <div class="info">
                    <div>${songName}</div>
                    <div>Harry</div>
                </div>

                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg">
                </div>
            </li>
        `;
    }


    // Add click event to every song
    Array.from(songUL.getElementsByTagName("li")).forEach((e) => {

        e.addEventListener("click", () => {

            let track = e
                .querySelector(".info")
                .firstElementChild
                .innerHTML
                .trim();

            playMusic(track);
        });

    });

    return songs;
}


// Play selected song
const playMusic = (track, pause = false) => {

    if (!track) {
        console.log("No track available");
        return;
    }

    // Encode folder and filename safely
    currentSong.src =
        `/songs/${encodeURIComponent(currFolder.replace("songs/", ""))}/${encodeURIComponent(track)}`;

    console.log("Playing:", currentSong.src);

    if (!pause) {

        currentSong.play()
            .then(() => {
                if (typeof play !== "undefined") {
                    play.src = "img/pause.svg";
                }
            })
            .catch((error) => {
                console.log("Play error:", error);
            });
    }

    document.querySelector(".songinfo").innerHTML =
        decodeURIComponent(track);

    document.querySelector(".songtime").innerHTML =
        "00:00 / 00:00";
};


// Display all albums
async function displayAlbums() {

    console.log("Displaying Albums");

    let cardContainer = document.querySelector(".cardContainer");

    if (!cardContainer) {
        console.log("cardContainer not found");
        return;
    }

    cardContainer.innerHTML = "";


    for (const folder of Object.keys(albums)) {

        try {

            // Get album information from info.json
            let infoResponse =
                await fetch(`/songs/${encodeURIComponent(folder)}/info.json`);

            if (!infoResponse.ok) {
                console.log("info.json not found:", folder);
                continue;
            }

            let info = await infoResponse.json();

            console.log("Album:", folder, info);


            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">

                    <div class="play">

                        <svg width="16" height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">

                            <path
                                d="M5 20V4L19 12L5 20Z"
                                stroke="#141B34"
                                fill="#000"
                                stroke-width="1.5"
                                stroke-linejoin="round" />

                        </svg>

                    </div>

                    <img 
                        src="/songs/${encodeURIComponent(folder)}/cover.jpg"
                        alt="${info.title}"
                    >

                    <h2>${info.title}</h2>

                    <p>${info.description}</p>

                </div>
            `;

        }
        catch (error) {

            console.log(
                "Error loading album:",
                folder,
                error
            );

        }
    }


    // Album click
    Array.from(
        document.getElementsByClassName("card")
    ).forEach((e) => {

        e.addEventListener("click", async (item) => {

            console.log("Album clicked");

            let folder =
                item.currentTarget.dataset.folder;

            console.log("Selected album:", folder);

            songs =
                await getSongs(`songs/${folder}`);


            // Play first song
            if (songs.length > 0) {

                playMusic(songs[0]);

            }
            else {

                console.log(
                    "No songs available in this album"
                );

            }

        });

    });
}


// Main function
async function main() {

    console.log("Main started");


    // Load default album
    songs = await getSongs("songs/ncs");


    // Load first song without playing
    if (songs.length > 0) {

        playMusic(songs[0], true);

    }


    // Display albums
    await displayAlbums();


    // -------------------------
    // PLAY / PAUSE
    // -------------------------

    if (typeof play !== "undefined") {

        play.addEventListener("click", () => {

            if (!currentSong.src) {
                return;
            }

            if (currentSong.paused) {

                currentSong.play();

                play.src = "img/pause.svg";

            }
            else {

                currentSong.pause();

                play.src = "img/play.svg";

            }

        });

    }


    // -------------------------
    // TIME UPDATE
    // -------------------------

    currentSong.addEventListener("timeupdate", () => {

        const songTime =
            document.querySelector(".songtime");

        const circle =
            document.querySelector(".circle");

        if (songTime) {

            songTime.innerHTML =
                `${secondsToMinutesSeconds(currentSong.currentTime)}
                /
                ${secondsToMinutesSeconds(currentSong.duration)}`;

        }

        if (
            circle &&
            currentSong.duration &&
            !isNaN(currentSong.duration)
        ) {

            circle.style.left =
                (currentSong.currentTime /
                    currentSong.duration) * 100 + "%";

        }

    });


    // -------------------------
    // SONG ENDED
    // -------------------------

    currentSong.addEventListener("ended", () => {

        let index =
            songs.indexOf(
                decodeURIComponent(
                    currentSong.src.split("/").pop()
                )
            );

        if (index + 1 < songs.length) {

            playMusic(songs[index + 1]);

        }
        else {

            if (typeof play !== "undefined") {
                play.src = "img/play.svg";
            }

        }

    });


    // -------------------------
    // SEEKBAR
    // -------------------------

    const seekbar =
        document.querySelector(".seekbar");

    if (seekbar) {

        seekbar.addEventListener("click", (e) => {

            if (
                !currentSong.duration ||
                isNaN(currentSong.duration)
            ) {
                return;
            }

            let percent =
                (e.offsetX /
                    e.target.getBoundingClientRect().width) * 100;


            document.querySelector(".circle")
                .style.left = percent + "%";


            currentSong.currentTime =
                (currentSong.duration * percent) / 100;

        });

    }


    // -------------------------
    // HAMBURGER
    // -------------------------

    const hamburger =
        document.querySelector(".hamburger");

    if (hamburger) {

        hamburger.addEventListener("click", () => {

            document.querySelector(".left")
                .style.left = "0";

        });

    }


    // -------------------------
    // CLOSE SIDEBAR
    // -------------------------

    const close =
        document.querySelector(".close");

    if (close) {

        close.addEventListener("click", () => {

            document.querySelector(".left")
                .style.left = "-120%";

        });

    }


    // -------------------------
    // PREVIOUS SONG
    // -------------------------

    if (typeof previous !== "undefined") {

        previous.addEventListener("click", () => {

            currentSong.pause();

            console.log("Previous clicked");

            let currentTrack =
                decodeURIComponent(
                    currentSong.src.split("/").pop()
                );

            let index =
                songs.indexOf(currentTrack);


            if ((index - 1) >= 0) {

                playMusic(songs[index - 1]);

            }

        });

    }


    // -------------------------
    // NEXT SONG
    // -------------------------

    if (typeof next !== "undefined") {

        next.addEventListener("click", () => {

            currentSong.pause();

            console.log("Next clicked");

            let currentTrack =
                decodeURIComponent(
                    currentSong.src.split("/").pop()
                );

            let index =
                songs.indexOf(currentTrack);


            if ((index + 1) < songs.length) {

                playMusic(songs[index + 1]);

            }

        });

    }


    // -------------------------
    // VOLUME
    // -------------------------

    const volumeRange =
        document.querySelector(".range input");

    if (volumeRange) {

        volumeRange.addEventListener("change", (e) => {

            console.log(
                "Setting volume to",
                e.target.value
            );

            currentSong.volume =
                parseInt(e.target.value) / 100;


            if (currentSong.volume > 0) {

                const volumeImage =
                    document.querySelector(".volume>img");

                if (volumeImage) {

                    volumeImage.src =
                        volumeImage.src
                            .replace(
                                "mute.svg",
                                "volume.svg"
                            );

                }

            }

        });

    }


    // -------------------------
    // MUTE
    // -------------------------

    const volumeImage =
        document.querySelector(".volume>img");

    if (volumeImage) {

        volumeImage.addEventListener("click", (e) => {

            if (e.target.src.includes("volume.svg")) {

                e.target.src =
                    e.target.src.replace(
                        "volume.svg",
                        "mute.svg"
                    );

                currentSong.volume = 0;

                if (volumeRange) {
                    volumeRange.value = 0;
                }

            }
            else {

                e.target.src =
                    e.target.src.replace(
                        "mute.svg",
                        "volume.svg"
                    );

                currentSong.volume = 0.10;

                if (volumeRange) {
                    volumeRange.value = 10;
                }

            }

        });

    }


    console.log("Main completed");

}


// Start application
main();
