// import { useState } from 'react';

// const Popup = () => {
//     const [sessionCode, setSessionCode] = useState<string>('');
//     const [generatedCode, setGeneratedCode] = useState<string>(''); 
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const toggleModal = () => setIsModalOpen(!isModalOpen);

//     const generateCode=()=>{
//         const alphanumerics: string[] = [
//         'a', 'b', 'c', 'd', 'e', 'f', 'g',
//         'h', 'i', 'j', 'k', 'l', 'm', 'n',
//         'o', 'p', 'q', 'r', 's', 't', 'u',
//         'v', 'w', 'x', 'y', 'z',
//         '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
//         ];
//     let roomId:string='';
//     for(let i=0;i<=5;i++){
//         let index = Math.floor(Math.random() * 36);
//         roomId+=alphanumerics[index];
//     }
//     return roomId
//     }

    

    

//     return (
//         <div>
//             <button
//                 className="bg-red-500 text-white py-2 px-4 rounded-lg"
//                 onClick={toggleModal}
//             >
//                 Open Session Modal
//             </button>

//             {isModalOpen && (
//                 <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
//                     <div className="bg-white p-6 rounded-lg w-96 relative">
//                         <h2 className="text-2xl font-semibold mb-4">YouTube Jam</h2>

//                         <div className="mb-6">
//                             <button
//                                 className="bg-green-500 text-white py-2 px-4 rounded-lg w-full mb-4"
//                                 onClick={handleCreateSession}
//                             >
//                                 Create Session
//                             </button>
//                             {generatedCode && (
//                                 <div className="text-center">
//                                     <p className="text-lg font-semibold">Session Created!</p>
//                                     <p className="text-sm mt-2">Session Code: {generatedCode}</p>
//                                     <p className="text-sm mt-2">
//                                         Share this link:{" "}
//                                         <a
//                                             href={`https://youtubejam.com/session/${generatedCode}`}
//                                             className="text-blue-500"
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                         >
//                                             youtubejam.com/session/{generatedCode}
//                                         </a>
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         <div>
//                             <input
//                                 type="text"
//                                 placeholder="Enter Session Code"
//                                 value={sessionCode}
//                                 onChange={(e) => setSessionCode(e.target.value)}
//                                 className="border p-2 mb-4 w-full rounded-lg"
//                             />
//                             <button
//                                 className="bg-red-500 text-white py-2 px-4 rounded-lg w-full"
//                                 onClick={handleJoinSession}
//                             >
//                                 Join Session
//                             </button>
//                         </div>

//                         <button
//                             className="absolute top-2 right-2 text-gray-600"
//                             onClick={toggleModal}
//                         >
//                             X
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Popup;

import { useState } from 'react';

const YouTubeJam = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

//   const handleCreateSession = () => {
//     const newSessionCode = Math.random().toString(36).substring(2, 8);
//     setGeneratedCode(newSessionCode);
//   };

  const handleCreateSession = () => {
        // Logic to create a session 
        const newSessionCode = Math.random().toString(36).substring(2, 8);
        setGeneratedCode(newSessionCode);
        chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
            if(tabs[0].id){
                chrome.tabs.sendMessage(tabs[0].id,{
                    type:'JOIN_ROOM',
                    roomId:newSessionCode
                })
            }
        })
        setGeneratedCode(newSessionCode);
    };

  const handleJoinSession = () => {
        if (sessionCode.trim()) {
            chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
            if(tabs[0].id){
                chrome.tabs.sendMessage(tabs[0].id,{
                    type:'JOIN_ROOM',
                    roomId:sessionCode
                })
            }
            alert(`Joining session: ${sessionCode}`);
            console.log(`Joining session with code: ${sessionCode}`);
        })
            
        } else {
            console.error("Session code is required to join a session.");
            alert("enter a valid session code")
        }
    };

//   const handleJoinSession = () => {
    
//   };

  return (
    <div>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">YouTube Jam</h2>

        <div className="mb-6">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg w-full mb-4"
            onClick={handleCreateSession}
          >
            Create New Session
          </button>
          {generatedCode && (
            <div className="text-center">
              <p className="text-lg font-semibold text-green-700">Session Created!</p>
              <p className="text-sm mt-2 text-gray-600">Code: {generatedCode}</p>
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter Session Code"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            className="border p-2 mb-4 w-full rounded-lg"
          />
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg w-full"
            onClick={handleJoinSession}
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeJam;
