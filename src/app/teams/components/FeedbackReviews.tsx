"use client";
import React, { useState, useEffect } from "react";
import { IoStar, IoClose } from "react-icons/io5";
import { BsStars, BsCodeSlash } from "react-icons/bs";
import { AiOutlineDatabase } from "react-icons/ai";
import { MdDesignServices } from "react-icons/md";
import { FiMail, FiMapPin } from "react-icons/fi";

interface FeedbackReview {
  id: number;
  user_login: string;
  user_email: string;
  user_image: string;
  campus_id: number;
  campus_name: string;
  feedback: string | null;
  dislikes: string | null;
  improvements: string | null;
  rating: number;
  wants_to_contribute: boolean;
  skills: string | null;
  contribution_area: string[] | null;
  badge_awarded: boolean;
  created_at: string;
}

interface FeedbackReviewsProps {
  isVisible: boolean;
  onClose: () => void;
}

const FeedbackReviews: React.FC<FeedbackReviewsProps> = ({ isVisible, onClose }) => {
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<FeedbackReview | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchReviews();
    }
  }, [isVisible]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("You don't have permission to view feedback reviews");
        } else {
          setError("Failed to fetch feedback reviews");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setReviews(data.feedback || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("An error occurred while fetching reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (review: FeedbackReview) => {
    setSelectedReview(review);
  };

  const closeDetailModal = () => {
    setSelectedReview(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="relative w-full max-w-7xl max-h-[90vh] bg-gray-950/98 border-4 theme-border-strong overflow-hidden" style={{ boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        {/* Pixel corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border z-20" />
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950/98 border-b-2 theme-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BsStars className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-bold theme-text uppercase tracking-wider">
                Feedback Reviews
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)] transition-all active:translate-y-0.5"
              style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            >
              <IoClose className="w-6 h-6 theme-text-muted" />
            </button>
          </div>
          {!isLoading && !error && (
            <p className="theme-text-muted text-sm mt-2 font-bold uppercase tracking-wider">
              Total Reviews: <span className="text-[var(--theme-primary)] font-semibold">{reviews.length}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-12 w-12 border-2 border-slate-600 border-t-[var(--theme-primary)] animate-spin" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 text-lg font-bold uppercase tracking-wider">{error}</p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="theme-text-muted text-lg font-bold uppercase tracking-wider">No feedback reviews yet</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => handleReviewClick(review)}
                  className="relative border-2 border-slate-600/60 bg-gray-950/98 p-4 hover:border-[var(--theme-primary)]/50 transition-all duration-300 cursor-pointer group"
                  style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.user_image}
                      alt={review.user_login}
                      className="w-12 h-12 border-2 border-slate-600/60 group-hover:border-[var(--theme-primary)] transition-colors object-cover"
                      style={{ imageRendering: "pixelated", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="theme-text font-bold truncate uppercase tracking-wider">
                        {review.user_login}
                      </p>
                      <p className="theme-text-muted text-xs truncate font-bold uppercase tracking-wider">
                        {review.campus_name}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "text-yellow-400" : "text-slate-600"
                        }`}
                      />
                    ))}
                    <span className="theme-text-muted text-sm ml-2 font-bold uppercase tracking-wider">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Preview Text */}
                  {review.feedback && (
                    <p className="theme-text-muted text-sm line-clamp-2 mb-3">
                      {review.feedback}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {review.wants_to_contribute && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 border-2 border-emerald-500/30 font-bold uppercase tracking-wider" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        Contributor
                      </span>
                    )}
                    {review.badge_awarded && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 border-2 border-yellow-500/30 font-bold uppercase tracking-wider flex items-center gap-1" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                        <BsStars className="w-3 h-3" />
                        Badge
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="theme-text-muted text-xs mt-3 font-bold uppercase tracking-wider">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closeDetailModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-gray-950/98 border-4 theme-border-strong overflow-hidden"
            style={{ boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pixel corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-20" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border z-20" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border z-20" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border z-20" />
            {/* Close Button */}
            <button
              onClick={closeDetailModal}
              className="absolute top-4 right-4 z-10 p-2 border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)] transition-all active:translate-y-0.5"
              style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            >
              <IoClose className="w-5 h-5 theme-text-muted" />
            </button>

            <div className="overflow-y-auto p-8 max-h-[90vh]">
              {/* User Header */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b-2 theme-border">
                <img
                  src={selectedReview.user_image}
                  alt={selectedReview.user_login}
                  className="w-20 h-20 border-2 theme-border object-cover"
                  style={{ imageRendering: "pixelated", boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold theme-text mb-2 uppercase tracking-wider">
                    {selectedReview.user_login}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm theme-text-muted font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      {selectedReview.user_email}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      {selectedReview.campus_name}
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= selectedReview.rating ? "text-yellow-400" : "text-slate-600"
                        }`}
                      />
                    ))}
                    <span className="theme-text ml-2 font-bold uppercase tracking-wider">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-4">
                {selectedReview.feedback && (
                  <div className="border-2 border-[var(--theme-primary)]/50 bg-[var(--theme-bg-card)] p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-[var(--theme-primary)] text-sm font-bold mb-2 uppercase tracking-wider">
                      Feature Ideas
                    </p>
                    <p className="theme-text text-sm whitespace-pre-wrap">
                      {selectedReview.feedback}
                    </p>
                  </div>
                )}

                {selectedReview.dislikes && (
                  <div className="border-2 border-red-500/50 bg-red-500/10 p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-red-400 text-sm font-bold mb-2 uppercase tracking-wider">
                      Dislikes
                    </p>
                    <p className="theme-text text-sm whitespace-pre-wrap">
                      {selectedReview.dislikes}
                    </p>
                  </div>
                )}

                {selectedReview.improvements && (
                  <div className="border-2 border-amber-500/50 bg-amber-500/10 p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-amber-400 text-sm font-bold mb-2 uppercase tracking-wider">
                      Improvements
                    </p>
                    <p className="theme-text text-sm whitespace-pre-wrap">
                      {selectedReview.improvements}
                    </p>
                  </div>
                )}

                {/* Contribution Section */}
                {selectedReview.wants_to_contribute && (
                  <div className="border-2 border-emerald-500/50 bg-emerald-500/10 p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                    <p className="text-emerald-400 text-sm font-bold mb-3 uppercase tracking-wider">
                      Wants to Contribute
                    </p>
                    {selectedReview.skills && (
                      <div className="mb-3">
                        <p className="theme-text-muted text-xs font-bold mb-1 uppercase tracking-wider">Skills:</p>
                        <p className="theme-text text-sm">
                          {selectedReview.skills}
                        </p>
                      </div>
                    )}
                    {selectedReview.contribution_area && selectedReview.contribution_area.length > 0 && (
                      <div>
                        <p className="theme-text-muted text-xs font-bold mb-2 uppercase tracking-wider">Areas:</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedReview.contribution_area.map((area) => (
                            <div
                              key={area}
                              className={`flex items-center gap-2 px-3 py-2 border-2 font-bold uppercase tracking-wider ${
                                area === "frontend"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : area === "backend"
                                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  : "bg-pink-500/20 text-pink-400 border-pink-500/30"
                              }`}
                              style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                            >
                              {area === "frontend" && <BsCodeSlash className="w-4 h-4" />}
                              {area === "backend" && <AiOutlineDatabase className="w-4 h-4" />}
                              {area === "design" && <MdDesignServices className="w-4 h-4" />}
                              <span className="text-sm capitalize">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t-2 theme-border flex items-center justify-between">
                <p className="theme-text-muted text-sm font-bold uppercase tracking-wider">
                  Submitted on{" "}
                  {new Date(selectedReview.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {selectedReview.badge_awarded && (
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 border-2 border-yellow-500/30 font-bold uppercase tracking-wider" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    <BsStars className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-bold">
                      Badge Awarded
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReviews;
