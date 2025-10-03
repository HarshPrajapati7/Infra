# NLP Query Engine - Quick Start

## Your app is now running! 🎉

### Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Both servers are running in background terminals

**Keep these terminals open:**
- Backend (Uvicorn) on port 8000
- Frontend (Vite) on port 5173

### How to Use the App

1. **Open your browser** and go to: http://localhost:5173

2. **Connect to a Database**:
   - Use the default SQLite connection string, or
   - Enter your own database URL (PostgreSQL, MySQL)
   - Click "Connect & Analyze"

3. **Upload Documents** (optional):
   - Drag & drop PDF, DOCX, TXT, or CSV files
   - Or use the file picker
   - Click "Upload & Process"

4. **Ask Questions**:
   - Type natural language queries like:
     - "Show me all employees in Engineering"
     - "List Python developers with salaries over 80000"
     - "Find employees with machine learning skills"
   - Click "Run Query"

5. **View Results**:
   - See table results, document matches, and metrics
   - Export results as CSV or JSON

### If Something Goes Wrong

**To restart everything:**

1. Stop both servers (Ctrl+C in each terminal)
2. Run the startup script:

```powershell
cd "h:\ikam apps\project"
.\RUN_APP.bat
```

**Or run them separately:**

```powershell
# Terminal 1 - Backend
cd "h:\ikam apps\project"
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH="backend"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd "h:\ikam apps\project"
npm run dev
```

### What Was Fixed

✅ Backend server running on http://localhost:8000  
✅ Frontend server running on http://localhost:5173  
✅ Vite configuration updated with proper proxy settings  
✅ CORS middleware configured to allow frontend requests  
✅ React app entry point verified  
✅ All dependencies installed  

### Next Steps

- Create a sample SQLite database to test with
- Upload some employee documents (resumes, reviews)
- Try different query types (SQL, document search, hybrid)

---

**Happy querying!** 🚀
