const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the main Express server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
    })
  );

  // Proxy ML API requests to the Flask ML service
  app.use(
    '/ml-api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/ml-api': '/api/ml', // Rewrite /ml-api/predict to /api/ml/predict
      },
    })
  );
};
