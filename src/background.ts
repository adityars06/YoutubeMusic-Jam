chrome.runtime.onMessage.addListener((
    message: { type: string; action?: string; data?: any },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: any) => void)=>{

      if(message.type=="PLAYER_ACTION"){
        if(message.action=='pause'){
          console.log('pause')
        }
        else if(message.action=='play'){
          console.log('play')
        }
        else if(message.action=='next'){
          console.log('next song')
        }
        else if(message.action=='prev'){
          console.log('play previous music')
        }
        else if(message.action=='seeked'){
          console.log(`seeked to ${message.data}`)
        }
        else if(message.action=='songInfo'){
          console.log(message.data?.title+' is playing')
        }
      }
      

})