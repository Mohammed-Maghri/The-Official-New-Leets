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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-7xl max-h-[90vh] rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BsStars className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-bold font-Tektur text-white">
                Feedback Reviews
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 transition-all duration-300 group"
            >
              <IoClose className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
          {!isLoading && !error && (
            <p className="text-gray-400 text-sm font-Tektur mt-2">
              Total Reviews: <span className="text-blue-400 font-semibold">{reviews.length}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 text-lg font-Tektur">{error}</p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-400 text-lg font-Tektur">No feedback reviews yet</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => handleReviewClick(review)}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/60 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.user_image}
                      alt={review.user_login}
                      className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-Tektur font-semibold truncate">
                        {review.user_login}
                      </p>
                      <p className="text-gray-400 text-xs font-Tektur truncate">
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
                          star <= review.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-gray-400 text-sm font-Tektur ml-2">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Preview Text */}
                  {review.feedback && (
                    <p className="text-gray-300 text-sm font-Tektur line-clamp-2 mb-3">
                      {review.feedback}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {review.wants_to_contribute && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-Tektur">
                        Contributor
                      </span>
                    )}
                    {review.badge_awarded && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-Tektur flex items-center gap-1">
                        <BsStars className="w-3 h-3" />
                        Badge
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-gray-500 text-xs font-Tektur mt-3">
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
            className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeDetailModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 transition-all duration-300 group"
            >
              <IoClose className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <div className="overflow-y-auto p-8 max-h-[90vh]">
              {/* User Header */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-700/50">
                <img
                  src={selectedReview.user_image}
                  alt={selectedReview.user_login}
                  className="w-20 h-20 rounded-full border-2 border-blue-500"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-Tektur text-white mb-2">
                    {selectedReview.user_login}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400 font-Tektur">
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
                          star <= selectedReview.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-white font-Tektur ml-2">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-4">
                {selectedReview.feedback && (
                  <div className="bg-gray-800/30 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 text-sm font-Tektur font-semibold mb-2">
                      Feature Ideas
                    </p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">
                      {selectedReview.feedback}
                    </p>
                  </div>
                )}

                {selectedReview.dislikes && (
                  <div className="bg-gray-800/30 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-Tektur font-semibold mb-2">
                      Dislikes
                    </p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">
                      {selectedReview.dislikes}
                    </p>
                  </div>
                )}

                {selectedReview.improvements && (
                  <div className="bg-gray-800/30 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm font-Tektur font-semibold mb-2">
                      Improvements
                    </p>
                    <p className="text-gray-300 text-sm font-Tektur whitespace-pre-wrap">
                      {selectedReview.improvements}
                    </p>
                  </div>
                )}

                {/* Contribution Section */}
                {selectedReview.wants_to_contribute && (
                  <div className="bg-gray-800/30 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm font-Tektur font-semibold mb-3">
                      Wants to Contribute
                    </p>
                    {selectedReview.skills && (
                      <div className="mb-3">
                        <p className="text-gray-400 text-xs font-Tektur mb-1">Skills:</p>
                        <p className="text-gray-300 text-sm font-Tektur">
                          {selectedReview.skills}
                        </p>
                      </div>
                    )}
                    {selectedReview.contribution_area && selectedReview.contribution_area.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs font-Tektur mb-2">Areas:</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedReview.contribution_area.map((area) => (
                            <div
                              key={area}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                area === "frontend"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : area === "backend"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              }`}
                            >
                              {area === "frontend" && <BsCodeSlash className="w-4 h-4" />}
                              {area === "backend" && <AiOutlineDatabase className="w-4 h-4" />}
                              {area === "design" && <MdDesignServices className="w-4 h-4" />}
                              <span className="text-sm font-Tektur capitalize">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                <p className="text-gray-500 text-sm font-Tektur">
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
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <BsStars className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-Tektur font-semibold">
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
