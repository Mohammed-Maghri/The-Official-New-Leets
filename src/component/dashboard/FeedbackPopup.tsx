"use client";
import React, { useState } from "react";
import { IoClose, IoStar, IoStarOutline } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { BsLightbulb, BsStars, BsCodeSlash } from "react-icons/bs";
import { FaHandsHelping, FaBrain } from "react-icons/fa";
import { z } from "zod";
import { 
  feedbackSchema, 
  FeedbackPopupProps, 
  FormErrors 
} from "./FeedbackPopup.types";

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose, username }) => {
  const [feedback, setFeedback] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [improvements, setImprovements] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wantsToContribute, setWantsToContribute] = useState(false);
  const [contributionArea, setContributionArea] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);

  const firstName = username?.split(' ')[0] || 'there';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const formData = {
      feedback,
      dislikes,
      improvements,
      rating,
      skills: wantsToContribute ? "designer" : "",
      contributionArea: wantsToContribute ? ["design"] : [],
    };

    try {
      feedbackSchema.parse(formData);
      
      setShowConfirmation(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path[0] as keyof FormErrors;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
    }
  };

  const handleConfirmSubmit = async () => {
    const formData = {
      feedback,
      dislikes,
      improvements,
      rating,
      skills: wantsToContribute ? "designer" : "",
      contributionArea: wantsToContribute ? ["design"] : [],
    };
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to submit feedback:", result);
        
        let errorMsg = "";
        
        if (response.status === 429) {
          const retryMinutes = result.retryAfter ? Math.ceil(result.retryAfter / 60) : 10;
          errorMsg = `⏱️ Slow down!\n\n${result.message || `You can submit feedback again in ${retryMinutes} minute(s).`}`;
        } else if (response.status === 403 && result.message?.includes("maximum")) {
          errorMsg = `🎯 Limit Reached\n\n${result.message || "You have reached the maximum feedback limit of 2 submissions."}`;
        } else {
          errorMsg = `❌ Error\n\n${result.error || result.message || "Failed to submit feedback. Please try again."}`;
        }
        
        setErrorMessage(errorMsg);
        setShowConfirmation(false);
        setShowError(true);
        return;
      }

      
      if (result.remainingSubmissions !== undefined) {
      }
      
      setShowConfirmation(false);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrorMessage("❌ Network Error\n\nAn error occurred. Please check your connection and try again.");
      setShowConfirmation(false);
      setShowError(true);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="relative w-full h-full sm:max-w-4xl sm:max-h-[90vh] bg-gray-950/98 border-2 sm:border-4 theme-border-strong overflow-hidden"
        style={{ boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {/* Pixel corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border z-20" />
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)] transition-all duration-300 group active:translate-y-0.5"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors" />
        </button>

        {/* Content */}
        <div className="relative h-full flex flex-col p-4 sm:p-8 md:p-12 overflow-y-auto">
          {!submitted && !showConfirmation && !showError ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <p className="theme-text text-lg sm:text-xl md:text-2xl font-bold mb-2 uppercase tracking-wider">
                  Hi {firstName}!
                </p>
                <p className="theme-text-muted text-sm sm:text-base max-w-xl leading-relaxed px-2">
                  Help me shape this platform by sharing your thoughts or why not redesign the UI yourself?
                </p>
                <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm mt-1 px-2 opacity-80">
                  I&apos;ll apply your design if it&apos;s good.
                </p>
                
                <p className="text-[var(--theme-primary)] text-xs sm:text-sm mt-3 px-2 leading-relaxed">
                  If you could do a cool UI and deliver it, we could collaborate and apply it <span className="theme-text font-bold">( experience does Not matter )</span>, else you can just share your thoughts.
                </p>
                
                <div className="flex flex-col items-center mt-2">
                  <img 
                    src="/cat.png" 
                    alt="Please help" 
                    className="w-12 h-12 object-cover border-2 theme-border"
                    style={{ imageRendering: "pixelated", boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }}
                  />
                  <p className="theme-text-muted text-xs mt-1 font-semibold">
                    Do it Bliiiiiiz or you&apos;re getting Banned hhhh ( I&apos;m just kidding )
                  </p>
                </div>
                
                <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm mt-2 italic opacity-80">
                  You will earn a badge for responding based on the feedback.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 sm:gap-6">
                {/* General Error */}
                {errors.feedback && !feedback && (
                  <div className="border-2 border-red-500/50 bg-red-500/10 p-3" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-red-400 text-xs sm:text-sm text-center font-bold uppercase tracking-wider">
                      {errors.feedback}
                    </p>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <label className="theme-text text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span className="text-[var(--theme-primary)]">✦</span>
                    What features or modifications would you like to see?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      if (errors.feedback) setErrors((prev) => ({ ...prev, feedback: "" }));
                    }}
                    placeholder="Share your ideas, feature requests, or suggestions for new features..."
                    className={`flex-1 min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-[var(--theme-bg-card)] border-2 text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm resize-none focus:outline-none transition-all ${
                      errors.feedback && feedback
                        ? "border-red-500/50"
                        : "theme-border focus:border-[var(--theme-primary)]"
                    }`}
                    style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                  />
                  {errors.feedback && feedback && (
                    <p className="text-red-400 text-xs mt-1 font-bold uppercase">{errors.feedback}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="theme-text text-xs sm:text-sm font-bold mb-2 sm:mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span className="text-red-400">✦</span>
                    What don&apos;t you like about the platform?
                  </label>
                  <textarea
                    value={dislikes}
                    onChange={(e) => {
                      setDislikes(e.target.value);
                      if (errors.dislikes) setErrors((prev) => ({ ...prev, dislikes: "" }));
                    }}
                    placeholder="Tell us about any issues, bugs, or things that frustrate you..."
                    className={`min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-[var(--theme-bg-card)] border-2 text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm resize-none focus:outline-none transition-all ${
                      errors.dislikes ? "border-red-500/50" : "theme-border focus:border-[var(--theme-primary)]"
                    }`}
                    style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                  />
                  {errors.dislikes && (
                    <p className="text-red-400 text-xs mt-1 font-bold uppercase">{errors.dislikes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="improvements" className="flex theme-text-muted text-sm sm:text-base font-bold items-center gap-2 uppercase tracking-wider">
                    <span className="text-amber-400">💡</span> What&apos;s Missing?
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => {
                      setImprovements(e.target.value);
                      if (errors.improvements) setErrors((prev) => ({ ...prev, improvements: "" }));
                    }}
                    placeholder="Share your thoughts on how I can improve existing features..."
                    className={`min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-[var(--theme-bg-card)] border-2 text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm resize-none focus:outline-none transition-all ${
                      errors.improvements ? "border-red-500/50" : "theme-border focus:border-[var(--theme-primary)]"
                    }`}
                    style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                  />
                  {errors.improvements && (
                    <p className="text-red-400 text-xs mt-1 font-bold uppercase">{errors.improvements}</p>
                  )}
                </div>

                <div>
                  <label className="theme-text text-xs sm:text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span className="text-amber-400">✦</span>
                    How would you rate your overall experience?
                  </label>
                  <div className={`flex items-center gap-2 sm:gap-3 ${
                    errors.rating ? "border-2 border-red-500/50 p-2" : ""
                  }`}
                    style={errors.rating ? { boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" } : {}}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          if (errors.rating) setErrors((prev) => ({ ...prev, rating: "" }));
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all duration-200 transform hover:scale-110 focus:outline-none"
                      >
                        {(hoverRating || rating) >= star ? (
                          <IoStar className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 drop-shadow-lg" />
                        ) : (
                          <IoStarOutline className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:text-yellow-400/50" />
                        )}
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 theme-text text-sm sm:text-base font-bold">
                        {rating} / 5
                      </span>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="text-red-400 text-xs mt-2 font-bold uppercase">{errors.rating}</p>
                  )}
                  <p className="text-xs theme-text-muted mt-2 opacity-80">
                    {rating === 0 && "Click to rate"}
                    {rating === 1 && "Ouch! That hurts more than a seg fault!"}
                    {rating === 2 && "Like code that compiles but doesn't work..."}
                    {rating === 3 && "Meh, it's like using vim for the first time"}
                    {rating === 4 && "Nice! Almost as good as finding a bug at 3 AM"}
                    {rating === 5 && "LEGENDARY! Better than passing Norminette!"}
                  </p>
                </div>

                {/* Contribution Section */}
                <div className="border-t-2 theme-border pt-4 sm:pt-6">
                  {/* Badge Showcase */}
                  <div className="bg-[var(--theme-bg-card)] border-2 theme-border p-3 sm:p-4 mb-4 sm:mb-6" style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)" }}>
                    <p className="theme-text-muted text-[10px] sm:text-xs mb-3 text-center font-bold uppercase tracking-wider">
                      CONTRIBUTOR BADGES YOU CAN EARN
                    </p>
                    <p className="text-[var(--theme-text-muted)] text-[9px] sm:text-[10px] mb-3 text-center opacity-80">
                      These badges will appear as animated pills next to your rank on the leaderboard! 🏆
                    </p>
                    <div className="flex flex-col gap-2 sm:gap-3 items-center">
                      {/* Genius Badge */}
                      <div className="px-3 py-1.5 border-2 border-purple-400/60 flex flex-row items-center gap-1 bg-purple-500/30" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <BsLightbulb className="text-purple-200 text-[12px]" />
                        <span className="text-purple-200 text-[8px] font-bold tracking-widest uppercase">GENIUS</span>
                      </div>
                      {/* Helpful Badge */}
                      <div className="px-3 py-1.5 border-2 border-blue-400/60 flex flex-row items-center gap-1 bg-blue-500/30" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <FaHandsHelping className="text-blue-200 text-[12px]" />
                        <span className="text-blue-200 text-[8px] font-bold tracking-widest uppercase">HELPFUL</span>
                      </div>
                      {/* Innovative Badge */}
                      <div className="px-3 py-1.5 border-2 border-green-400/60 flex flex-row items-center gap-1 bg-green-500/30" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <BsLightbulb className="text-green-200 text-[12px]" />
                        <span className="text-green-200 text-[8px] font-bold tracking-widest uppercase">INNOVATIVE</span>
                      </div>
                      {/* Thinker Badge */}
                      <div className="px-3 py-1.5 border-2 border-indigo-400/60 flex flex-row items-center gap-1 bg-indigo-500/30" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <FaBrain className="text-indigo-200 text-[12px]" />
                        <span className="text-indigo-200 text-[8px] font-bold tracking-widest uppercase">THINKER</span>
                      </div>
                      {/* Contributor Badge */}
                      <div className="px-3 py-1.5 border-2 border-rose-400/60 flex flex-row items-center gap-1 bg-rose-500/30" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <BsStars className="text-rose-200 text-[12px]" />
                        <span className="text-rose-200 text-[8px] font-bold tracking-widest uppercase">CONTRIBUTOR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <input
                      type="checkbox"
                      id="wantsToContribute"
                      checked={wantsToContribute}
                      onChange={(e) => {
                        setWantsToContribute(e.target.checked);
                        setContributionArea(['design']);
                      }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 theme-border bg-[var(--theme-bg-card)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="wantsToContribute" className="theme-text text-sm sm:text-base font-bold cursor-pointer flex items-center gap-2 uppercase tracking-wider">
                      <BsCodeSlash className="text-emerald-400 hidden sm:inline" />
                      I want to collaborate on this project
                    </label>
                  </div>
                  
                  <p className="theme-text-muted text-xs ml-6 sm:ml-7 -mt-2 mb-3 flex items-center gap-1 opacity-80">
                    I&apos;ll contact through the website if you choose to collaborate <span className="text-red-400">❤</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-4 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 active:translate-y-0.5 hover:scale-[1.02] group"
                  style={{
                    color: "var(--theme-text)",
                    background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 60%, transparent), color-mix(in srgb, var(--theme-primary-dark) 70%, transparent))",
                    boxShadow: "4px 4px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <span className="text-base sm:text-lg">Submit Your Ideas</span>
                  <FiSend className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </>
          ) : showConfirmation ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <h2 className="text-2xl sm:text-3xl font-bold theme-text mb-4 text-center uppercase tracking-wider">
                Review Your Feedback
              </h2>
              <p className="theme-text-muted text-xs sm:text-sm mb-6 text-center">
                Here&apos;s what your submission will look like
              </p>

              <div className="flex-1 space-y-4 overflow-y-auto mb-6">
                <div className="bg-[var(--theme-bg-card)] border-2 theme-border p-4" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                  <p className="theme-text-muted text-xs mb-2 font-bold uppercase tracking-wider">Rating</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="theme-text text-sm ml-2 font-bold">{rating} / 5</span>
                  </div>
                </div>

                {feedback && (
                  <div className="bg-[var(--theme-bg-card)] border-2 border-[var(--theme-primary)]/50 p-4" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-[var(--theme-primary)] text-xs mb-2 font-bold uppercase tracking-wider">Feature Ideas</p>
                    <p className="theme-text text-sm whitespace-pre-wrap">{feedback}</p>
                  </div>
                )}

                {dislikes && (
                  <div className="bg-[var(--theme-bg-card)] border-2 border-red-500/50 p-4" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-red-400 text-xs mb-2 font-bold uppercase tracking-wider">Dislikes</p>
                    <p className="theme-text text-sm whitespace-pre-wrap">{dislikes}</p>
                  </div>
                )}

                {improvements && (
                  <div className="bg-[var(--theme-bg-card)] border-2 border-amber-500/50 p-4" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-amber-400 text-xs mb-2 font-bold uppercase tracking-wider">Improvements</p>
                    <p className="theme-text text-sm whitespace-pre-wrap">{improvements}</p>
                  </div>
                )}

                {wantsToContribute && (
                  <div className="bg-[var(--theme-bg-card)] border-2 border-emerald-500/50 p-4" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-emerald-400 text-xs mb-2 font-bold uppercase tracking-wider">Wants to Contribute</p>
                    <p className="theme-text text-sm mb-2">
                      <span className="theme-text-muted">Skills:</span> Designer
                    </p>
                    <p className="theme-text text-sm">
                      <span className="theme-text-muted">Areas:</span>{" "}
                      {contributionArea.map((area) => (
                        <span
                          key={area}
                          className="inline-block bg-emerald-500/20 px-2 py-1 border border-emerald-500/50 text-xs mr-2 capitalize font-bold"
                          style={{ boxShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}
                        >
                          {area}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleCancelConfirmation}
                  className="flex-1 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text font-bold uppercase tracking-wider transition-all duration-300 hover:border-[var(--theme-primary)] active:translate-y-0.5"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-3 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:translate-y-0.5"
                  style={{
                    color: "var(--theme-text)",
                    background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 60%, transparent), color-mix(in srgb, var(--theme-primary-dark) 70%, transparent))",
                    boxShadow: "4px 4px 0 var(--theme-shadow-lg)",
                  }}
                >
                  <span>Confirm Submit</span>
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : showError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.2)" }}>
                  <IoClose className="w-10 h-10 text-red-400" />
                </div>
              </div>
              
              <div className="max-w-md">
                {errorMessage.split('\n\n').map((line, index) => (
                  <p 
                    key={index}
                    className={
                      index === 0 
                        ? "text-xl sm:text-2xl font-bold theme-text mb-4 uppercase tracking-wider" 
                        : "text-sm sm:text-base theme-text-muted leading-relaxed"
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
              
              <button
                onClick={onClose}
                className="mt-8 px-6 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text font-bold uppercase tracking-wider transition-all duration-300 hover:border-[var(--theme-primary)] active:translate-y-0.5"
                style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
              >
                Close
              </button>
            </div>
          ) : submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-bold theme-text mb-3 sm:mb-4 uppercase tracking-wider">
                Thank You
              </h2>
              
              <p className="theme-text-muted text-sm sm:text-base max-w-md leading-relaxed">
                Your feedback has been received
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FeedbackPopup;
