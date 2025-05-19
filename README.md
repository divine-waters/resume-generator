# Resume Generator

A modern, customizable resume generator with user authentication and cloud storage.

## Live Demo

Visit the live demo at: https://your-github-username.github.io/resume-generator/

## Features

- Modern, responsive design
- Real-time editing and formatting
- Customizable templates
- User authentication
- Cloud storage for resumes
- PDF export
- Section visibility controls
- Custom styling options

## Development

For local development:
1. Clone the repository
2. Run `npm install` to install dependencies
3. Start the backend server: `npm run dev`
4. Open `index.html` in your browser

## Deployment

This project uses GitHub Actions for automatic deployment to GitHub Pages. The deployment workflow:
1. Triggers automatically when changes are pushed to the `gh-pages` branch
2. Can also be triggered manually from the Actions tab
3. Builds and deploys the site to GitHub Pages
4. Excludes unnecessary files from deployment

To deploy manually:
1. Push your changes to the `gh-pages` branch
2. Go to the Actions tab in your repository
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow"

## API

The frontend requires a backend API for authentication and resume storage. The API endpoint is configured in `js/auth.js`.

## Browser Support

For best results, use Google Chrome. Other browsers may have limited support for some features.

## License

MIT License