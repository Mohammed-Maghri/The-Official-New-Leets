let users: string[] = [];

// Fetch VIP users from the backend
const fetchVIPUsers = async () => {
  try {
    const response = await fetch("/api/vip-users");
    if (response.ok) {
      const data = await response.json();
      users = data.vipUsers || [];
    } else {
      console.error("Failed to fetch VIP users");
    }
  } catch (error) {
    console.error("Error fetching VIP users:", error);
  }
};

// Initialize on module load
fetchVIPUsers();

export { users, fetchVIPUsers };
