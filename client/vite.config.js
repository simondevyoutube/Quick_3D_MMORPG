// https://github.com/chaosprint/vite-plugin-cross-origin-isolation/blob/main/src/vite-plugins-cross-origin-isolation.js
const crossOriginIsolation = () => ({
    name: 'configure-server',
    configureServer(server) {
        server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            next();
          });
    }
})

export default {
    // config options
    plugins: [
        crossOriginIsolation()
    ]
}
