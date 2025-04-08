"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase/clientApp";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    where,
} from "firebase/firestore";
import {
    Send,
    Smile,
    Paperclip,
    X,
    File,
    Hash,
    PlusCircle,
    Settings,
    MoreHorizontal
} from "lucide-react";

// Define the Message type
interface Message {
    id: string;
    text: string;
    user: string;
    email: string;
    timestamp: number;
    channelId: string;
    fileAttachment?: {
        name: string;
        type: string;
        url: string;
    } | null;
}

// Define the Channel type
interface Channel {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    isPublic: boolean;
}

export default function CommunityChat() {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [showNewChannelForm, setShowNewChannelForm] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelDescription, setNewChannelDescription] = useState("");
    const [isPublicChannel, setIsPublicChannel] = useState(true);
    const [showChannelDropdown, setShowChannelDropdown] = useState(false);
    const [newMessage, setNewMessage] = useState<string>("");
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const channelFormRef = useRef<HTMLDivElement>(null);
    const channelDropdownRef = useRef<HTMLDivElement>(null);

    const commonEmojis = ["😊", "👍", "❤️", "🎉", "👋", "🙌", "😂", "🤔", "👏", "🔥", "✨", "😎"];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (channelFormRef.current && !channelFormRef.current.contains(event.target as Node)) {
                setShowNewChannelForm(false);
            }
            if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
                setShowChannelDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch channels from Firestore
    useEffect(() => {
        const channelsCollection = collection(db, "channels");
        const q = query(channelsCollection, orderBy("name", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const channelList: Channel[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Channel[];
            setChannels(channelList);

            if (channelList.length > 0 && !activeChannel) {
                setActiveChannel(channelList[0]); // Set default channel only if none is active
            }
        }, (error) => {
            console.error("Error fetching channels:", error);
        });

        return () => unsubscribe();
    }, []);

    // Fetch messages for the active channel
    useEffect(() => {
        if (!activeChannel) return;

        const messagesCollection = collection(db, "community-chat");
        const q = query(
            messagesCollection,
            where("channelId", "==", activeChannel.id),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageList: Message[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(messageList);
            console.log("Messages updated:", messageList); // Debug log
        }, (error) => {
            console.error("Error fetching messages:", error);
        });

        return () => unsubscribe();
    }, [activeChannel]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Create a new channel
    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim() || !session) return;

        try {
            const channelsCollection = collection(db, "channels");
            const newChannel = await addDoc(channelsCollection, {
                name: newChannelName,
                description: newChannelDescription,
                createdBy: session.user?.email,
                isPublic: isPublicChannel,
                createdAt: Date.now(),
            });

            setActiveChannel({
                id: newChannel.id,
                name: newChannelName,
                description: newChannelDescription,
                createdBy: session.user?.email || "",
                isPublic: isPublicChannel,
            });

            setNewChannelName("");
            setNewChannelDescription("");
            setIsPublicChannel(true);
            setShowNewChannelForm(false);
        } catch (error) {
            console.error("Error creating channel:", error);
        }
    };

    // Switch to a different channel
    const handleChannelSwitch = (channel: Channel) => {
        setActiveChannel(channel);
        setMessages([]); // Clear messages before switching
        setShowChannelDropdown(false);
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview("");
        }
    };

    // Remove selected file
    const removeSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Send a message
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !session || !activeChannel) return;

        let fileAttachment = null;
        if (selectedFile) {
            fileAttachment = {
                name: selectedFile.name,
                type: selectedFile.type,
                url: "file-url-would-go-here", // Replace with actual Firebase Storage URL in production
            };
        }

        try {
            const messagesCollection = collection(db, "community-chat");
            await addDoc(messagesCollection, {
                text: newMessage,
                user: session.user?.name || "Anonymous",
                email: session.user?.email || "",
                timestamp: Date.now(),
                channelId: activeChannel.id,
                fileAttachment,
            });

            setNewMessage("");
            removeSelectedFile();
            setShowEmoji(false);
            setShowFileUpload(false);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Add emoji to message
    const addEmoji = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
    };

    // Format timestamp to readable time
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (status === "loading") {
        return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
    }

    if (status === "unauthenticated") {
        return <div className="flex items-center justify-center h-screen bg-gray-50">Please sign in to join the community chat.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col h-screen bg-white shadow-lg">
            {/* Header with Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Community Chat</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span>{session?.user?.name ?? "User"}</span>
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Channel tabs */}
                <div className="flex items-center px-4 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                    {channels.slice(0, 5).map((channel) => (
                        <button
                            key={channel.id}
                            className={`flex items-center px-4 py-3 border-b-2 whitespace-nowrap ${activeChannel?.id === channel.id
                                ? "border-blue-500 text-blue-600 font-medium"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            onClick={() => handleChannelSwitch(channel)}
                        >
                            <Hash size={16} className="mr-1" />
                            {channel.name}
                        </button>
                    ))}

                    {channels.length > 5 && (
                        <div className="relative">
                            <button
                                className="flex items-center px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {showChannelDropdown && (
                                <div ref={channelDropdownRef} className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                    <div className="py-1">
                                        {channels.slice(5).map((channel) => (
                                            <button
                                                key={channel.id}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                onClick={() => handleChannelSwitch(channel)}
                                            >
                                                <Hash size={16} className="mr-2" />
                                                {channel.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <button
                            className="flex items-center px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            onClick={() => setShowNewChannelForm(!showNewChannelForm)}
                        >
                            <PlusCircle size={16} className="mr-1" />
                            <span className="text-sm">New</span>
                        </button>
                    </div>
                </div>

                {/* New channel form */}
                {showNewChannelForm && (
                    <div ref={channelFormRef} className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-base font-medium text-gray-800">Create a new channel</h4>
                                <button onClick={() => setShowNewChannelForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateChannel}>
                                <div className="mb-4">
                                    <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700 mb-1">Channel name</label>
                                    <input
                                        id="channel-name"
                                        type="text"
                                        placeholder="e.g. project-discussion"
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="channel-description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                    <textarea
                                        id="channel-description"
                                        placeholder="What's this channel about?"
                                        value={newChannelDescription}
                                        onChange={(e) => setNewChannelDescription(e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                </div>
                                <div className="mb-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="public-channel"
                                        checked={isPublicChannel}
                                        onChange={(e) => setIsPublicChannel(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="public-channel" className="text-sm text-gray-600">Public channel</label>
                                </div>
                                <div className="flex space-x-2">
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">Create Channel</button>
                                    <button type="button" onClick={() => setShowNewChannelForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-sm">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeChannel && (
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center">
                        <Hash size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">{activeChannel.description || `Welcome to #${activeChannel.name}`}</span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Hash size={40} className="mb-3" />
                            <h3 className="text-xl font-bold">Welcome to #{activeChannel?.name}</h3>
                            <p>This is the start of the #{activeChannel?.name} channel</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center my-3">
                                <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Today</div>
                            </div>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.email === session?.user?.email ? "justify-end" : "justify-start"} mb-4 group`}>
                                    {msg.email !== session?.user?.email && (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 mr-2 flex-shrink-0 flex items-center justify-center text-blue-500 text-sm font-bold">
                                            {msg.user.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        {msg.email !== session?.user?.email && (
                                            <div className="text-xs text-gray-500 ml-2 mb-1">{msg.user}</div>
                                        )}
                                        <div className={`p-3 rounded-lg shadow-sm ${msg.email === session?.user?.email ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-200"}`}>
                                            <p>{msg.text}</p>
                                            {msg.fileAttachment && msg.fileAttachment.type?.startsWith('image/') && (
                                                <div className="mt-2 rounded overflow-hidden">
                                                    <img src={msg.fileAttachment.url} alt="attachment" className="w-full" />
                                                </div>
                                            )}
                                            {msg.fileAttachment && !msg.fileAttachment.type?.startsWith('image/') && (
                                                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center text-sm">
                                                    <File size={16} className="mr-2" />
                                                    <span className="text-blue-500 truncate">{msg.fileAttachment.name}</span>
                                                </div>
                                            )}
                                            <div className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(msg.timestamp)}</div>
                                        </div>
                                    </div>
                                    {msg.email === session?.user?.email && (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 ml-2 flex-shrink-0 flex items-center justify-center text-blue-500 text-sm font-bold">
                                            {session.user.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                <div className="bg-white border-t border-gray-200 p-4">
                    {selectedFile && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center overflow-hidden">
                                {filePreview ? (
                                    <div className="w-10 h-10 mr-2 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 mr-2 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <File size={20} className="text-gray-500" />
                                    </div>
                                )}
                                <div className="truncate text-sm text-gray-600">{selectedFile.name}</div>
                            </div>
                            <button type="button" onClick={removeSelectedFile} className="ml-2 p-1 hover:bg-gray-200 rounded-full">
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="relative">
                        {showEmoji && (
                            <div className="absolute bottom-full mb-2 left-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 grid grid-cols-6 gap-2 w-64">
                                {commonEmojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => addEmoji(emoji)}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded cursor-pointer"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showFileUpload && (
                            <div className="absolute bottom-full mb-2 left-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64">
                                <div className="flex flex-col">
                                    <p className="text-sm text-gray-600 mb-2">Add a file to your message</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-full flex-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowFileUpload(false); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 ml-1">
                                    <Smile size={20} />
                                </button>
                                <button type="button" onClick={() => { setShowFileUpload(!showFileUpload); setShowEmoji(false); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message ${activeChannel ? `#${activeChannel.name}` : ''}`}
                                    className="flex-1 p-3 bg-transparent border-none focus:outline-none focus:ring-0"
                                    disabled={!activeChannel}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`p-3 rounded-full transition-colors ${(newMessage.trim() || selectedFile) && activeChannel ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                disabled={(!newMessage.trim() && !selectedFile) || !activeChannel}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}