# Armscye / MirrorFit AI — Judge & Hackathon Demo Walkthrough

**Target Presentation Time:** 2–3 minutes  
**Target Audience:** Hackathon Judges, Retail Partners, Mentors

---

## 1. Value Proposition (First 30 Seconds)

> *"In Indian retail fashion, trying on clothes physically is slow, creates fitting room queues, and limits catalogue exploration — especially for ethnic wear like Kurtas, Nehru Jackets, and Anarkalis. Generic AI apps just hallucinate random photos. **Armscye** solves this: it runs real **FASHN VTON v1.5** pixel-space diffusion right on our local GPU, dressing real customers in our actual store inventory in ~34 seconds."*

---

## 2. Step-by-Step Live Demo Path

### Step 1: Hardware Telemetry & Architecture
- Open **`http://localhost:5173`**.
- **Point to the Header Badge:** Show the live green pill reading `NVIDIA RTX 4050 Laptop GPU (bf16)`.
- *Talking Point:* *"Our architecture decouples the front-facing retail kiosk from the GPU inference adapter. Diffusion weights are resident in memory, running in native bfloat16."*

### Step 2: One-Click Instant Customer Capture
- Click **"Enter Virtual Fitting Room"**.
- Point out the three customer photo input options:
  1. File Upload (JPEG/PNG/WebP)
  2. Live Web Camera capture
  3. **⚡ 1-Click Demo Model** (instant zero-friction testing)
- Click **"⚡ 1-Click Demo Model"** and tap **"Continue to Outfit Selection"**.

### Step 3: Garment Selection & Category Filtering
- Point out that the customer photo remains pinned in the session header.
- Filter by **"Tops & Kurtas"**.
- Select the **"Emerald Heritage Silk Kurta"** (₹1,899).
- Note the diffusion parameters (20 timesteps for fast 34-second demonstration).
- Click **"Try On This Outfit"**.

### Step 4: Diffusion Inference in Progress
- Show the dual-card processing screen:
  - DWPose 133-keypoint detection
  - FashnHumanParser segmentation
  - Maskless pixel diffusion
- *Talking Point:* *"Notice we don't display a fake progress percentage; the pipeline is actively running RF Euler sampling on our RTX 4050."*

### Step 5: High-Quality Results & Side-by-Side Comparison
- The generated try-on result appears on screen.
- Toggle between **"Original Photo"**, **"Virtual Fitting"**, and **"Side-by-Side"**.
- Highlight that the person's face, posture, hands, and background are faithfully preserved while the Emerald Kurta is photorealistically draped.
- Point out the store product card: ₹1,899, sizes available, and fabric tags.

### Step 6: Single-Upload Multi-Garment Switching
- Tap **"Try Another Garment"**.
- Notice: **the user does NOT have to upload their photo again!**
- Select the **"Maroon Jacquard Nehru Jacket"** or **"Ivory Linen Shirt"**.
- Tap **"Try On This Outfit"** to demonstrate rapid wardrobe exploration.

### Step 7: Catalogue-Grounded Recommendations
- Scroll down to the **"Recommended Alternatives"** section.
- Point out the explanation badges: *"Matching Green shade"*, *"Within budget"*, *"Same Kurta category"*.
- *Talking Point:* *"Every single recommendation is strictly grounded in our real catalogue — no hallucinated products."*
- Click **"Try This Outfit"** to run inference immediately.

### Step 8: Privacy & Session Reset
- Click **"Clear Session"** in the top navigation.
- Show that temporary customer photos and generated outputs are instantly purged from the server.

---

## 3. Anticipated Judge Questions & Answers

| Question | Answer |
| :--- | :--- |
| **Why not just use Midjourney or DALL-E?** | Generic text-to-image models hallucinate an entirely new person and an invented garment. FASHN VTON is an authentic virtual try-on diffusion pipeline that maps a specific garment photo onto a specific person's body posture. |
| **Can this run on affordable hardware?** | Yes! We are demonstrating this directly on a laptop with an entry-level NVIDIA RTX 4050 (6 GB VRAM) using native `bfloat16` optimizations. It does not require a cluster of server-grade GPUs. |
| **How do store owners add products?** | Store owners simply upload flat-lay photos or model photos via the "Store Catalogue" tab. FASHN handles both formats natively. |
| **What about customer privacy?** | Customer images are held strictly in temporary session buffers and are permanently wiped upon session completion. No facial data is harvested. |
