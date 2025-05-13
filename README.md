
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables for Firebase:**
    *   Create a new file named `.env.local` in the root of your project.
    *   Copy the contents of `.env.local.example` into `.env.local`.
    *   Replace the placeholder values (like `YOUR_FIREBASE_API_KEY`) with your actual Firebase project's configuration details. You can find these in your Firebase project settings on the Firebase console.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js app on `http://localhost:9002`.
    **Note:** If you created or modified `.env.local` while the dev server was running, you'll need to restart it for the changes to take effect.

4.  **Run Genkit development server (if using GenAI features):**
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```

## Building for Production

To build the application for production, run:
```bash
npm run build
```

## Deployment to Firebase Hosting

This project is configured for deployment to Firebase Hosting.

**Prerequisites:**

*   **Firebase CLI:** Ensure you have the Firebase CLI installed. If not, install it globally:
    ```bash
    npm install -g firebase-tools
    ```
*   **Firebase Account:** You need a Firebase account and an existing Firebase project.
*   **Environment Variables for Deployed App:** For the deployed application to connect to Firebase services, you'll need to configure environment variables in the Firebase environment (Cloud Functions for Firebase, which Next.js on Firebase Hosting uses). Refer to Firebase documentation on how to set environment variables for functions. The variables needed are the same ones listed in `.env.local.example` (e.g., `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc., though for server-side functions, `NEXT_PUBLIC_` prefix is not strictly necessary for all but can be kept for consistency if also used by client-side code).

**Steps to Deploy:**

1.  **Login to Firebase (if you haven't already):**
    ```bash
    firebase login
    ```

2.  **Configure for your Firebase Project:**
    *   Open the `.firebaserc` file in the root of this project.
    *   Replace `<YOUR_PROJECT_ID>` with your actual Firebase project ID. It should look like this:
        ```json
        {
          "projects": {
            "default": "my-actual-project-id"
          }
        }
        ```
    *   Alternatively, you can set the project for the current directory using the Firebase CLI (this will also update/create `.firebaserc`):
        ```bash
        firebase use <YOUR_PROJECT_ID>
        ```
        Replace `<YOUR_PROJECT_ID>` with your actual Firebase project ID.

3.  **Build the application (optional but recommended):**
    While Firebase Hosting with `frameworksBackend` often handles the build, it's good practice to ensure it builds locally first.
    ```bash
    npm run build
    ```

4.  **Deploy to Firebase Hosting:**
    Use the provided npm script:
    ```bash
    npm run deploy
    ```
    This command executes `firebase deploy --only hosting`, which will build (if not already built by `frameworksBackend` configuration) and deploy your Next.js application to Firebase Hosting.

After deployment, the Firebase CLI will output the URL where your application is hosted.
