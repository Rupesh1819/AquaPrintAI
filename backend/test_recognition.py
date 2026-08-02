import sys, os
sys.path.append(os.getcwd())
from app.services.recognition import RecognitionPipelineManager
import re

full_search_text = "Coca-Cola 营养成分表 每100毫升 营养素参考值% 能量 180千焦 2% 蛋白质 0克 0% 脂肪 0克 0% 碳水化合物 10.6克 4% 糖 1"

noise_words = {'water', 'ml', 'l', 'pack', 'bottle', 'drink', 'beverage', 'net', 'vol', 'qty', 'litres', 'liter', 'ingredients'}
ocr_lower = full_search_text.lower()
print("OCR Lower:", ocr_lower)

# Previous logic
ocr_tokens = set(re.findall(r'\b[A-Za-z0-9\-]+\b', ocr_lower)) - noise_words
print("Previous OCR tokens:", ocr_tokens)

# New logic for regex to include unicode characters
ocr_tokens_new = set(re.findall(r'\w+', ocr_lower)) - noise_words
print("New OCR tokens:", ocr_tokens_new)

# Test auto-create cleaning
clean_name = full_search_text.strip().split('\n')[0]
clean_name = re.sub(r'(?i)(营养成分表|每100毫升|营养素参考值|能量|蛋白质|脂肪|碳水化合物|糖|kJ|kcal|nutrition facts|ingredients).*$', '', clean_name).strip()
print("Clean name:", clean_name)
