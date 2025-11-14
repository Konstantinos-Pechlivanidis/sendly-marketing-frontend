/**
 * Normalizes paginated API responses to a consistent format
 * Handles different response formats from backend
 * 
 * @param {Object} response - API response object
 * @param {string} itemKey - Key to look for items (e.g., 'campaigns', 'contacts')
 * @returns {Object} Normalized response with items and pagination
 */
export function normalizePaginatedResponse(response, itemKey = 'items') {
  // Handle different response formats
  const items = response[itemKey] || response.items || response.campaigns || response.contacts || response.automations || response.templates || [];
  const pagination = response.pagination || {};
  
  return {
    items,
    pagination,
  };
}

/**
 * Normalizes array responses that might be wrapped in objects
 * Handles cases where backend returns { items: [...] } or { campaigns: [...] } or just [...]
 * 
 * @param {*} data - Response data (could be array or object)
 * @param {string} itemKey - Key to look for items if data is object
 * @returns {Array} Normalized array
 */
export function normalizeArrayResponse(data, itemKey = 'items') {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    return data[itemKey] || data.items || data.campaigns || data.contacts || data.automations || data.templates || [];
  }
  
  return [];
}

