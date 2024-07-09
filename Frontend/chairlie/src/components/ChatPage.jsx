import axios from "axios";
import { useEffect, useState } from "react";
import './ChatPage.css';

function ChatPage() {
    const [userInput, setUserInput] = useState("");
    const [chatId, setChatId] = useState(null);
    const [inputEnabled, setInputEnabled] = useState(false);
    const [listOfChats, setListOfChats] = useState([]);
    const [selectChat, setSelectChat] = useState(null);

    useEffect(() => {
        getAllChats();
    }, []);

    async function getAllChats() {
        const token = localStorage.getItem('token'); 
        try {
            const { data } = await axios.get('http://localhost:3002/chat', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setListOfChats(data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    }

    function handleUserInput(e) {
        setUserInput(e.target.value);
    }

    async function createNewChat() {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        try {
            const response = await axios.post('http://localhost:3002/chat/new', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const newChatId = response.data._id;
            setChatId(newChatId);
            setSelectChat(newChatId);
            setInputEnabled(true);
            getAllChats();
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    }

    async function sendMessage() {
        const userMessage = userInput.trim();
        if (!userMessage) return;

        try {
            await axios.post(`http://localhost:3002/chat/${chatId}`, {
                messages: [{ role: 'user', content: userMessage }],
            });
            setUserInput("");
            getAllChats(); // Refresh chats after sending a message
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function deleteChat(historyId) {
        try {
            await axios.delete(`http://localhost:3002/chat/${historyId}`);
            getAllChats();
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    }

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
                        {listOfChats.map((e, i) => (
                            <div key={i}>
                                <button onClick={() => {
                                    setSelectChat(e._id);
                                    setInputEnabled(true);
                                    setChatId(e._id);
                                }}>{e.date}</button>
                                <button onClick={() => deleteChat(e._id)}>X</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chatDisplay">
                    {listOfChats.find(chat => chat._id === selectChat)?.content.map((message, index) => (
                        <div key={index} className="message">
                            <p className="userMessage">{message.userText}</p>
                            {message.PAtext && (
                                <p className="assistantMessage">{message.PAtext}</p>
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