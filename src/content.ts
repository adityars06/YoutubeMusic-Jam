import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

let currentRoomId = "";

socket.on("connect", () => {
  console.log("Client connected to socket.io");
});

chrome.runtime.onMessage.addListener(
  (message: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void): void => {
    if (message.type === "JOIN_ROOM") {
      currentRoomId = message.roomId;
      console.log("Joining socket room:", currentRoomId);
      socket.emit("join-room", currentRoomId);
    }
  }
);

const waitForElement = (selector: string, timeout = 10000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;

    const checkExist = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(checkExist);
        resolve(element);
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(checkExist);
        reject(new Error(`Element not found: ${selector}`));
      }
    }, interval);
  });
};

const sendActionToRoom = (action: string, data?: any) => {
  if (currentRoomId) {
    socket.emit("action", { roomId: currentRoomId, action, data });
  }
};

const sendAction = (action: string, data?: any) => {
  chrome.runtime.sendMessage({ type: "PLAYER_ACTION", action, data });
  sendActionToRoom(action, data);
};


const observeTitleChanges = (targetNode: Element) => {
  let lastTitle = targetNode.textContent?.trim();

  const observer = new MutationObserver(() => {
    const currentTitle = targetNode.textContent?.trim();
    if (currentTitle && currentTitle !== lastTitle) {
      lastTitle = currentTitle;
      sendAction("songInfo", { title: currentTitle });
    }
  });

  observer.observe(targetNode, { childList: true, subtree: true });
};

// Example: Observe play/pause/next/back buttons on YouTube Music

function emitPlayerAction(action: string) {
  console.log(`[emitPlayerAction] ${action} clicked`);
  socket.emit("PLAYER_ACTION", { action });
  console.log(`${action} emitted`);
}

function setupPlayerControls() {
  const playBtn = document.querySelector('[title="Play"]');
  const pauseBtn = document.querySelector('[title="Pause"]');
  const nextBtn = document.querySelector('.next-button');
const prevBtn = document.querySelector('.previous-button');

  if (playBtn) {
    console.log("Play button found");
    playBtn.addEventListener("click", () => emitPlayerAction("play"));
  }

  if (pauseBtn) {
    console.log("Pause button found");
    pauseBtn.addEventListener("click", () => emitPlayerAction("pause"));
  }

  if (nextBtn) {
    console.log("Next button found");
    nextBtn.addEventListener("click", () => emitPlayerAction("next"));
  }

  if (prevBtn) {
    console.log("Next button found");
    prevBtn.addEventListener("click", () => emitPlayerAction("previous"));
  }
}


const titleObserver = new MutationObserver(() => {
  const title = (document.querySelector(".title.ytmusic-player-bar") as HTMLElement)?.innerText;
  if (title) {
    socket.emit("PLAYER_ACTION", { title });
    console.log(`${title} is playing`);
  }
});

const titleElement = document.querySelector(".title.ytmusic-player-bar");
if (titleElement) {
  titleObserver.observe(titleElement, { childList: true, subtree: true });
}


const attachPlayerListeners = async () => {
  try {
    const playPauseBtn = await waitForElement("#play-pause-button");
    const nextBtn = await waitForElement(".next-button");
    const prevBtn = await waitForElement(".previous-button");
    const titleEl = await waitForElement(".title");

    playPauseBtn.addEventListener("click", () => {
      const isPlaying = playPauseBtn.getAttribute("title")?.toLowerCase().includes("pause");
      const action = isPlaying ? "pause" : "play";
      sendAction(action);
    });

    nextBtn.addEventListener("click", () => sendAction("next"));
    prevBtn.addEventListener("click", () => sendAction("prev"));

    const audio = document.querySelector("audio");
    if (audio) {
      audio.addEventListener("seeked", () => {
        sendAction("seeked", { currentTime: audio.currentTime });
      });
    }

    setupPlayerControls();
    window.addEventListener("load", setupPlayerControls);

    const sendSongInfo = () => {
      const title = titleEl?.textContent?.trim() ?? "";
      sendAction("songInfo", { title });
    };

    sendSongInfo();
    observeTitleChanges(titleEl);

    // Handle actions from other users
    socket.on("sync-action", ({ action, data }) => {
      const simulateClick = (selector: string) => {
        const el = document.querySelector(selector) as HTMLElement;
        el?.click();
      };

      switch (action) {
        case "play":
        case "pause":
          simulateClick("#play-pause-button");
          break;
        case "next":
          simulateClick(".next-button");
          break;
        case "prev":
          simulateClick(".previous-button");
          break;
        case "seeked":
          const audio = document.querySelector("audio") as HTMLAudioElement;
          if (audio && typeof data?.currentTime === "number") {
            audio.currentTime = data.currentTime;
          }
          break;
      }
    });
  } catch (error) {
    console.error("[YouTube Party] Error:", error);
  }
};

attachPlayerListeners();