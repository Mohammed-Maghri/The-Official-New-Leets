let users: string[] = [];

const fetchVIPUsers = async () => {
  if (typeof window === 'undefined') {
    return;
  }
  
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

if (typeof window !== 'undefined') {
  fetchVIPUsers();
}

export { users, fetchVIPUsers };
