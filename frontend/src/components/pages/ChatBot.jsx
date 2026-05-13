import React, { useState, useRef, useEffect } from 'react';
import { chatBotService } from '../../services/chatBotService';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: '👋 Olá! Sou o assistente Aurora. Posso ajudar com:\n\n📊 Notas e desempenho\n📅 Frequência\n📚 Matérias\n👨‍🏫 Professores\n\nComo posso ajudar?', 
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'bot'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chamar a API do chatbot (que consulta o banco + IA)
      const response = await chatBotService.sendMessage(inputMessage, 'student'); // pode ser dinâmico

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro no chatbot:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '❌ Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'bot'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Exemplos de perguntas rápidas
  const quickQuestions = [
    '📊 Como estão minhas notas?',
    '📅 Qual minha frequência?',
    '📚 Quais matérias estou em recuperação?',
    '📈 Qual minha média geral?'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Enviar automaticamente
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-icon" onClick={toggleChat}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
        </svg>
      </div>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="bot-avatar">🤖</span>
              <div>
                <h3>Aurora Assistente</h3>
                <span className="bot-status">Online • IA</span>
              </div>
            </div>
            <button onClick={toggleChat} className="close-btn">×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message-wrapper ${msg.type}`}
              >
                <div className={`message-bubble ${msg.type}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message-bubble bot typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões rápidas */}
          {messages.length <= 1 && (
            <div className="quick-questions">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          
          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;