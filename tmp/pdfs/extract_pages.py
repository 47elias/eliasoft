import sys, os
sys.path.insert(0, os.path.abspath('tmp/pdfs/vendor'))
import fitz
pdf_path = r'C:\Users\Elias\Documents\Laravel_Projects\school_management_system_Laravel\output\manual\School_Management_System_User_Manual_2026-11-02.pdf'
doc = fitz.open(pdf_path)
outdir = 'tmp/pdfs/extracted'
os.makedirs(outdir, exist_ok=True)
for pno in [2, 10, 16, 18, 28]:
    page = doc[pno]
    for ix, item in enumerate(page.get_images(full=True), 1):
        xref = item[0]
        data = doc.extract_image(xref)
        out = os.path.join(outdir, f'page-{pno+1}-image-{ix}.{data["ext"]}')
        open(out, 'wb').write(data['image'])
        print(f'{out}: {data["width"]}x{data["height"]} {data["ext"]} {len(data["image"])} bytes')
