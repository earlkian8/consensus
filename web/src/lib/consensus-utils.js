const padTime = (value) => String(value).padStart(2, "0");

export const formatDuration = (ms) => {
    const remaining = Math.max(0, ms);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
};

export const formatTime = (date) =>
    date.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
    });

export const formatDate = (date) =>
    date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
