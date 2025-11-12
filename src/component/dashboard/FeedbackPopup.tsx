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

      console.log("Feedback submitted successfully:", result);
      
      if (result.remainingSubmissions !== undefined) {
        console.log(`You have ${result.remainingSubmissions} feedback submission(s) remaining.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full h-full sm:max-w-4xl sm:max-h-[90vh] sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-0 sm:border border-gray-700/50 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 transition-all duration-300 group"
        >
          <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {/* Content */}
        <div className="relative h-full flex flex-col p-4 sm:p-8 md:p-12 overflow-y-auto">
          {!submitted && !showConfirmation && !showError ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <p className="text-white text-lg sm:text-xl md:text-2xl font-Tektur font-bold mb-2">
                  Hi {firstName}!
                </p>
                <p className="text-gray-300 text-sm sm:text-base font-Tektur max-w-xl leading-relaxed px-2">
                  Help me shape this platform by sharing your thoughts or why not redesign the UI yourself?
                </p>
                <p className="text-gray-400 text-xs sm:text-sm font-Tektur mt-1 px-2">
                  I&apos;ll apply your design if it&apos;s good.
                </p>
                
                <p className="text-blue-400 text-xs sm:text-sm font-Tektur mt-3 px-2 leading-relaxed">
                  If you could do a cool UI and deliver it, we could collaborate and apply it <span className="text-white font-bold">( experience does Not matter )</span>, else you can just share your thoughts.
                </p>
                
                <div className="flex flex-col items-center mt-2">
                  <img 
                    src="/cat.png" 
                    alt="Please help" 
                    className="w-12 h-12 object-cover rounded-full border-2 border-gray-600"
                  />
                  <p className="text-gray-300 text-xs font-Tektur mt-1 font-semibold">
                    Do it Bliiiiiiz or you&apos;re getting Banned hhhh ( I&apos;m just kidding )
                  </p>
                </div>
                
                <p className="text-gray-400 text-xs sm:text-sm font-Tektur mt-2 italic">
                  You will earn a badge for responding based on the feedback.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 sm:gap-6">
                {/* General Error */}
                {errors.feedback && !feedback && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-xs sm:text-sm font-Tektur text-center">
                      {errors.feedback}
                    </p>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <label className="text-white font-Tektur text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-blue-400">✦</span>
                    What features or modifications would you like to see?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => {
                      setFeedback(e.target.value);
                      if (errors.feedback) setErrors((prev) => ({ ...prev, feedback: "" }));
                    }}
                    placeholder="Share your ideas, feature requests, or suggestions for new features..."
                    className={`flex-1 min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 font-Tektur text-sm resize-none focus:outline-none transition-all ${
                      errors.feedback && feedback
                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  {errors.feedback && feedback && (
                    <p className="text-red-400 text-xs font-Tektur mt-1">{errors.feedback}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-white font-Tektur text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
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
                    className={`min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 font-Tektur text-sm resize-none focus:outline-none transition-all ${
                      errors.dislikes
                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-700/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                    }`}
                  />
                  {errors.dislikes && (
                    <p className="text-red-400 text-xs font-Tektur mt-1">{errors.dislikes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="improvements" className="flex text-gray-300 font-Tektur text-sm sm:text-base font-semibold items-center gap-2">
                    <span className="text-yellow-400">💡</span> What&apos;s Missing?
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => {
                      setImprovements(e.target.value);
                      if (errors.improvements) setErrors((prev) => ({ ...prev, improvements: "" }));
                    }}
                    placeholder="Share your thoughts on how I can improve existing features..."
                    className={`min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 font-Tektur text-sm resize-none focus:outline-none transition-all ${
                      errors.improvements
                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-700/50 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                    }`}
                  />
                  {errors.improvements && (
                    <p className="text-red-400 text-xs font-Tektur mt-1">{errors.improvements}</p>
                  )}
                </div>

                <div>
                  <label className="text-white font-Tektur text-xs sm:text-sm font-medium mb-3 flex items-center gap-2">
                    <span className="text-amber-400">✦</span>
                    How would you rate your overall experience?
                  </label>
                  <div className={`flex items-center gap-2 sm:gap-3 ${
                    errors.rating ? "border-2 border-red-500/30 rounded-lg p-2" : ""
                  }`}>
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
                      <span className="ml-2 text-white font-Tektur text-sm sm:text-base font-semibold">
                        {rating} / 5
                      </span>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="text-red-400 text-xs font-Tektur mt-2">{errors.rating}</p>
                  )}
                  <p className="text-xs text-gray-500 font-Tektur mt-2">
                    {rating === 0 && "Click to rate"}
                    {rating === 1 && "Ouch! That hurts more than a seg fault!"}
                    {rating === 2 && "Like code that compiles but doesn't work..."}
                    {rating === 3 && "Meh, it's like using vim for the first time"}
                    {rating === 4 && "Nice! Almost as good as finding a bug at 3 AM"}
                    {rating === 5 && "LEGENDARY! Better than passing Norminette!"}
                  </p>
                </div>

                {/* Contribution Section */}
                <div className="border-t border-gray-700/50 pt-4 sm:pt-6">
                  {/* Badge Showcase */}
                  <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700/30">
                    <p className="text-gray-400 text-[10px] sm:text-xs font-Tektur mb-3 text-center font-semibold">
                      CONTRIBUTOR BADGES YOU CAN EARN
                    </p>
                    <p className="text-gray-500 text-[9px] sm:text-[10px] font-Tektur mb-3 text-center">
                      These badges will appear as animated pills next to your rank on the leaderboard! 🏆
                    </p>
                    <div className="flex flex-col gap-2 sm:gap-3 items-center">
                      {/* Genius Badge - Pill Style */}
                      <div className="px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50 border-purple-300/60 shadow-purple-400/40 animate-pulse">
                        <BsLightbulb className="text-purple-100 text-[12px]" />
                        <span className="text-purple-100 font-Tektur text-[8px] font-bold tracking-widest">
                          GENIUS
                        </span>
                      </div>

                      {/* Helpful Badge - Pill Style */}
                      <div className="px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 border-blue-300/60 shadow-blue-400/40 animate-pulse">
                        <FaHandsHelping className="text-blue-100 text-[12px]" />
                        <span className="text-blue-100 font-Tektur text-[8px] font-bold tracking-widest">
                          HELPFUL
                        </span>
                      </div>

                      {/* Innovative Badge - Pill Style */}
                      <div className="px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 border-green-300/60 shadow-green-400/40 animate-pulse">
                        <BsLightbulb className="text-green-100 text-[12px]" />
                        <span className="text-green-100 font-Tektur text-[8px] font-bold tracking-widest">
                          INNOVATIVE
                        </span>
                      </div>

                      {/* Critical Thinker Badge - Pill Style */}
                      <div className="px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r from-indigo-500/50 to-violet-500/50 border-indigo-300/60 shadow-indigo-400/40 animate-pulse">
                        <FaBrain className="text-indigo-100 text-[12px]" />
                        <span className="text-indigo-100 font-Tektur text-[8px] font-bold tracking-widest">
                          THINKER
                        </span>
                      </div>

                      {/* Contributor Badge - Pill Style */}
                      <div className="px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r from-rose-500/50 to-red-500/50 border-rose-300/60 shadow-rose-400/40 animate-pulse">
                        <BsStars className="text-rose-100 text-[12px]" />
                        <span className="text-rose-100 font-Tektur text-[8px] font-bold tracking-widest">
                          CONTRIBUTOR
                        </span>
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
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-gray-800 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="wantsToContribute" className="text-white font-Tektur text-sm sm:text-base font-semibold cursor-pointer flex items-center gap-2">
                      <BsCodeSlash className="text-emerald-400 hidden sm:inline" />
                      I want to collaborate on this project
                    </label>
                  </div>
                  
                  <p className="text-gray-400 text-xs font-Tektur ml-6 sm:ml-7 -mt-2 mb-3 flex items-center gap-1">
                    I&apos;ll contact through the website if you choose to collaborate <span className="text-red-400">❤</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-4 bg-[#0070ef] hover:bg-[#0060d8] text-white font-Tektur font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-blue-500/20 group"
                >
                  <span className="text-base sm:text-lg">Submit Your Ideas</span>
                  <FiSend className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </>
          ) : showConfirmation ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <h2 className="text-2xl sm:text-3xl font-bold font-Tektur text-white mb-4 text-center">
                Review Your Feedback
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-Tektur mb-6 text-center">
                Here&apos;s what your submission will look like
              </p>

              <div className="flex-1 space-y-4 overflow-y-auto mb-6">
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-Tektur mb-2">Rating</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-white font-Tektur text-sm ml-2">{rating} / 5</span>
                  </div>
                </div>

                {feedback && (
                  <div className="bg-gray-800/30 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 text-xs font-Tektur mb-2">Feature Ideas</p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">{feedback}</p>
                  </div>
                )}

                {dislikes && (
                  <div className="bg-gray-800/30 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-Tektur mb-2">Dislikes</p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">{dislikes}</p>
                  </div>
                )}

                {improvements && (
                  <div className="bg-gray-800/30 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400 text-xs font-Tektur mb-2">Improvements</p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">{improvements}</p>
                  </div>
                )}

                {wantsToContribute && (
                  <div className="bg-gray-800/30 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-400 text-xs font-Tektur mb-2">Wants to Contribute</p>
                    <p className="text-gray-300 text-sm font-Tektur mb-2">
                      <span className="text-gray-400">Skills:</span> Designer
                    </p>
                    <p className="text-gray-300 text-sm font-Tektur">
                      <span className="text-gray-400">Areas:</span>{" "}
                      {contributionArea.map((area) => (
                        <span
                          key={area}
                          className="inline-block bg-emerald-500/20 px-2 py-1 rounded text-xs mr-2 capitalize"
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
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-Tektur font-semibold rounded-xl transition-all duration-300"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-3 bg-[#0070ef] hover:bg-[#0060d8] text-white font-Tektur font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Confirm Submit</span>
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : showError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                  <IoClose className="w-10 h-10 text-red-400" />
                </div>
              </div>
              
              <div className="max-w-md">
                {errorMessage.split('\n\n').map((line, index) => (
                  <p 
                    key={index}
                    className={`font-Tektur ${
                      index === 0 
                        ? 'text-xl sm:text-2xl font-bold text-white mb-4' 
                        : 'text-sm sm:text-base text-gray-300 leading-relaxed'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
              
              <button
                onClick={onClose}
                className="mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-Tektur font-semibold rounded-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          ) : submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-bold font-Tektur text-white mb-3 sm:mb-4">
                Thank You
              </h2>
              
              <p className="text-gray-300 text-sm sm:text-base font-Tektur max-w-md leading-relaxed">
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
