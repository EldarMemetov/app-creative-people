export const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.error || "Server error";

    if (status === 400) {
      return new Error(message || "Invalid request");
    }
    if (status === 404) {
      return new Error("Requested resource not found");
    }
    if (status === 500) {
      return new Error("Internal server error. Try again later.");
    }
  }
  return new Error("Network error. Please check your connection.");
};
