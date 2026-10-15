import json, re
from pathlib import Path
import pdfplumber

root = Path(__file__).parent
pages = []
with pdfplumber.open(root / 'UMNA-cenik-2026.pdf') as pdf:
    for page in pdf.pages:
        words = page.extract_words()
        links = []
        for i, word in enumerate(words):
            text = word['text'].rstrip(',;')
            selected = [word]
            url = None
            if text.startswith('www.'):
                url = 'https://' + text
            elif '@' in text:
                url = 'mailto:' + text
            elif text == '+420':
                for next_word in words[i+1:i+4]:
                    if abs(next_word['top']-word['top']) < 3 and re.fullmatch(r'\d{3}[,;]?',next_word['text']):
                        selected.append(next_word)
                if len(selected) == 4:
                    text = ' '.join(w['text'].rstrip(',;') for w in selected)
                    url = 'tel:' + re.sub(r'[^+\d]', '', text)
            if url:
                links.append(dict(url=url,label=text,x=min(w['x0'] for w in selected)/page.width*100,y=min(w['top'] for w in selected)/page.height*100,width=(max(w['x1'] for w in selected)-min(w['x0'] for w in selected))/page.width*100,height=(max(w['bottom'] for w in selected)-min(w['top'] for w in selected))/page.height*100))
        pages.append(dict(links=links,text=page.extract_text()))
(root/'document.js').write_text('window.UMNA_DOCUMENT = '+json.dumps(pages,ensure_ascii=False)+';',encoding='utf-8')
print(json.dumps({'pages':len(pages),'links':sum(len(p['links']) for p in pages)},ensure_ascii=False))
