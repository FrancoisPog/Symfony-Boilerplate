import { defineConfig } from "vite";
import { resolve } from "path";

// (optionel) Ce plugin permet de lancer un refresh de la page lors de la modification d'un fichier twig
const twigRefreshPlugin = {
  name: "twig-refresh",
  configureServer({ watcher, ws }) {
    watcher.add(resolve("templates/**/*.twig"));
    watcher.on("change", function (path) {
      if (path.endsWith(".twig")) {
        ws.send({
          type: "full-reload",
        });
      }
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [twigRefreshPlugin],
  server: {
    watch: {
      disableGlobbing: false, // nécessaire pour le plugin twig
    },
  },
});
