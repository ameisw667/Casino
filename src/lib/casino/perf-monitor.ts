// Performance monitoring utility for game profiling

export class PerfMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(label: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const timestamp = performance.now();
      this.marks.set(label, timestamp);

      // Log to console for debugging
      console.debug(`[Perf] ${label}: ${timestamp.toFixed(2)}ms`);
    }
  }

  static measure(label: string, startMark: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startTime = this.marks.get(startMark);
      if (startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        console.debug(`[Perf] ${label}: ${duration.toFixed(2)}ms`);

        // Send to analytics if available
        if (window.performance && window.performance.measure) {
          try {
            window.performance.measure(label, startMark);
          } catch {
            // Silently fail if mark doesn't exist in performance API
          }
        }

        return duration;
      }
    }
    return 0;
  }

  static clearMarks() {
    this.marks.clear();
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        window.performance.clearMarks();
        window.performance.clearMeasures();
      } catch {
        // Silently ignore
      }
    }
  }
}
