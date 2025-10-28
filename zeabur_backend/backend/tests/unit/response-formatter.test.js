/**
 * Response Formatter Tests
 */

const {
  formatSuccess,
  formatError,
  formatPaginated,
  sendSuccess,
  sendError,
  sendPaginated,
} = require('../../src/utils/response-formatter');

describe('Response Formatter', () => {
  describe('formatSuccess', () => {
    test('should format success response with data', () => {
      const data = { message: 'Test data' };
      const result = formatSuccess(data);

      expect(result).toEqual({
        success: true,
        data: { message: 'Test data' },
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    test('should include additional metadata', () => {
      const data = { items: [] };
      const meta = { query_id: 'q_123', response_time_ms: 45 };
      const result = formatSuccess(data, meta);

      expect(result).toEqual({
        success: true,
        data: { items: [] },
        meta: {
          timestamp: expect.any(String),
          query_id: 'q_123',
          response_time_ms: 45,
        },
      });
    });

    test('should handle null data', () => {
      const result = formatSuccess(null);

      expect(result).toEqual({
        success: true,
        data: null,
        meta: {
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('formatError', () => {
    test('should format error response', () => {
      const result = formatError('VALIDATION_ERROR', 'Validation failed');

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
        },
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    test('should include error details if provided', () => {
      const details = { field: 'query_text', reason: 'Too short' };
      const result = formatError('VALIDATION_ERROR', 'Validation failed', details);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            field: 'query_text',
            reason: 'Too short',
          },
        },
        meta: {
          timestamp: expect.any(String),
        },
      });
    });

    test('should not include details if not provided', () => {
      const result = formatError('INTERNAL_ERROR', 'Internal server error');

      expect(result.error).not.toHaveProperty('details');
    });
  });

  describe('formatPaginated', () => {
    test('should format paginated response', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const pagination = { page: 1, limit: 10, total: 25 };
      const result = formatPaginated(items, pagination);

      expect(result).toEqual({
        success: true,
        data: items,
        meta: {
          timestamp: expect.any(String),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        },
      });
    });

    test('should calculate totalPages correctly', () => {
      const items = [{ id: 1 }];
      const pagination = { page: 1, limit: 5, total: 23 };
      const result = formatPaginated(items, pagination);

      expect(result.meta.pagination.totalPages).toBe(5);
    });

    test('should use defaults for missing pagination values', () => {
      const items = [{ id: 1 }];
      const pagination = {};
      const result = formatPaginated(items, pagination);

      expect(result.meta.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('sendSuccess', () => {
    test('should call res.status and res.json correctly', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const data = { message: 'Success' };
      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
        })
      );
    });

    test('should use custom status code', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      sendSuccess(res, { created: true }, 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    test('should call res.status and res.json correctly', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      sendError(res, 'NOT_FOUND', 'Resource not found', 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
        })
      );
    });

    test('should default to status 500', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      sendError(res, 'INTERNAL_ERROR', 'Internal error');

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('sendPaginated', () => {
    test('should send paginated response', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const items = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 50 };

      sendPaginated(res, items, pagination);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: items,
          meta: expect.objectContaining({
            pagination: expect.any(Object),
          }),
        })
      );
    });
  });
});
