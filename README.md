# Invincible Reader

A simple React-based comic reader built as a hobby project to read *Invincible*. This project loads files directly from Google Drive, which might make it a bit slow.

## Features
- Fetches and displays comics stored in a Google Drive folder
- Uses React for the UI
- Styled with Tailwind CSS
- Reads Google Drive files using the Google Drive API

## Technologies Used
- **React**: For building the UI
- **Tailwind CSS**: For styling
- **Google Drive API**: To fetch and display stored comics

## How It Works
This project lists the available comics in a folder on Google Drive and allows users to open and read them. Due to direct fetching from Google Drive, loading times may vary depending on the connection and API performance.
It can be replicated to any other comic series (.cbz format)

## Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/Comic-Reader.git
   cd invincible-reader
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add:
   ```sh
   VITE_API_KEY=your_google_drive_api_key
   VITE_FOLDER_ID=your_google_drive_folder_id
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

## Known Limitations
- **Performance:** Since it fetches files directly from Google Drive, loading times can be slow.
- **Google Drive API Limits:** If too many requests are made, rate limits may apply.

## Future Improvements
- Implement caching to improve loading speed
- Add a better UI for browsing comics
- Improve error handling for API requests

## License
This project is built for personal use and learning. Feel free to fork and modify it!

---

### Made for fun to enjoy *Invincible*! 🚀

## GitHub Tags

`#react` `#tailwindcss` `#google-drive-api` `#comic-reader` `#hobby-project`

