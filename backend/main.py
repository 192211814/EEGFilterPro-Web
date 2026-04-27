from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import traceback
from database import init_db
from routers import auth, upload, filter, analysis, project, system

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Init database
    init_db()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(title="EEGFilterPro Backend", lifespan=lifespan)



# Mount static files using absolute path to avoid directory ambiguity
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "traceback": traceback.format_exc()
        }
    )



# Enable CORS for Android
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include Routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(filter.router)
app.include_router(analysis.router)
app.include_router(project.router)
app.include_router(system.router)

@app.get("/")
async def root():
    return {"message": "EEG processing API is active", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8062)
