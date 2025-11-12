"use client";
import React, { useState, useEffect } from "react";
import { IoStar, IoArrowBack, IoTrashOutline } from "react-icons/io5";
import { BsStars, BsCodeSlash, BsLightbulb } from "react-icons/bs";
import { AiOutlineDatabase } from "react-icons/ai";
import { MdDesignServices } from "react-icons/md";
import { FiMail, FiMapPin } from "react-icons/fi";
import { FaHandsHelping, FaBrain } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FeedbackReview, BADGE_TYPES } from "./feedback-reviews.types";

const FeedbackReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<FeedbackReview | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [selectedBadgeType, setSelectedBadgeType] = useState<string>("");
  const [badgeReviewId, setBadgeReviewId] = useState<number | null>(null);
  const [isAwarding, setIsAwarding] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchReviews();
  }, []);

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
        } else if (response.status === 401) {
          setError("Please log in to view this page");
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

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  const openBadgeModal = (reviewId: number) => {
    setBadgeReviewId(reviewId);
    setShowBadgeModal(true);
    setSelectedBadgeType("");
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setBadgeReviewId(null);
    setSelectedBadgeType("");
  };

  const handleAwardBadge = async () => {
    if (!badgeReviewId || !selectedBadgeType) {
      alert("Please select a badge type");
      return;
    }

    setIsAwarding(true);

    try {
      const response = await fetch("/api/feedback/badge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          feedbackId: badgeReviewId,
          badgeType: selectedBadgeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to award badge");
        return;
      }

      await response.json();
      
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === badgeReviewId
            ? { ...review, badge_awarded: true, badge_type: selectedBadgeType }
            : review
        )
      );

      if (selectedReview && selectedReview.id === badgeReviewId) {
        setSelectedReview({
          ...selectedReview,
          badge_awarded: true,
          badge_type: selectedBadgeType,
        });
      }

      alert(`Badge "${selectedBadgeType}" awarded successfully!`);
      closeBadgeModal();

    } catch (error) {
      console.error("Error awarding badge:", error);
      alert("An error occurred while awarding the badge");
    } finally {
      setIsAwarding(false);
    }
  };

  const handleRemoveBadge = async (reviewId: number) => {
    if (!confirm("Are you sure you want to remove this badge?")) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback/badge?feedbackId=${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to remove badge");
        return;
      }

      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? { ...review, badge_awarded: false, badge_type: null }
            : review
        )
      );

      if (selectedReview && selectedReview.id === reviewId) {
        setSelectedReview({
          ...selectedReview,
          badge_awarded: false,
          badge_type: null,
        });
      }

      alert("Badge removed successfully!");

    } catch (error) {
      console.error("Error removing badge:", error);
      alert("An error occurred while removing the badge");
    }
  };

  const handleDeleteFeedback = async (reviewId: number) => {
    setDeleteReviewId(reviewId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFeedback = async () => {
    if (!deleteReviewId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/feedback?feedbackId=${deleteReviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete feedback");
        setIsDeleting(false);
        return;
      }

      setReviews(prevReviews =>
        prevReviews.filter(review => review.id !== deleteReviewId)
      );

      if (selectedReview && selectedReview.id === deleteReviewId) {
        setSelectedReview(null);
      }

      setShowDeleteConfirm(false);
      setDeleteReviewId(null);
      setIsDeleting(false);

    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("An error occurred while deleting the feedback");
      setIsDeleting(false);
    }
  };

  const cancelDeleteFeedback = () => {
    setShowDeleteConfirm(false);
    setDeleteReviewId(null);
  };

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col bg-gradient-to-br z-20 from-gray-900/50 via-[#0070ef]/20 to-rose-500/30 relative p-4 sm:p-6 lg:p-10">
      <div className="w-full flex-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-col p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <button
            onClick={handleBackClick}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-Tektur text-sm sm:text-base"
          >
            <IoArrowBack className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BsStars className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-Tektur text-white">
              Feedback Reviews
            </h1>
          </div>
          
          {!isLoading && !error && (
            <p className="text-gray-400 text-xs sm:text-sm font-Tektur mt-2">
              Total Reviews: <span className="text-blue-400 font-semibold">{reviews.length}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-6 sm:p-8">
              <p className="text-red-400 text-base sm:text-lg font-Tektur">{error}</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-Tektur transition-colors text-sm sm:text-base"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[400px]">
            <div className="text-center bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 sm:p-8">
              <p className="text-gray-400 text-base sm:text-lg font-Tektur">No feedback reviews yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-blue-500 transition-colors object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-Tektur font-semibold truncate text-sm sm:text-base">
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
                  <span className="text-gray-400 text-xs sm:text-sm font-Tektur ml-2">
                    {review.rating}/5
                  </span>
                </div>

                {/* Preview Text */}
                {review.feedback && (
                  <p className="text-gray-300 text-xs sm:text-sm font-Tektur line-clamp-2 mb-3">
                    {review.feedback}
                  </p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {review.wants_to_contribute && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-Tektur border border-emerald-500/30">
                      Contributor
                    </span>
                  )}
                  {review.badge_awarded && review.badge_type && (() => {
                    const getBadgeConfig = (badgeType: string) => {
                      switch(badgeType) {
                        case BADGE_TYPES.GENIUS:
                          return {
                            icon: BsLightbulb,
                            bg: "from-purple-500/50 to-pink-500/50",
                            border: "border-purple-300/60",
                            shadow: "shadow-purple-400/40",
                            text: "text-purple-100"
                          };
                        case BADGE_TYPES.HELPFUL:
                          return {
                            icon: FaHandsHelping,
                            bg: "from-blue-500/50 to-cyan-500/50",
                            border: "border-blue-300/60",
                            shadow: "shadow-blue-400/40",
                            text: "text-blue-100"
                          };
                        case BADGE_TYPES.INNOVATIVE:
                          return {
                            icon: BsLightbulb,
                            bg: "from-green-500/50 to-emerald-500/50",
                            border: "border-green-300/60",
                            shadow: "shadow-green-400/40",
                            text: "text-green-100"
                          };
                        case BADGE_TYPES.CRITICAL_THINKER:
                          return {
                            icon: FaBrain,
                            bg: "from-indigo-500/50 to-violet-500/50",
                            border: "border-indigo-300/60",
                            shadow: "shadow-indigo-400/40",
                            text: "text-indigo-100"
                          };
                        case BADGE_TYPES.CONTRIBUTOR:
                          return {
                            icon: BsStars,
                            bg: "from-rose-500/50 to-red-500/50",
                            border: "border-rose-300/60",
                            shadow: "shadow-rose-400/40",
                            text: "text-rose-100"
                          };
                        default:
                          return {
                            icon: BsStars,
                            bg: "from-gray-500/50 to-gray-600/50",
                            border: "border-gray-300/60",
                            shadow: "shadow-gray-400/40",
                            text: "text-gray-100"
                          };
                      }
                    };
                    
                    const config = getBadgeConfig(review.badge_type);
                    const Icon = config.icon;
                    
                    return (
                      <div className={`px-2 py-1 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r ${config.bg} ${config.border} ${config.shadow}`}>
                        <Icon className={`${config.text} text-[10px]`} />
                        <span className={`${config.text} font-Tektur text-[7px] font-bold tracking-widest`}>
                          {review.badge_type.toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Date */}
                <p className="text-gray-500 text-xs font-Tektur">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
          onClick={closeDetailModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeDetailModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 transition-all duration-300 group"
            >
              <IoArrowBack className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors rotate-180" />
            </button>

            <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 max-h-[90vh]">
              {/* User Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-700/50">
                <img
                  src={selectedReview.user_image}
                  alt={selectedReview.user_login}
                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 border-blue-500 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold font-Tektur text-white mb-2">
                    {selectedReview.user_login}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 font-Tektur">
                    <div className="flex items-center gap-1">
                      <FiMail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{selectedReview.user_email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{selectedReview.campus_name}</span>
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2 sm:mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IoStar
                        key={star}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= selectedReview.rating ? "text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-white font-Tektur ml-2 text-sm sm:text-base">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-3 sm:space-y-4">
                {selectedReview.feedback && (
                  <div className="bg-gray-800/30 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-blue-400 text-xs sm:text-sm font-Tektur font-semibold mb-2">
                      Feature Ideas
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm font-Tektur whitespace-pre-wrap break-words">
                      {selectedReview.feedback}
                    </p>
                  </div>
                )}

                {selectedReview.dislikes && (
                  <div className="bg-gray-800/30 border border-red-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-red-400 text-xs sm:text-sm font-Tektur font-semibold mb-2">
                      Dislikes
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm font-Tektur whitespace-pre-wrap break-words">
                      {selectedReview.dislikes}
                    </p>
                  </div>
                )}

                {selectedReview.improvements && (
                  <div className="bg-gray-800/30 border border-yellow-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-yellow-400 text-xs sm:text-sm font-Tektur font-semibold mb-2">
                      Improvements
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm font-Tektur whitespace-pre-wrap break-words">
                      {selectedReview.improvements}
                    </p>
                  </div>
                )}

                {/* Contribution Section */}
                {selectedReview.wants_to_contribute && (
                  <div className="bg-gray-800/30 border border-emerald-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-emerald-400 text-xs sm:text-sm font-Tektur font-semibold mb-3">
                      Wants to Contribute
                    </p>
                    {selectedReview.skills && (
                      <div className="mb-3">
                        <p className="text-gray-400 text-xs font-Tektur mb-1">Skills:</p>
                        <p className="text-gray-300 text-xs sm:text-sm font-Tektur break-words">
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
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm ${
                                area === "frontend"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : area === "backend"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              }`}
                            >
                              {area === "frontend" && <BsCodeSlash className="w-3 h-3 sm:w-4 sm:h-4" />}
                              {area === "backend" && <AiOutlineDatabase className="w-3 h-3 sm:w-4 sm:h-4" />}
                              {area === "design" && <MdDesignServices className="w-3 h-3 sm:w-4 sm:h-4" />}
                              <span className="font-Tektur capitalize">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/50">
                <p className="text-gray-500 text-xs sm:text-sm font-Tektur break-words mb-3">
                  Submitted on{" "}
                  {new Date(selectedReview.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                
                <div className="flex flex-col gap-3">
                  {/* Badge Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {selectedReview.badge_awarded ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
                          <BsStars className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-xs sm:text-sm font-Tektur font-semibold">
                            {selectedReview.badge_type || "Badge Awarded"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveBadge(selectedReview.id)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs sm:text-sm font-Tektur transition-colors border border-red-500/30"
                        >
                          Remove Badge
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openBadgeModal(selectedReview.id)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-xs sm:text-sm font-Tektur font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <BsStars className="w-4 h-4" />
                        Give Badge
                      </button>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFeedback(selectedReview.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs sm:text-sm font-Tektur font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500/50"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                    Delete Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Selection Modal */}
      {showBadgeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closeBadgeModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BsStars className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold font-Tektur text-white">
                  Select Badge Type
                </h3>
              </div>
              <button
                onClick={closeBadgeModal}
                className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <IoArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {Object.entries(BADGE_TYPES).map(([key, value]) => {
                const isSelected = selectedBadgeType === value;
                
                const getBadgeConfig = (badgeValue: string) => {
                  switch(badgeValue) {
                    case BADGE_TYPES.GENIUS:
                      return {
                        icon: BsLightbulb,
                        bg: "from-purple-500/50 to-pink-500/50",
                        border: "border-purple-300/60",
                        shadow: "shadow-purple-400/40",
                        text: "text-purple-100",
                        selectionBorder: "border-purple-500/50"
                      };
                    case BADGE_TYPES.HELPFUL:
                      return {
                        icon: FaHandsHelping,
                        bg: "from-blue-500/50 to-cyan-500/50",
                        border: "border-blue-300/60",
                        shadow: "shadow-blue-400/40",
                        text: "text-blue-100",
                        selectionBorder: "border-blue-500/50"
                      };
                    case BADGE_TYPES.INNOVATIVE:
                      return {
                        icon: BsLightbulb,
                        bg: "from-green-500/50 to-emerald-500/50",
                        border: "border-green-300/60",
                        shadow: "shadow-green-400/40",
                        text: "text-green-100",
                        selectionBorder: "border-green-500/50"
                      };
                    case BADGE_TYPES.CRITICAL_THINKER:
                      return {
                        icon: FaBrain,
                        bg: "from-indigo-500/50 to-violet-500/50",
                        border: "border-indigo-300/60",
                        shadow: "shadow-indigo-400/40",
                        text: "text-indigo-100",
                        selectionBorder: "border-indigo-500/50"
                      };
                    case BADGE_TYPES.CONTRIBUTOR:
                      return {
                        icon: BsStars,
                        bg: "from-rose-500/50 to-red-500/50",
                        border: "border-rose-300/60",
                        shadow: "shadow-rose-400/40",
                        text: "text-rose-100",
                        selectionBorder: "border-rose-500/50"
                      };
                    default:
                      return {
                        icon: BsStars,
                        bg: "from-gray-500/50 to-gray-600/50",
                        border: "border-gray-300/60",
                        shadow: "shadow-gray-400/40",
                        text: "text-gray-100",
                        selectionBorder: "border-gray-500/50"
                      };
                  }
                };
                
                const config = getBadgeConfig(value);
                const Icon = config.icon;
                
                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between gap-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `bg-gray-700/50 border-2 ${config.selectionBorder}`
                        : "bg-gray-800/30 border-2 border-gray-700/30 hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="badgeType"
                        value={value}
                        checked={isSelected}
                        onChange={(e) => setSelectedBadgeType(e.target.value)}
                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                      />
                      <span className="text-white font-Tektur text-sm font-medium">{value}</span>
                    </div>
                    
                    {/* Badge Pill Preview - Exact as it will appear */}
                    <div className={`px-3 py-1.5 border-2 rounded-full shadow-xl flex flex-row items-center gap-1 bg-gradient-to-r ${config.bg} ${config.border} ${config.shadow}`}>
                      <Icon className={`${config.text} text-[12px]`} />
                      <span className={`${config.text} font-Tektur text-[8px] font-bold tracking-widest`}>
                        {value.toUpperCase()}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeBadgeModal}
                disabled={isAwarding}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-Tektur transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardBadge}
                disabled={!selectedBadgeType || isAwarding}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-Tektur font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAwarding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Awarding...
                  </>
                ) : (
                  <>
                    <BsStars className="w-4 h-4" />
                    Award Badge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={cancelDeleteFeedback}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-red-500/30 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/20 border-2 border-red-500/50">
                <IoTrashOutline className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold font-Tektur text-white text-center mb-3">
              Delete Feedback?
            </h3>
            
            <p className="text-gray-300 text-sm font-Tektur text-center mb-2">
              Are you sure you want to delete this feedback?
            </p>
            
            <p className="text-gray-400 text-xs font-Tektur text-center mb-6">
              This will soft-delete the feedback. It can be recovered from the database if needed.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteFeedback}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-Tektur transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFeedback}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-Tektur font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <IoTrashOutline className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReviewsPage;
