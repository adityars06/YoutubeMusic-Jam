import { io} from "socket.io-client";

//blocking window m
window.onbeforeunload = null;


const socket= io("http://localhost:3000");

socket.on('connect',()=>{
  console.log('client is connected');
})

socket.on('chain-of-action',(msg:any)=>{
  console.log(msg)
})

socket.on('VIDEO_ID',(videoId:any)=>{
  console.log(videoId)
  const currentVideoId = new URLSearchParams(window.location.search).get("v");

if (currentVideoId !== videoId) {
  console.log("Navigating to new song:", videoId);
  window.location.href = `https://music.youtube.com/watch?v=${videoId}`;
} else {
  console.log("Already on the correct song:", videoId);
}
  const roomId:any=localStorage.getItem('roomId')
  socket.emit('join-room', roomId);
})



window.addEventListener("load", () => {
  const roomId:any=localStorage.getItem('roomId')
  socket.emit('join-room', roomId);
});

chrome.runtime.onMessage.addListener(
  (message: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void): void => {
    if (message.type === 'JOIN_ROOM') {
      const roomId: string = message.roomId;
      console.log('Joining socket room:', roomId);
      localStorage.setItem('roomId', roomId)
      socket.emit('join-room', roomId);
    }
  }
);
window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== "ytm-sniffer") return;

  const { videoId, full } = event.data.payload;
  console.log("🎯 Intercepted video ID:", videoId);

  // You can now send this to the backend using socket.io
  socket.emit("VIDEO_ID", { videoId, payload: full });

  // Or store it globally for reuse
  (window as any).__ytmVideoId = videoId;
});
const waitforElement = (selector: string, timeout = 10000): Promise<Element> => {
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
}

const sendAction = (action: string, data?: any) => {
    chrome.runtime.sendMessage({type: "PLAYER_ACTION", action, data});
}

const observeTitleChanges = (targetNode: Element) => {
  let lastTitle = targetNode.textContent?.trim();

  const observer = new MutationObserver(() => {
    const currentTitle = targetNode.textContent?.trim();
    if (currentTitle && currentTitle !== lastTitle) {
      lastTitle = currentTitle;
      sendAction('songInfo', { title: currentTitle });
    }
  });

  observer.observe(targetNode, { childList: true, subtree: true });
};

const attachPlayerListeners = async () => {
    try {
      const playPauseBtn = await waitforElement('#play-pause-button');
      const nextBtn = await waitforElement('.next-button');
      const prevBtn = await waitforElement('.previous-button');
      const titleEl = await waitforElement('.title');
  
      playPauseBtn.addEventListener('click', () => {
        const isPlaying = playPauseBtn.getAttribute('title')?.toLowerCase().includes('pause');
        sendAction(isPlaying ? 'pause' : 'play');
        let playAction:string=isPlaying?'pause' : 'play';
        if(playAction){
          socket.emit('PLAYER_ACTION',playAction)
        }
      });
  
      nextBtn.addEventListener('click', () => {
        sendAction('next');
        socket.emit('PLAYER_ACTION','next')
      });

      prevBtn.addEventListener('click', () => {
        sendAction('prev');
        socket.emit('PLAYER_ACTION','prev')
      });

      const audio = document.querySelector('audio');
      if (audio) {
        audio.addEventListener('seeked', () => {
          sendAction('seeked', { currentTime: audio.currentTime });
          socket.emit('PLAYER_ACTION',{ currentTime: audio.currentTime })
        });
      }

      const sendSongInfo = () => {
        const title = titleEl?.textContent?.trim() ?? '';
        sendAction('songInfo', { title });
        socket.emit('PLAYER_ACTION',{title})
      };
      sendSongInfo();
      observeTitleChanges(titleEl);
  
    } catch (error) {
      console.error('[YouTube Music Controller] Error:', error);
    }
  };

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove(); // Optional: remove after injection

// Listen for messages from injected.js
window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;

  const data = event.data;
  if (!data || data.source !== "ytm-sniffer") return;

  const { videoId, full } = data.payload;
  console.log("🎯 Intercepted video ID:", videoId);

  // Store it globally for access from the console
  (window as any).__ytmVideoId = videoId;
  (window as any).__ytmPayload = full;
});
  
  attachPlayerListeners();