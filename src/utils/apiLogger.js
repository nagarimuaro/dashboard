// API Request/Response Logger
class ApiLogger {
  static log(method, url, data, response, duration) {
    if (import.meta.env?.VITE_ENABLE_DEBUG === 'true' || 
        import.meta.env?.MODE === 'development') {
      console.group(`🌐 API ${method} ${url}`);
      console.log('📤 Request:', data);
      console.log('📥 Response:', response);
      console.log('⏱️ Duration:', `${duration}ms`);
      console.groupEnd();
    }
  }

  static error(method, url, error) {
    console.group(`❌ API Error ${method} ${url}`);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  static performance(componentName, duration) {
    if (duration > 1000) {
      console.warn(`⚠️ ${componentName} took ${duration}ms to render`);
    }
  }
}

export { ApiLogger };