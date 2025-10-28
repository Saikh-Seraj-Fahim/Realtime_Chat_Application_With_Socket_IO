import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

import PropTypes from "prop-types";

const socket = io.connect("http://localhost:3001");

export default function ChatRoom({ username, room }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [typingMsg, setTypingMsg] = useState("");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.emit("join_room", room);

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("user_typing", (user) => {
            setTypingMsg(`${user} is typing...`);
            setTimeout(() => setTypingMsg(""), 2000);
        });

        return () => {
            socket.off("receive_message");
            socket.off("user_typing");
        };
    }, [room]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (message.trim()) {
            const messageData = {
                room: room,
                author: username,
                message: message,
                id: crypto.randomUUID(),
                time: new Date().toLocaleTimeString()
            }
            socket.emit('send_message', messageData);
            setMessages((prev) => [...prev, messageData]);
            setMessage(''); // making message box blank
        }
    };

    const handleTyping = () => {
        socket.emit('typing', { username, room });
    }

    return (
        <div className="w-full max-w-2xl bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">
                Room: {room}({username})
            </h2>
            <div className="h-64 overflow-y-auto border p-2 mb-2 bg-gray-50 rounded">
                {messages.map((msg) => (
                    <div key={msg.id} className={`mb-1 ${msg.author === username ?
                        'text-right' : 'text-left'}`}>
                        <span className="font-semibold">{msg.author}: </span>{" "}
                        {msg.message}
                        <div className="text-xs text-gray-400">{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <p className="text-sm italic text-gray-500 mb-2">{typingMsg}</p>

            <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2 border rounded"
            />
            <button onClick={sendMessage} className="bg-green-500 px-2 py-1
            cursor-pointer ml-2">Send</button>
        </div>
    );
}

ChatRoom.propTypes = {
    username: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
};


// join_room and receive_message are not functions — they are custom event names
// that we define.

// socket.emit(eventName, data)
// ➡️ sends (emits) an event with a name (eventName) and some data to the
// server (or another socket).

// socket.on(eventName, callback)
// ➡️ listens for an event with a specific name, and runs the callback function when
// that event happens.
