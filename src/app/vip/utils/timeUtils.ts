export const formatSubmissionDateTime = (closedAt: string | null) => {
  if (!closedAt) return "Not Submitted";
  
  const date = new Date(closedAt);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  const time = date.toLocaleTimeString('en-US', timeOptions);
  const dateStr = date.toLocaleDateString('en-US', dateOptions);
  
  return `${time} • ${dateStr}`;
};

export const formatTimeOnly = (closedAt: string | null) => {
  if (!closedAt) return "Not Submitted";
  
  const date = new Date(closedAt);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  return date.toLocaleTimeString('en-US', timeOptions);
};

export const formatDateOnly = (closedAt: string | null) => {
  if (!closedAt) return "No Date";
  
  const date = new Date(closedAt);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', dateOptions);
};

export const formatRelativeTime = (closedAt: string | null) => {
  if (!closedAt) return "No submission";
  
  const date = new Date(closedAt);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDateOnly(closedAt);
  }
};

export const isSubmittedToday = (closedAt: string | null): boolean => {
  if (!closedAt) return false;
  
  const date = new Date(closedAt);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const getSubmissionTimeStatus = (closedAt: string | null) => {
  if (!closedAt) return { status: 'not_submitted', color: 'gray' };
  
  const submissionHour = new Date(closedAt).getHours();
  
  if (submissionHour >= 6 && submissionHour < 12) {
    return { status: 'morning', color: 'blue', emoji: '🌅' };
  } else if (submissionHour >= 12 && submissionHour < 18) {
    return { status: 'afternoon', color: 'yellow', emoji: '☀️' };
  } else if (submissionHour >= 18 && submissionHour < 22) {
    return { status: 'evening', color: 'orange', emoji: '🌆' };
  } else {
    return { status: 'night', color: 'purple', emoji: '🌙' };
  }
};
