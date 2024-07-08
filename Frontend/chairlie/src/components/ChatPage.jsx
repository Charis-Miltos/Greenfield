import axios from "axios";
import { useEffect, useState } from "react";
import './ChatPage.css';

function ChatPage() {
    const [userInput, setUserInput] = useState("");
    const [userMessages, setUserMessages] = useState([]);
    const [assistantMessages, setAssistantMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [inputEnabled, setInputEnabled] = useState(false);
    const [listOfChats, setListOfChats] = useState([]);

    useEffect(() => {
        getAllChats();
    }, []);

    function getAllChats() {
        axios.get("http://localhost:3002/chat").then(({ data }) => {
            console.log(data);
            setListOfChats(data);
        });
    }

    function handleUserInput(e) {
        setUserInput(e.target.value);
    }

    async function createNewChat() {
        try {
            const response = await axios.post('http://localhost:3002/chat/new');
            const newChatId = response.data._id;
            setChatId(newChatId);
            setUserMessages([]);
            setAssistantMessages([]);
            setInputEnabled(true);
            console.log(response.data)
            console.log(newChatId)
            getAllChats()
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    }

    async function sendMessage() {
        const userMessage = userInput.trim();
        if (!userMessage) return;

        setUserMessages(prev => [...prev, userMessage]);
        setUserInput("");

        try {
            const response = await axios.post(`http://localhost:3002/chat/${chatId}`, {
                messages: [{ role: 'user', content: userMessage }],
            });
            console.log(response.data);
            const assistantMessage = response.data.choices[0].message.content;
            setAssistantMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const assistantMessage = "Oops, it appears there was an error"
            setAssistantMessages(prev => [...prev, assistantMessage])
        }
    }

    function deleteChat(historyId) {
        axios.delete(`http://localhost:3002/chat/${historyId}`).then(response => {
            console.log(`Poll deleted:${historyId}`, response.data);
            getAllChats();
        }).catch(error => {
            console.error(`There was an error deleting the poll`, error);
        });
    }
    // async function sendMessage() {
    //     const userMessage = userInput.trim();
    //     if (!userMessage || !chatId) return;

    //     setUserMessages(prev => [...prev, userMessage]);
    //     setUserInput("");

    //     try {
    //         const response = await axios.post(`http://localhost:3002/chat/${chatId}`, {
    //             message: { role: 'user', content: userMessage }, - no square brackets
    //         });
    //         const assistantMessage = response.data.choices[0].message.content;
    //         setAssistantMessages(prev => [...prev, assistantMessage]);
    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //     }
    // }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    return (
        <div className="container">
            <div className="interactivePanel">
                <div className="historyDisplay">
                    <div>
                        <button onClick={createNewChat}>New chat</button>
                        {listOfChats.map((e,i)=>(
                            <div >
                                {e.date}
                                <button onClick={()=>deleteChat(e._id)}>X</button>
                            </div>
                        ))}
                    </div>
                    
                </div>
                <div className="chatDisplay">
                    {userMessages.map((message, index) => (
                        <div key={index} className="message">
                            <p className="userMessage">{message}</p>
                            {assistantMessages[index] && (
                                <p className="assistantMessage">{assistantMessages[index]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="chatInput">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleUserInput}
                    onKeyDown={handleKeyDown}
                    disabled={!inputEnabled}
                />
                <button onClick={sendMessage} disabled={!inputEnabled}>Send</button>
            </div>
        </div>
    );
}

export default ChatPage;