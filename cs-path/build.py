from pathlib import Path
import json,re
root=Path(__file__).resolve().parent
courses=json.loads((root/'courses.json').read_text())
assert len({c['id'] for c in courses})==len(courses)
assert sum(c['priority']=='core' for c in courses)==12
payload=json.dumps(courses,ensure_ascii=False).replace('</','<\\/')
p=root/'index.html'
s=p.read_text()
s=re.sub(r'(<script id="course-data" type="application/json">).*?(</script>)',lambda m:m[1]+payload+m[2],s,flags=re.S)
p.write_text(s)
print(f'Embedded {len(courses)} courses.')
