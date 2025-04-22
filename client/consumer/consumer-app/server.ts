import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch'; // Or use native fetch if Node > 18

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so we can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware. If you use your own express
  // router (express.Router()), you should use router.use(vite.middlewares)
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8',
      );

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global
      //    preambles from @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template);

      // 3. Load the server entry. ssrLoadModule automatically transforms
      //    ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

      // 4. Fetch data (Random Quote)
      let quoteData = null;
      try {
        // IMPORTANT: Replace with the actual API endpoint URL if different
        const apiResponse = await fetch('http://localhost:3000/random');
         if (!apiResponse.ok) {
           throw new Error(`API request failed with status ${apiResponse.status}`);
         }
        quoteData = await apiResponse.json();
      } catch (fetchError) {
        console.error("Failed to fetch quote:", fetchError);
        // Handle error appropriately, maybe render with an error message or default quote
      }


      // 5. Render the app HTML. Pass fetched data to the render function.
      //    This assumes render() returns an object like { html: '...', head: '...' }
      //    Adjust based on actual return value of 'render'
      const context = {}; // Context object for router, if needed
      const { html: appHtml } = await render(url, context, quoteData); // Pass quoteData

      // 6. Inject the app-rendered HTML into the template.
      const html = template.replace(`<!--ssr-outlet-->`, appHtml); // Ensure index.html has <!--ssr-outlet-->

      // 7. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
