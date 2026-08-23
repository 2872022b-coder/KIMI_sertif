import React, { createContext, useContext, useReducer } from 'react';
import storage from '../services/storage.js';

const MessageContext = createContext(null);

const initialState = {
  messages: storage.getMessages(),
};

function messageReducer(state, action) {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    default:
      return state;
  }
}

export function MessageProvider({ children }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const refresh = () => {
    dispatch({ type: 'SET_MESSAGES', payload: storage.getMessages() });
  };

  // Client sends a question to admin
  const sendMessage = ({ userId, userName, userEmail, subject, content }) => {
    const msg = {
      id: storage.generateMessageId(),
      userId,
      userName,
      userEmail,
      subject,
      content,
      status: 'pending', // pending, answered, closed
      reply: null,
      repliedAt: null,
      createdAt: new Date().toISOString(),
    };
    const messages = storage.getMessages();
    messages.push(msg);
    storage.setMessages(messages);
    dispatch({ type: 'ADD_MESSAGE', payload: msg });
    return msg;
  };

  // Admin replies to a message
  const replyToMessage = (messageId, replyContent) => {
    const messages = storage.getMessages().map((m) =>
      m.id === messageId
        ? {
            ...m,
            reply: replyContent,
            status: 'answered',
            repliedAt: new Date().toISOString(),
          }
        : m
    );
    storage.setMessages(messages);
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  // Get messages for a specific user
  const getUserMessages = (userId) => {
    return state.messages
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Get all messages (for admin)
  const getAllMessages = () => {
    return state.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Get pending messages count (for admin badge)
  const getPendingCount = () => {
    return state.messages.filter((m) => m.status === 'pending').length;
  };

  // Get unread answered count for user
  const getUnreadAnsweredCount = (userId) => {
    return state.messages.filter((m) => m.userId === userId && m.status === 'answered').length;
  };

  // Mark as read (user saw the answer)
  const markAsRead = (messageId) => {
    const messages = storage.getMessages().map((m) =>
      m.id === messageId ? { ...m, status: 'closed' } : m
    );
    storage.setMessages(messages);
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  return (
    <MessageContext.Provider
      value={{
        messages: state.messages,
        refresh,
        sendMessage,
        replyToMessage,
        getUserMessages,
        getAllMessages,
        getPendingCount,
        getUnreadAnsweredCount,
        markAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export const useMessages = () => useContext(MessageContext);
