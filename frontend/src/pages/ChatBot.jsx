import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Escola', text: 'Reunião de pais dia 15/05', time: '10:30', unread: true },
    { id: 2, sender: 'Professor Carlos', text: 'Trabalho de Matemática', time: '09:15', unread: true },
    { id: 3, sender: 'Secretaria', text: 'Documentos pendentes', time: '08:00', unread: false },
  ]);

  //abrir e fecahr o chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      console.log('Chat aberto, mensagens:', messages.length);
    }
  };

  //marcar como lida quando clicado
  const markAsRead = (id) => {
    const updatedMessages = messages.map(message => {
      if (message.id === id) {
        return {
          id: message.id,
          sender: message.sender,
          text: message.text,
          time: message.time,
          unread: false
        };
      } else {
        return message;
      }
    });
    
    setMessages(updatedMessages);
  };

  //conta mensagens nao lidas
  const unreadCount = () => {
    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].unread === true) {
        count = count + 1;
      }
    }
    return count;
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-icon" onClick={toggleChat}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
        </svg>
        
        {unreadCount() > 0 && (
          <span className="chatbot-badge">{unreadCount()}</span>
        )}
      </div>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>ChatBot</h3>
            <button onClick={toggleChat}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.length > 0 ? (
              messages.map(msg => {
                let messageClass = 'chatbot-message';
                if (msg.unread) {
                  messageClass = messageClass + ' unread';
                }
                
                return (
                  <div 
                    key={msg.id} 
                    className={messageClass}
                    onClick={() => markAsRead(msg.id)}
                  >
                    <div className="message-sender">{msg.sender}</div>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">Nenhuma mensagem</div>
            )}
          </div>
          
          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder="Digite sua mensagem..." 
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (e.target.value !== '') {
                    console.log('Mensagem enviada:', e.target.value);
                    
                    //aqui vai botar a mensagem na listra
                    
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;