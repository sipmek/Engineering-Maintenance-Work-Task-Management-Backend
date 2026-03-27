export const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Clean the path from leading slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Use the backend base URL (hardcoded for now as per project convention)
  return `http://localhost:5000/${cleanPath}`;
};
