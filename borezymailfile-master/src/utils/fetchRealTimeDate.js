// src/utils/fetchRealTimeDate.js
export const fetchRealTimeDate = async () => {
    try {
      const response = await fetch('http://worldclockapi.com/api/json/utc/now');
      if (!response.ok) {
        throw new Error('Failed to fetch time data');
      }
      const data = await response.json();
      return new Date(data.currentDateTime); // Use the currentDateTime field
    } catch (error) {
      console.error('Error fetching real-time date:', error);
      return new Date(); // Fallback to the local date and time if the API fails
    }
  };
  