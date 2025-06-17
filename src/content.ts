import { io} from "socket.io-client";

let sendmessage:boolean=true;
// let sendVideoMessage:boolean=true;
let currentVideoId:String|null=null;
let start:number;

//blocking window reload-didnt work
window.onbeforeunload = null;


const socket = io("https://youtubeparty.onrender.com");

socket.on('connect',()=>{
  console.log('client is connected');
})

socket.on('chain-of-action',(msg:any)=>{
  console.log(msg)
  const playPauseBtn = document.querySelector('#play-pause-button') as HTMLElement;
  const isCurrentlyPlaying = playPauseBtn.getAttribute('title')?.toLowerCase().includes('pause');
    if (playPauseBtn) {
      if ((msg === 'play' && isCurrentlyPlaying) || (msg === 'pause' && !isCurrentlyPlaying)) {
      console.log(`[INFO] Ignoring ${msg} - Already in correct state`);
      return;
      }
      sendmessage=false;
      playPauseBtn.click();
      sendmessage=true;
      
      
    }
})

socket.on('VIDEO_ID',(videoId:any)=>{
  console.log(videoId)
  // sendVideoMessage=false;



if (currentVideoId !== videoId) {
  localStorage.setItem('isSender',"false");
  console.log("Navigating to new song:", videoId);
  window.location.href = `https://music.youtube.com/watch?v=${videoId}`;
} else {
  console.log("Already on the correct song:", videoId);
}
  const roomId:any=localStorage.getItem('roomId')
  socket.emit('join-room', roomId);
  // sendVideoMessage=true;
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

const simulatePlayClick = () => {
  sendmessage=false;
  const btn = document.querySelector('#play-pause-button') as HTMLElement;
  btn.click();
  setTimeout(() => (sendmessage = true), 100); // reset after small delay
  
};

const simulatePauseClick = () => {
  const btn = document.querySelector('#play-pause-button') as HTMLElement;
  sendmessage=false;
  btn.click();
    setTimeout(() => (sendmessage = true), 100);
};

// Listen for messages from injected.js
window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== "ytm-sniffer") return;
  if(currentVideoId==null){start=Date.now()};
  

  const { videoId, full } = event.data.payload;
  console.log("🎯 Intercepted video ID:", videoId);
  if(currentVideoId!=videoId){start=Date.now()}

  // You can now send this to the backend using socket.io
  
    if(Date.now()-start<4000){
      socket.emit("VIDEO_ID", { videoId, payload: full });
      currentVideoId=videoId;
      const isSender: boolean = localStorage.getItem('isSender')!=="false";
      if(isSender){
      simulatePauseClick();
      setTimeout(()=>{
        simulatePlayClick()
      },3400)
      }
      localStorage.removeItem('isSender');
      
    }
    
    // currentVideoId=videoId;
  
  

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




const attachPlayerListeners = async () => {
    try {
      const playPauseBtn = await waitforElement('#play-pause-button');
      const nextBtn = await waitforElement('.next-button');
      const prevBtn = await waitforElement('.previous-button');
      
  
      playPauseBtn.addEventListener('click', () => {
        const isPlaying = playPauseBtn.getAttribute('title')?.toLowerCase().includes('pause');
        sendAction(isPlaying ? 'pause' : 'play');
        let playAction:string=isPlaying?'pause' : 'play';
        if(playAction){
          if(sendmessage){
            socket.emit('PLAYER_ACTION',playAction)
          }
          
        }
      });

  
      nextBtn.addEventListener('click', () => {
        
        start=Date.now();
      });

      prevBtn.addEventListener('click', () => {
        
      });

      const audio = document.querySelector('audio');
      if (audio) {
        audio.addEventListener('seeked', () => {
          
        });
      }

    
  
    } catch (error) {
      console.error('[YouTube Music Controller] Error:', error);
    }
  };

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove(); // Optional: remove after injection



  
  attachPlayerListeners();