import { io} from "socket.io-client";

const socket= io("http://localhost:3000");

socket.on('connect',()=>{
  console.log('client is connected');
})



chrome.runtime.onMessage.addListener(
  (message: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void): void => {
    if (message.type === 'JOIN_ROOM') {
      const roomId: string = message.roomId;
      console.log('Joining socket room:', roomId);
      socket.emit('join-room', roomId);
    }
  }
);
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
  
  attachPlayerListeners();