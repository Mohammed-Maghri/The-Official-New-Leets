"use client";

import { useContext, useEffect, useState, useRef, useLayoutEffect } from "react";
import { ContextCreator } from "@/component/context/context";

export default function ChatPage() {
  const context = useContext(ContextCreator);

  // Get everything from context - no local state for messages!
  const socket = context?.socket;
  const isConnected = context?.isSocketConnected || false;
  const messages = context?.messages || [];
  const hasMore = context?.hasMore || false;
  const isLoading = context?.isLoadingMessages ?? true; // Use ?? instead of || to properly check for false
  const isLoadingMore = context?.isLoadingMore || false;
  const setIsLoadingMore = context?.setIsLoadingMore;

  // Local UI state only
  const [newMessage, setNewMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  // Log when chat page mounts (only once on mount)
  useEffect(() => {
  }, [socket, isConnected, messages.length, isLoading]);

  useLayoutEffect(() => {
    if (messagesEndRef.current && !isLoadingMore && messages.length > 0) {
      const container = messagesContainerRef.current;

      if (isInitialLoadRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);
        setShowScrollButton(false);
        isInitialLoadRef.current = false;
      } else if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          setShowScrollButton(false);
        } else {
          setShowScrollButton(true);
        }
      }
    }
  }, [messages.length, isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (!isInitialLoadRef.current) {
      setShowScrollButton(!isNearBottom);
    }

    if (container.scrollTop === 0 && hasMore && !isLoadingMore && socket && setIsLoadingMore) {
      setIsLoadingMore(true);
      socket.emit("loadMoreMessages", { offset: messages.length });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && isConnected) {
      socket.emit("sendMessage", { message: newMessage.trim() });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {

    if (!socket) {
      return;
    }
    if (!isConnected) {
      return;
    }
    if (!context?.userData?.login) {
      return;
    }

    const message = messages.find(msg => msg.id === messageId);

    const userReacted = message?.reactions?.some(
      r => r.emoji === emoji && r.users.includes(context.userData!.login)
    );

    if (userReacted) {
      socket.emit("removeReaction", { messageId, emoji });
    } else {
      socket.emit("addReaction", { messageId, emoji });
    }
  };

  const formatTime = (timestamp: number | string) => {
    const ts = typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;
    if (!ts || isNaN(ts)) return "00:00";

    const timestampInt = Math.floor(ts);
    const date = new Date(timestampInt);
    if (isNaN(date.getTime())) return "00:00";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!context?.userData) {
    return (
      <div className="flex flex-1 overflow-auto p-5 sm:p-10 gap-2 z-10 flex-col items-center justify-center">
        <div className="text-[#151515] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-auto p-3 sm:p-6 gap-2 z-10 flex-col">
      <div className="w-full bg-[#ece9d8]  rounded-lg border border-[#a0a6b0] flex flex-1 flex-col overflow-hidden relative ">

        {/* Header with welcome message */}
        <div className="flex-shrink-0 bg-[#f5f3e9]    border-b border-[#a0a6b0] px-4 sm:px-6 py-3 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f5f3e9]   border border-[#a0a6b0] flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3e3d35] tracking-tight">Global Chat</h2>
                <p className="text-xs text-[#3e3d35] font-medium">Feel free to discuss any subject</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e2dfd0] border border-[#a0a6b0] rounded-md">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#d9e5f5] animate-pulse' : 'bg-[#d9e5f5]'}`}></div>
                <span className="text-xs text-[#3e3d35] font-medium">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-[#e2dfd0] border border-[#a0a6b0] rounded-md">
                <span className="text-xs text-[#3e3d35] font-medium">{messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 relative z-10 bg-[#ece9d8]"
        style={{ minHeight: 0 }}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 bg-[#e2dfd0]  px-4 py-2 rounded-full">
                <div className="w-4 h-4 border-2 border-[#a0a6b0] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-[#3e3d35]">Loading more messages...</span>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-lg border-2 border-[#a0a6b0]"></div>
                <div className="absolute inset-0 rounded-lg border-2 border-transparent border-t-neutral-600/80 border-r-neutral-600/60 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
              <h3 className="text-base font-semibold text-[#3e3d35] mb-1.5">Loading Chat</h3>
              <p className="text-sm text-[#3e3d35]">Connecting to the conversation</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-lg bg-[#e2dfd0] border border-[#a0a6b0] flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-base font-semibold text-[#3e3d35] mb-1.5">No messages yet</h3>
              <p className="text-sm text-[#3e3d35] max-w-sm">Be the first to start the conversation! Feel free to discuss any subject with fellow students.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.username === context.userData?.login;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isSameUser = prevMsg && prevMsg.username === msg.username;
              const timeDiff = prevMsg ? Math.abs(msg.timestamp - prevMsg.timestamp) : Infinity;
              const isWithin30Seconds = timeDiff < 30000;
              const isConsecutive = isSameUser && isWithin30Seconds;
              const showAvatar = !isConsecutive;
              const showHeader = !isConsecutive;

              return (
                <div
                  key={msg.id}
                  className={`group flex items-start ${showAvatar ? 'animate-fade-in' : ''} ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  } ${!showAvatar ? 'mt-1' : 'mt-4'}`}
                >
                  {/* Avatar or spacer - always 40px width */}
                  {/* <div className="flex-shrink-0 w-10 h-10">
                    {showAvatar && (
                      <img
                        src={msg.avatar}
                        alt={msg.username}
                        className="w-10 h-10 rounded-full border-2 border-[#a0a6b0]"
                      />
                    )}
                  </div> */}

                  {/* Consistent spacing after avatar/spacer - always 12px */}
                  <div className="w-3" />

                  <div
                    className={`relative flex flex-col max-w-[85%] sm:max-w-[75%] min-w-[150px] ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="absolute -top-3 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                      {/* <div className="flex gap-1 bg-[#e2dfd0]  border border-[#a0a6b0] rounded-lg p-1.5  ">
                        {["❤️", "😂", "👍"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#d6d2c2] transition-all text-lg hover:scale-110"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div> */}
                    </div>

                    {showHeader && (
                      <div
                        className={`flex items-center gap-2 mb-1.5 ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <span className="font-semibold text-sm text-[#151515]">{msg.username}</span>
                        <span className="bg-[#d9e5f5] text-[#151515] text-[10px] px-2 py-0.5 rounded-full font-medium">
                          Lvl {Math.floor(msg.level)}
                        </span>
                        <span className="bg-[#d9e5f5] text-[#151515] text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {msg.campus}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col items-start gap-1 w-full">
                      {msg.flagged && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#d9e5f5] border border-[#a0a6b0] rounded-md mb-1">
                          <span className="text-[#3e3d35] text-xs">⚠️</span>
                          <span className="text-[#3e3d35] text-[10px] font-medium">
                            Flagged Content ({msg.moderationSeverity})
                          </span>
                        </div>
                      )}
                      <div
                        className={`relative inline-block max-w-full px-3.5 py-2.5 pb-6 rounded-lg  transition-all ${
                          msg.flagged
                            ? "bg-[#ece9d8] border border-[#a0a6b0] text-[#3e3d35]"
                            : isOwnMessage
                            ? "bg-[#ece9d8] border border-[#a0a6b0] text-[#3e3d35] "
                            : "bg-[#ece9d8] border border-[#a0a6b0] text-[#3e3d35]"
                        }`}
                      >
                        {msg.message.length > 300 && !expandedMessages.has(msg.id) ? (
                          <div className="pr-12">
                            {/* <p className="break-words break-all whitespace-pre-wrap text-sm leading-relaxed overflow-hidden min-w-0">
                              {msg.message.substring(0, 300)}...
                            </p>
                            <button
                              onClick={() => toggleMessageExpansion(msg.id)}
                              className={`text-xs mt-1 underline hover:opacity-80 transition-opacity ${
                                isOwnMessage ? "text-[#3e3d35]" : "text-[#3e3d35]"
                              }`}
                            >
                              Show more
                            </button> */}
                          </div>
                        ) : (
                          <div className="pr-12">
                            <p className="break-words break-all whitespace-pre-wrap text-sm leading-relaxed overflow-hidden min-w-0">
                              {msg.message}
                            </p>
                            {msg.message.length > 300 && (
                              <button
                                onClick={() => toggleMessageExpansion(msg.id)}
                                className={`text-xs mt-1 underline hover:opacity-80 transition-opacity ${
                                  isOwnMessage ? "text-[#3e3d35]" : "text-[#3e3d35]"
                                }`}
                              >
                                Show less
                              </button>
                            )}
                          </div>
                        )}
                        <span className={`absolute bottom-1 right-2 text-[10px] ${
                          isOwnMessage ? "text-[#3e3d35]" : "text-[#3e3d35]"
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.reactions.map((reaction) => {
                            const userReacted = reaction.users.includes(context.userData?.login || "");
                            return (
                              <button
                                key={reaction.emoji}
                                onClick={() => handleReaction(msg.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                  userReacted
                                    ? "bg-[#d9e5f5] border border-[#a0a6b0] hover:bg-[#d9e5f5]"
                                    : "bg-[#e2dfd0] border border-[#a0a6b0] hover:bg-[#d6d2c2]"
                                }`}
                                title={reaction.users.join(", ")}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-[10px] font-medium">{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 bg-[#d9e5f5] hover:bg-[#d6d2c2] text-[#151515] p-3 rounded-full  -500/30 transition-all duration-200 hover:scale-110 z-[60] flex items-center justify-center"
          title="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}

      <div className="flex-shrink-0 bg-[#ece9d8]  border-t border-[#a0a6b0] px-3 sm:px-6 py-3.5 relative z-50">
        <div className="flex flex-col gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 sm:gap-3 relative z-50 w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected
                  ? "Type your message... (Press Enter to send)"
                  : "Connecting..."
              }
              disabled={!isConnected}
              className="flex-1 bg-[#ece9d8] text-[#3e3d35] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-[#a0a6b0]
                       focus:outline-none focus:border-[#a0a6b0] focus:ring-1 focus:ring-neutral-900/30
                       disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#3e3d35]
                       relative z-50 cursor-text pointer-events-auto transition-all text-sm sm:text-base
                       min-w-0 "
              maxLength={1000}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-[#ece9d8] hover:bg-[#ece9d8] border border-[#a0a6b0]
                       text-[#3e3d35] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#e2dfd0]
                       transition-all duration-200 hover:border-[#a0a6b0]
                       relative z-50 cursor-pointer pointer-events-auto flex items-center gap-1.5 sm:gap-2
                       flex-shrink-0 text-sm sm:text-base"
            >
            <span>{!isConnected ? "Connecting..." : "Send"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          </div>
          <p className="text-[10px] text-[#3e3d35] text-center">
            🗑️ Messages will be automatically deleted after 24 hours
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
