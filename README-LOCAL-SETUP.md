# VANT Local Development Setup Guide

If you are seeing an error like `ENOENT Could not read package.json`, it means you are running the command in the wrong folder.

## Step 1: Open the Correct Folder
You need to open your terminal (PowerShell, Command Prompt, or VS Code Terminal) directly inside the project folder.

1. Open File Explorer and go to the project folder:
   ```
   C:\Users\Emre Karataşl\.gemini\antigravity\scratch\vant
   ```
2. **Right-click** anywhere inside that folder and select **"Open in Terminal"** (Terminal'de Aç). 
3. Verify you are in the right folder by typing `dir` and pressing Enter. You should see `package.json` in the list of files.

## Step 2: Install Dependencies
If this is your first time opening the project, or if new packages were added, you must install them. 
Run this command in the terminal:
```bash
npm install
```

## Step 3: Start the Development Server
Once installation is complete, start your local website testing server:
```bash
npm run dev
```

## Step 4: View the Website
Open your browser (Chrome, Edge, Safari) and go to:
👉 **http://localhost:3000**

---

### ⚠️ Common Errors

**Error: `ENOENT: no such file or directory, open '...\package.json'`**
* **Why it happens:** You are trying to run `npm install` or `npm run dev` in a folder that doesn't have the VANT project code. Usually, this means your terminal is open in your main `C:\Users\Emre Karataşl` folder instead of the `vant` folder.
* **How to fix:** Follow **Step 1** above. Ensure your terminal path before typing the command ends with `\vant>`. You can type `cd ".gemini\antigravity\scratch\vant"` if you are in your user folder.

**Error: Blank Hero Video**
* **Why it happens:** The website tries to load a video from your Supabase database or a fallback file.
* **How to fix:** The project now has a guaranteed default fallback. If you want a specific video, place an `hero.mp4` file inside the `public/videos/` folder.
