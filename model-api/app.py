from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
from torchvision.models import ResNet50_Weights
from PIL import Image
import io
import torch

app = FastAPI()

# CORS (프론트/백 주소 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드 (가벼운 CPU 모드)
weights = ResNet50_Weights.DEFAULT
model = models.resnet50(weights=weights)
model.eval()
preprocess = weights.transforms()
classes = weights.meta["categories"]

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 이미지 로드
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # 전처리 & 추론
    x = preprocess(img).unsqueeze(0)  # [1, 3, 224, 224]
    with torch.no_grad():
        logits = model(x)
        probs = torch.nn.functional.softmax(logits, dim=1)[0]

    # Top-5 결과
    top5_prob, top5_idx = torch.topk(probs, 5)
    results = [
        {"label": classes[idx], "prob": float(top5_prob[i])}
        for i, idx in enumerate(top5_idx.tolist())
    ]
    # 가장 높은 것 하나도 같이 반환
    top1 = results[0]
    return {"top1": top1, "top5": results}