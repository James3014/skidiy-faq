/**
 * Error Handler Middleware Tests
 */

const { AppError, ErrorCodes, errorHandler } = require('../../src/middleware/error-handler');
const { formatError } = require('../../src/utils/response-formatter');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/api/v1/test',
      method: 'GET',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle AppError correctly', () => {
    const error = new AppError(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      { field: 'query_text' }
    );

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: { field: 'query_text' },
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      })
    );
  });

  test('should handle generic errors with default status 500', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCodes.INTERNAL_ERROR,
        }),
      })
    );
  });

  test('should handle ValidationError from external libraries', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = { field: 'Invalid value' };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
        }),
      })
    );
  });

  test('should handle JSON parsing errors', () => {
    const error = new SyntaxError('Unexpected token in JSON');
    error.status = 400;
    error.body = true;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Invalid JSON in request body',
        }),
      })
    );
  });

  test('should not expose internal error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Internal database error');

    errorHandler(error, req, res, next);

    const call = res.json.mock.calls[0][0];
    expect(call.error.message).toBe('Internal server error');
    expect(call.error.details).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  test('should include stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error');

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          details: expect.objectContaining({
            stack: expect.any(String),
          }),
        }),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });
});

describe('AppError Class', () => {
  test('should create AppError with all properties', () => {
    const error = new AppError(
      ErrorCodes.FAQ_NOT_FOUND,
      'FAQ not found',
      404,
      { faq_id: 'faq.test.001' }
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(ErrorCodes.FAQ_NOT_FOUND);
    expect(error.message).toBe('FAQ not found');
    expect(error.statusCode).toBe(404);
    expect(error.details).toEqual({ faq_id: 'faq.test.001' });
    expect(error.isOperational).toBe(true);
  });

  test('should default to status 500 if not provided', () => {
    const error = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal error');

    expect(error.statusCode).toBe(500);
  });

  test('should have proper stack trace', () => {
    const error = new AppError(ErrorCodes.VALIDATION_ERROR, 'Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Test error');
    expect(error.stack).toContain('error-handler.test.js');
  });
});
