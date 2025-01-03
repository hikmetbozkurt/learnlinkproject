import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axiosConfig';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatArea from '../components/Chat/ChatArea';
import '../styles/pages/chatrooms.css';

const SOCKET_URL = 'http://localhost:5001';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
  dm_id?: number;
  chatroom_id?: number;
}

interface DirectMessage {
  id: string;
  name: string;
  lastMessage?: string;
  createdAt?: string;
}

const DirectMessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const initialChat = location.state?.selectedChat || null;
  const [selectedChat, setSelectedChat] = useState<DirectMessage | null>(initialChat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      auth: {
        token: token.replace(/['"]+/g, '')
      }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      if (user?.user_id) {
        socket.emit('user_connected', user.user_id.toString());
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected to chat server after', attemptNumber, 'attempts');
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from chat server:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // Handle both new_direct_message and direct_message events
    const handleNewMessage = (message: Message) => {
      if (selectedChat && message.dm_id === parseInt(selectedChat.id)) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => 
            m.id === message.id || 
            (m.content === message.content && 
             m.sender_id === message.sender_id && 
             Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 1000)
          );

          if (exists) return prev;
          return [...prev, message];
        });
      }
      // Refresh direct messages list to update last message
      fetchDirectMessages();
    };

    socket.on('new_direct_message', handleNewMessage);
    socket.on('direct_message', handleNewMessage);

    return () => {
      if (socket) {
        socket.off('new_direct_message', handleNewMessage);
        socket.off('direct_message', handleNewMessage);
        socket.disconnect();
      }
    };
  }, [user?.user_id, selectedChat]);

  useEffect(() => {
    fetchDirectMessages();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/api/direct-messages/${selectedChat.id}/messages`);
          const messagesData = response.data.data || [];
          setMessages(messagesData);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
        }
      };

      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Handle joining/leaving DM rooms when chat is selected
  useEffect(() => {
    if (!socketRef.current || !selectedChat) return;

    // Join the DM room when selected
    socketRef.current.emit('join_dm', selectedChat.id);
    console.log('Joined DM:', selectedChat.id);

    return () => {
      socketRef.current?.emit('leave_dm', selectedChat.id);
      console.log('Left DM:', selectedChat.id);
    };
  }, [selectedChat]);

  // Handle new messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      if (selectedChat && message.dm_id === parseInt(selectedChat.id)) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => 
            m.id === message.id || 
            (m.content === message.content && 
             m.sender_id === message.sender_id && 
             Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 1000)
          );

          if (exists) return prev;
          return [...prev, message];
        });
        // Refresh direct messages list to update last message
        fetchDirectMessages();
      }
    };

    socketRef.current.on('new_direct_message', handleNewMessage);

    return () => {
      socketRef.current?.off('new_direct_message', handleNewMessage);
    };
  }, [selectedChat]);

  const fetchDirectMessages = async () => {
    try {
      const response = await api.get('/api/direct-messages');
      const formattedMessages = response.data.map((msg: any) => ({
        id: String(msg.id),
        name: msg.name,
        lastMessage: msg.last_message,
        createdAt: msg.updated_at
      }));
      setDirectMessages(formattedMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage.trim()
      };

      const response = await api.post(`/api/direct-messages/${selectedChat.id}/messages`, messageData);
      
      // Add the message to the local state immediately
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Emit the message through socket for real-time update
      if (socketRef.current) {
        socketRef.current.emit('direct_message', response.data);
      }

      // Refresh direct messages list to update last message
      fetchDirectMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Ensure user ID is always a number
  const currentUserId = user?.user_id || user?.id || 0;

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.delete(`/api/direct-messages/${id}`);
      setDirectMessages(prev => prev.filter(dm => dm.id !== id));
      if (selectedChat?.id === id) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatSidebar
          rooms={directMessages}
          selectedRoom={selectedChat?.id}
          searchQuery=""
          onSearchChange={() => {}}
          onJoinRoom={(id) => {
            const chat = directMessages.find(dm => dm.id === id);
            if (chat) setSelectedChat(chat);
          }}
          onCreateRoom={() => {}}
          onDeleteRoom={handleDeleteConversation}
          hideCreateButton={true}
        />
        {selectedChat ? (
          <ChatArea
            messages={messages}
            currentUserId={currentUserId}
            roomName={selectedChat.name}
            newMessage={newMessage}
            onNewMessageChange={(e) => setNewMessage(e.target.value)}
            onSendMessage={handleSendMessage}
            formatMessageTime={formatMessageTime}
            type="direct"
          />
        ) : (
          <div className="chat-main">
            <div className="no-chat-selected">
              <h2>Select a conversation to start messaging</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesPage; 