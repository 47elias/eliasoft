import sys, os
sys.path.insert(0, os.path.abspath('tmp/pdfs/vendor'))
import fitz
pdf_path = r'C:\Users\Elias\Documents\Laravel_Projects\school_management_system_Laravel\output\manual\School_Management_System_User_Manual_2026-11-02.pdf'
doc = fitz.open(pdf_path)
print('PAGES', len(doc), 'METADATA', doc.metadata)
for i, page in enumerate(doc):
    text = ' '.join(page.get_text(sort=True).split())
    images = page.get_images(full=True)
    print(f'PAGE {i+1} images={len(images)} text={text[:420]}')
