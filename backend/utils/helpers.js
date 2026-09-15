/**
 * MediCore HMS - Shared helper functions.
 * Ports the pure business-logic helpers from the original
 * includes/functions.php (everything that isn't HTML rendering).
 */

/** Parses pagination query params the same way PHP's paginate() did. */
function getPagination(query, perPage = 10) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = perPage;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPaginationMeta(totalRows, page, perPage = 10) {
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  return {
    totalRows,
    totalPages,
    currentPage: Math.min(page, totalPages),
    perPage,
  };
}

/**
 * Same rules as computeMedicineStatus() in the PHP app:
 * Expired (if past expiry) > Out of Stock (qty <= 0) > Low Stock (qty < 20) > Available
 */
function computeMedicineStatus(quantity, expiryDate) {
  if (expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    if (expiry < today) return 'Expired';
  }
  const qty = parseInt(quantity, 10) || 0;
  if (qty <= 0) return 'Out of Stock';
  if (qty < 20) return 'Low Stock';
  return 'Available';
}

module.exports = { getPagination, buildPaginationMeta, computeMedicineStatus };
