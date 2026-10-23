import io
import os
import time
import uuid
import logging
from contextlib import asynccontextmanager
from typing import Optional, Literal

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from PIL import Image

# Import FASHN VTON pipeline
from fashn_vton import TryOnPipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("vton-service")

# Global pipeline instance
pipeline: Optional[TryOnPipeline] = None
weights_dir = os.environ.get("FASHN_WEIGHTS_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../fashn-vton-1.5/weights")))
device_name = "cpu"
gpu_memory_total = 0

@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline, device_name, gpu_memory_total
    logger.info("Initializing FASHN VTON v1.5 service...")
    
    if torch.cuda.is_available():
        device_name = torch.cuda.get_device_name(0)
        gpu_memory_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        logger.info(f"GPU available: {device_name} ({gpu_memory_total:.2f} GB VRAM)")
    else:
        logger.warning("CUDA not available. Using CPU inference.")
        device_name = "CPU"

    logger.info(f"Loading TryOnPipeline from weights dir: {weights_dir}")
    try:
        pipeline = TryOnPipeline(weights_dir=weights_dir)
        logger.info("TryOnPipeline loaded successfully into memory.")
    except Exception as e:
        logger.error(f"Failed to load TryOnPipeline: {e}", exc_info=True)
        pipeline = None

    yield
    
    logger.info("Shutting down VTON service...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

app = FastAPI(title="MirrorFit VTON Inference Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    cuda_avail = torch.cuda.is_available()
    vram_free = 0.0
    vram_total = 0.0
    if cuda_avail:
        free_bytes, total_bytes = torch.cuda.mem_get_info()
        vram_free = free_bytes / (1024**3)
        vram_total = total_bytes / (1024**3)

    return {
        "status": "healthy" if pipeline is not None else "degraded",
        "model_loaded": pipeline is not None,
        "device": device_name,
        "cuda_available": cuda_avail,
        "vram_free_gb": round(vram_free, 2),
        "vram_total_gb": round(vram_total, 2),
        "weights_dir": weights_dir,
    }

@app.post("/tryon")
async def tryon_inference(
    person_image: UploadFile = File(..., description="Customer person photo"),
    garment_image: UploadFile = File(..., description="Garment product photo"),
    category: Literal["tops", "bottoms", "one-pieces"] = Form(..., description="Garment category"),
    garment_photo_type: Literal["model", "flat-lay"] = Form("model", description="Photo type: 'model' or 'flat-lay'"),
    num_timesteps: int = Form(20, description="Sampling steps (e.g. 20 for fast, 30 for balanced)"),
    guidance_scale: float = Form(1.5, description="Guidance scale"),
    seed: int = Form(42, description="Random seed"),
    segmentation_free: bool = Form(True, description="Enable segmentation-free try-on"),
):
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="FASHN VTON pipeline is not loaded. Check model weights and GPU availability.",
        )

    # Validate image files
    content_type_person = person_image.content_type or ""
    content_type_garment = garment_image.content_type or ""
    valid_types = ["image/jpeg", "image/png", "image/webp"]

    if content_type_person and not any(t in content_type_person for t in ["jpeg", "jpg", "png", "webp"]):
        raise HTTPException(status_code=400, detail="Invalid person image type. Expected JPEG, PNG, or WebP.")
    if content_type_garment and not any(t in content_type_garment for t in ["jpeg", "jpg", "png", "webp"]):
        raise HTTPException(status_code=400, detail="Invalid garment image type. Expected JPEG, PNG, or WebP.")

    start_time = time.time()
    try:
        person_bytes = await person_image.read()
        garment_bytes = await garment_image.read()

        # Enforce max 15MB size limit
        if len(person_bytes) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Person image exceeds 15MB limit.")
        if len(garment_bytes) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Garment image exceeds 15MB limit.")

        person_pil = Image.open(io.BytesIO(person_bytes)).convert("RGB")
        garment_pil = Image.open(io.BytesIO(garment_bytes)).convert("RGB")
    except Exception as e:
        logger.error(f"Error decoding input images: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to decode input images: {str(e)}")

    logger.info(
        f"Starting tryon inference: category={category}, photo_type={garment_photo_type}, "
        f"timesteps={num_timesteps}, seg_free={segmentation_free}, person_size={person_pil.size}, garment_size={garment_pil.size}"
    )

    try:
        result = pipeline(
            person_image=person_pil,
            garment_image=garment_pil,
            category=category,
            garment_photo_type=garment_photo_type,
            num_samples=1,
            num_timesteps=num_timesteps,
            guidance_scale=guidance_scale,
            seed=seed,
            segmentation_free=segmentation_free,
        )

        if not result.images:
            raise RuntimeError("Pipeline completed but produced no output images.")

        output_image = result.images[0]
        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG", optimize=True)
        img_bytes = buffer.getvalue()
        elapsed = time.time() - start_time

        logger.info(f"Tryon completed successfully in {elapsed:.2f} seconds.")

        # Free GPU memory cache after inference
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return Response(
            content=img_bytes,
            media_type="image/png",
            headers={
                "X-Inference-Time-Seconds": str(round(elapsed, 2)),
                "X-Device": device_name,
            },
        )
    except torch.cuda.OutOfMemoryError as oom:
        logger.error(f"GPU Out Of Memory: {oom}")
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        raise HTTPException(
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            detail="GPU Out of Memory error during virtual try-on inference. Try reducing image size or timesteps.",
        )
    except Exception as e:
        logger.error(f"TryOn inference failed: {e}", exc_info=True)
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        raise HTTPException(
            status_code=500,
            detail=f"Inference execution failed: {str(e)}",
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("VTON_PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
