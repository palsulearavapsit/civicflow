/**
 * TEST-26: Chaos Engineering Failure Simulator.
 * Intercepts fetch calls and injects random latency or errors to test resilience.
 */

export const simulateFailure = (probability = 0.05) => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    // 5% chance of failure by default
    if (Math.random() < probability) {
      const errorTypes = ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_500'];
      const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];

      console.log(`[Chaos Monkey]: Simulating ${type} for ${args[0]}`);

      if (type === 'TIMEOUT') {
        await new Promise(resolve => setTimeout(resolve, 10000));
        throw new Error('Network Timeout');
      }
      
      if (type === 'NETWORK_ERROR') {
        throw new TypeError('Failed to fetch');
      }

      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }

    return originalFetch(...args);
  };
};
