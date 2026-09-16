"use client";
import React, { useState, useEffect } from "react";
import { IoStar, IoArrowBack, IoTrashOutline } from "react-icons/io5";
import { BsStars, BsCodeSlash, BsLightbulb, BsDiamond } from "react-icons/bs";
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
  const [customMessage, setCustomMessage] = useState<string>("");
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
    setCustomMessage("");
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
          customMessage: customMessage || undefined,
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
    <div className="flex flex-1 overflow-auto overflow-x-hidden flex-col z-20 p-4 sm:p-6 lg:p-10" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="relative w-full flex-1 border-4 border-[#a0a6b0] bg-[#ece9d8] flex flex-col p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-hidden" style={{ boxShadow: "none" }}>
        {/* Pixel corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#a0a6b0]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#a0a6b0]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#a0a6b0]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#a0a6b0]" />
        {/* Header */}
        <div className="flex-shrink-0">
          <button
            onClick={handleBackClick}
            className="mb-3 sm:mb-4 flex items-center gap-2 theme-text-muted hover:text-[var(--theme-text)] transition-colors text-sm sm:text-base font-bold uppercase tracking-wider"
          >
            <IoArrowBack className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BsStars className="w-6 h-6 sm:w-8 sm:h-8 text-[#3e3d35]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text uppercase tracking-wider">
              Feedback Reviews
            </h1>
          </div>

          {!isLoading && !error && (
            <p className="theme-text-muted text-xs sm:text-sm mt-2 font-bold uppercase tracking-wider">
              Total Reviews: <span className="text-[var(--theme-primary)] font-semibold">{reviews.length}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-spin h-12 w-12 border-2 border-[#a0a6b0] border-t-[var(--theme-primary)]" style={{ boxShadow: "none" }}></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center border-2 border-[#a0a6b0] bg-[#d9e5f5] p-6 sm:p-8" style={{ boxShadow: "none" }}>
              <p className="text-[#3e3d35] text-base sm:text-lg font-bold uppercase tracking-wider">{error}</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 px-4 sm:px-6 py-2 border-2 border-[#a0a6b0] bg-[#ece9d8] theme-text font-bold uppercase tracking-wider transition-all active:translate-y-0.5"
                style={{ boxShadow: "none" }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[400px]">
            <div className="text-center border-2 border-[#a0a6b0] bg-[#ece9d8] p-6 sm:p-8" style={{ boxShadow: "none" }}>
              <p className="theme-text-muted text-base sm:text-lg font-bold uppercase tracking-wider">No feedback reviews yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => handleReviewClick(review)}
                className="relative border-2 border-[#a0a6b0] bg-[#ece9d8] p-4 hover:border-[var(--theme-primary)]/50 transition-all duration-300 cursor-pointer group"
                style={{ boxShadow: "none" }}
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.user_image}
                    alt={review.user_login}
                    className="w-12 h-12 border-2 border-[#a0a6b0] group-hover:border-[var(--theme-primary)] transition-colors object-cover flex-shrink-0"
                    style={{ imageRendering: "pixelated", boxShadow: "none" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="theme-text font-bold truncate text-sm sm:text-base uppercase tracking-wider">
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
                        star <= review.rating ? "text-[#3e3d35]" : "text-[#3e3d35]"
                      }`}
                    />
                  ))}
                  <span className="theme-text-muted text-xs sm:text-sm ml-2 font-bold uppercase tracking-wider">
                    {review.rating}/5
                  </span>
                </div>

                {/* Preview Text */}
                {review.feedback && (
                  <p className="theme-text-muted text-xs sm:text-sm line-clamp-2 mb-3">
                    {review.feedback}
                  </p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {review.wants_to_contribute && (
                    <span className="text-[10px] bg-[#d9e5f5] text-[#3e3d35] px-2 py-1 border-2 border-[#a0a6b0] font-bold uppercase tracking-wider" style={{ boxShadow: "none" }}>
                      Contributor
                    </span>
                  )}
                  {review.badge_awarded && review.badge_type && (() => {
                    const getBadgeConfig = (badgeType: string) => {
                      switch(badgeType) {
                        case BADGE_TYPES.GENIUS:
                          return {
                            icon: BsLightbulb,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                        case BADGE_TYPES.HELPFUL:
                          return {
                            icon: FaHandsHelping,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                        case BADGE_TYPES.INNOVATIVE:
                          return {
                            icon: BsLightbulb,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                        case BADGE_TYPES.CRITICAL_THINKER:
                          return {
                            icon: FaBrain,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                        case BADGE_TYPES.CONTRIBUTOR:
                          return {
                            icon: BsStars,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                        default:
                          return {
                            icon: BsStars,
                            bg: " ",
                            border: "border-[#a0a6b0]",
                            shadow: "-400/40",
                            text: "text-[#3e3d35]"
                          };
                      }
                    };

                    const config = getBadgeConfig(review.badge_type);
                    const Icon = config.icon;

                    return (
                      <div className={`px-2 py-1 border-2 flex flex-row items-center gap-1 bg-[#f5f3e9] ${config.bg} ${config.border} ${config.shadow}`} style={{ boxShadow: "none" }}>
                        <Icon className={`${config.text} text-[10px]`} />
                        <span className={`${config.text} text-[7px] font-bold tracking-widest uppercase`}>
                          {review.badge_type.toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Date */}
                <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90  p-2 sm:p-4"
          onClick={closeDetailModal}
        >
          <div
            className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-[#ece9d8] border-4 theme-border-strong overflow-hidden"
            style={{ boxShadow: "none" }}
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
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)] transition-all duration-300 group active:translate-y-0.5"
              style={{ boxShadow: "none" }}
            >
              <IoArrowBack className="w-4 h-4 sm:w-5 sm:h-5 theme-text-muted group-hover:text-[var(--theme-text)] transition-colors rotate-180" />
            </button>

            <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 max-h-[90vh]" style={{ fontFamily: "var(--font-ui)" }}>
              {/* User Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 theme-border">
                <img
                  src={selectedReview.user_image}
                  alt={selectedReview.user_login}
                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 theme-border object-cover flex-shrink-0"
                  style={{ imageRendering: "pixelated", boxShadow: "none" }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text mb-2 uppercase tracking-wider">
                    {selectedReview.user_login}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm theme-text-muted font-bold uppercase tracking-wider">
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
                          star <= selectedReview.rating ? "text-[#3e3d35]" : "text-[#3e3d35]"
                        }`}
                      />
                    ))}
                    <span className="theme-text ml-2 text-sm sm:text-base font-bold uppercase tracking-wider">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-3 sm:space-y-4">
                {selectedReview.feedback && (
                  <div className="border-2 border-[var(--theme-primary)]/50 bg-[var(--theme-bg-card)] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                    <p className="text-[var(--theme-primary)] text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
                      Feature Ideas
                    </p>
                    <p className="theme-text text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {selectedReview.feedback}
                    </p>
                  </div>
                )}

                {selectedReview.dislikes && (
                  <div className="border-2 border-[#a0a6b0] bg-[#d9e5f5] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                    <p className="text-[#3e3d35] text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
                      Dislikes
                    </p>
                    <p className="theme-text text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {selectedReview.dislikes}
                    </p>
                  </div>
                )}

                {selectedReview.improvements && (
                  <div className="border-2 border-[#a0a6b0] bg-[#d9e5f5] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                    <p className="text-[#3e3d35] text-xs sm:text-sm font-bold mb-2 uppercase tracking-wider">
                      Improvements
                    </p>
                    <p className="theme-text text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {selectedReview.improvements}
                    </p>
                  </div>
                )}

                {/* Contribution Section */}
                {selectedReview.wants_to_contribute && (
                  <div className="border-2 border-[#a0a6b0] bg-[#d9e5f5] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                    <p className="text-[#3e3d35] text-xs sm:text-sm font-bold mb-3 uppercase tracking-wider">
                      Wants to Contribute
                    </p>
                    {selectedReview.skills && (
                      <div className="mb-3">
                        <p className="theme-text-muted text-xs font-bold mb-1 uppercase tracking-wider">Skills:</p>
                  <p className="theme-text text-xs sm:text-sm break-words">
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
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
                                area === "frontend"
                                  ? "bg-[#d9e5f5] text-[#3e3d35] border-[#a0a6b0]"
                                  : area === "backend"
                                  ? "bg-[#d9e5f5] text-[#3e3d35] border-[#a0a6b0]"
                                  : "bg-[#d9e5f5] text-[#3e3d35] border-[#a0a6b0]"
                              }`}
                              style={{ boxShadow: "none" }}
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
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 theme-border">
                <p className="theme-text-muted text-xs sm:text-sm font-bold break-words mb-3 uppercase tracking-wider">
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
                        <div className="flex items-center gap-2 bg-[#d9e5f5] px-3 py-1.5 border-2 border-[#a0a6b0] font-bold uppercase tracking-wider" style={{ boxShadow: "none" }}>
                          <BsStars className="w-4 h-4 text-[#3e3d35]" />
                          <span className="text-[#3e3d35] text-xs sm:text-sm font-bold">
                            {selectedReview.badge_type || "Badge Awarded"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveBadge(selectedReview.id)}
                          className="px-3 py-1.5 border-2 border-[#a0a6b0] bg-[#d9e5f5] hover:bg-[#d9e5f5] text-[#3e3d35] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:translate-y-0.5"
                          style={{ boxShadow: "none" }}
                        >
                          Remove Badge
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openBadgeModal(selectedReview.id)}
                        className="px-4 py-2 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 active:translate-y-0.5"
                        style={{
                          color: "var(--theme-text)",
                          background: "var(--theme-bg-card)",
                          boxShadow: "none",
                        }}
                      >
                        <BsStars className="w-4 h-4" />
                        Give Badge
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFeedback(selectedReview.id)}
                    className="w-full sm:w-auto px-4 py-2 border-2 border-[#a0a6b0] bg-[#d9e5f5] hover:bg-[#d9e5f5] text-[#3e3d35] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
                    style={{ boxShadow: "none" }}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90  p-4"
          onClick={closeBadgeModal}
        >
          <div
            className="relative w-full max-w-md bg-[#ece9d8] border-4 theme-border-strong p-6"
            style={{ boxShadow: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pixel corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />
            {/* Header */}
            <div className="flex items-center justify-between mb-6" style={{ fontFamily: "var(--font-ui)" }}>
              <div className="flex items-center gap-2">
                <BsStars className="w-6 h-6 text-[#3e3d35]" />
                <h3 className="text-xl font-bold theme-text uppercase tracking-wider">
                  Select Badge Type
                </h3>
              </div>
              <button
                onClick={closeBadgeModal}
                className="p-2 border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-primary)] transition-all active:translate-y-0.5"
                style={{ boxShadow: "none" }}
              >
                <IoArrowBack className="w-5 h-5 theme-text-muted rotate-180" />
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
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    case BADGE_TYPES.HELPFUL:
                      return {
                        icon: FaHandsHelping,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    case BADGE_TYPES.INNOVATIVE:
                      return {
                        icon: BsLightbulb,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    case BADGE_TYPES.CRITICAL_THINKER:
                      return {
                        icon: FaBrain,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    case BADGE_TYPES.CONTRIBUTOR:
                      return {
                        icon: BsStars,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    case BADGE_TYPES.VIP:
                      return {
                        icon: BsDiamond,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                    default:
                      return {
                        icon: BsStars,
                        bg: " ",
                        border: "border-[#a0a6b0]",
                        shadow: "-400/40",
                        text: "text-[#3e3d35]",
                        selectionBorder: "border-[#a0a6b0]"
                      };
                  }
                };

                const config = getBadgeConfig(value);
                const Icon = config.icon;

                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between gap-3 p-4 border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `bg-[var(--theme-bg-card)] ${config.selectionBorder}`
                        : "border-[#a0a6b0] bg-[#ece9d8] hover:border-[#a0a6b0]"
                    }`}
                    style={{ boxShadow: "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="badgeType"
                        value={value}
                        checked={isSelected}
                        onChange={(e) => setSelectedBadgeType(e.target.value)}
                        className="w-4 h-4 text-[var(--theme-primary)] bg-[var(--theme-bg-card)] border-[#a0a6b0] focus:ring-[var(--theme-primary)]"
                      />
                      <span className="theme-text text-sm font-bold uppercase tracking-wider">{value}</span>
                    </div>

                    {/* Badge Pill Preview - Exact as it will appear */}
                    <div className={`px-3 py-1.5 border-2 flex flex-row items-center gap-1 bg-[#f5f3e9] ${config.bg} ${config.border} ${config.shadow}`} style={{ boxShadow: "none" }}>
                      <Icon className={`${config.text} text-[12px]`} />
                      <span className={`${config.text} text-[8px] font-bold tracking-widest uppercase`}>
                        {value.toUpperCase()}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Custom Message Section */}
            <div className="mb-6">
              <label className="block text-sm theme-text-muted font-bold mb-2 uppercase tracking-wider">
                Message for Recipient (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.slice(0, 500))}
                placeholder="Write a custom message to accompany the badge..."
                maxLength={500}
                className="w-full px-4 py-3 bg-[var(--theme-bg-card)] border-2 theme-border text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-primary)] text-sm resize-none"
                style={{ boxShadow: "none" }}
                rows={4}
              />
              <p className="text-xs theme-text-muted mt-1 font-bold uppercase tracking-wider">
                {customMessage.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeBadgeModal}
                disabled={isAwarding}
                className="flex-1 px-4 py-2.5 border-2 theme-border bg-[var(--theme-bg-card)] theme-text font-bold uppercase tracking-wider transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "none" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAwardBadge}
                disabled={!selectedBadgeType || isAwarding}
                className="flex-1 px-4 py-2.5 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: "var(--theme-text)",
                  background: "var(--theme-bg-card)",
                  boxShadow: "none",
                }}
              >
                {isAwarding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#a0a6b0]"></div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90  p-4"
          onClick={cancelDeleteFeedback}
        >
          <div
            className="relative w-full max-w-md bg-[#ece9d8] border-4 border-[#a0a6b0] p-6"
            style={{ boxShadow: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pixel corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#a0a6b0]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#a0a6b0]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#a0a6b0]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#a0a6b0]" />
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 border-2 border-[#a0a6b0] bg-[#d9e5f5]" style={{ boxShadow: "none" }}>
                <IoTrashOutline className="w-8 h-8 text-[#3e3d35]" />
              </div>
            </div>

            <h3 className="text-xl font-bold theme-text text-center mb-3 uppercase tracking-wider" style={{ fontFamily: "var(--font-ui)" }}>
              Delete Feedback?
            </h3>

            <p className="theme-text-muted text-sm text-center mb-2 font-bold uppercase tracking-wider">
              Are you sure you want to delete this feedback?
            </p>

            <p className="theme-text-muted text-xs text-center mb-6 font-bold uppercase tracking-wider">
              This will soft-delete the feedback. It can be recovered from the database if needed.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteFeedback}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 theme-border bg-[var(--theme-bg-card)] theme-text font-bold uppercase tracking-wider transition-all active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "none" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFeedback}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 border-[#a0a6b0] bg-[#d9e5f5] text-[#3e3d35] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "none" }}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#a0a6b0]"></div>
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
