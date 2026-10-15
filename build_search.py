from pathlib import Path
import json
import pdfplumber
p=Path(__file__).parent
with pdfplumber.open(p/'UMNA-cenik-2026.pdf') as pdf:
    data=[[dict(t=w['text'],x=w['x0']/page.width*100,y=w['top']/page.height*100,w=(w['x1']-w['x0'])/page.width*100,h=(w['bottom']-w['top'])/page.height*100) for w in page.extract_words()] for page in pdf.pages]
(p/'search-index.js').write_text('window.UMNA_WORDS='+json.dumps(data,ensure_ascii=False)+';',encoding='utf-8')
print('Indexed',sum(map(len,data)),'words')
