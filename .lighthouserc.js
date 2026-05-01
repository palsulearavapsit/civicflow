module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard', 'http://localhost:3000/chat'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.95}],
        'categories:accessibility': ['error', {minScore: 1.0}],
        'categories:best-practices': ['error', {minScore: 1.0}],
        'categories:seo': ['error', {minScore: 1.0}],
        'first-contentful-paint': ['warn', {maxNumericValue: 1500}],
        'interactive': ['error', {maxNumericValue: 3000}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
