import subprocess
import time
import webbrowser
import os
import sys

def run_project():
    print("🚀 Starting CivicFlow Election Copilot...")
    
    # Start the Next.js development server
    try:
        # Using shell=True for Windows compatibility with npm
        process = subprocess.Popen(["npm", "run", "dev"], shell=True)
        
        print("⏳ Waiting for server to start (usually ~5-10 seconds)...")
        time.sleep(8)
        
        url = "http://localhost:3000"
        print(f"🌐 Opening {url} in your browser...")
        webbrowser.open(url)
        
        print("\n✅ Project is running!")
        print("💡 Press Ctrl+C in this terminal to stop the server.")
        
        # Keep the script running to maintain the process
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        process.terminate()
    except Exception as e:
        print(f"❌ Error starting project: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_project()
