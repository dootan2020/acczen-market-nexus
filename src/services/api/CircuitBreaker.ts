
// Tập tin này chỉ re-export từ module mới để đảm bảo tính tương thích ngược
export { CircuitBreaker } from './circuit-breaker';

// Use 'export type' for type exports
export type { CircuitBreakerOptions } from './circuit-breaker';
export { CircuitState } from './circuit-breaker';

