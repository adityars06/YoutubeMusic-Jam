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
      const titleEl = await waitforElement('.title');
  
      playPauseBtn.addEventListener('click', () => {
        const isPlaying = playPauseBtn.getAttribute('title')?.toLowerCase().includes('pause');
        sendAction(isPlaying ? 'pause' : 'play');
      });
  
      nextBtn.addEventListener('click', () => {
        sendAction('next');
      });

      prevBtn.addEventListener('click', () => {
        sendAction('prev');
      });

      const audio = document.querySelector('audio');
      if (audio) {
        audio.addEventListener('seeked', () => {
          sendAction('seeked', { currentTime: audio.currentTime });
        });
      }

      const sendSongInfo = () => {
        const title = titleEl?.textContent?.trim() ?? '';
        sendAction('songInfo', { title });
      };
      sendSongInfo();
  
    } catch (error) {
      console.error('[YouTube Music Controller] Error:', error);
    }
  };
  
  attachPlayerListeners();