from pathlib import Path
import json, re

root = Path(__file__).resolve().parent
courses = json.loads((root / 'courses.json').read_text())
ui = json.loads((root / 'ui-translations.json').read_text())
assert set(ui) == {'en', 'et', 'ru'}
assert all(set(values) == set(ui['en']) for values in ui.values())
assert len({c['id'] for c in courses}) == len(courses)
assert sum(c['priority'] == 'core' for c in courses) == 12
fields = {'role', 'format', 'description', 'use', 'prereq', 'limit', 'linkLabels'}
for c in courses:
    assert set(c['translations']) == {'en', 'et'}
    for language in ['en', 'et']:
        translation = c['translations'][language]
        assert fields <= translation.keys(), (c['id'], language)
        assert all(translation[field] for field in fields)
        assert len(translation['linkLabels']) == len(c['links'])

page = root / 'index.html'
source = page.read_text()
for element, data in [('course-data', courses), ('i18n-data', ui)]:
    payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
    pattern = rf'(<script id="{element}" type="application/json">).*?(</script>)'
    source, count = re.subn(pattern, lambda m: m[1] + payload + m[2], source, flags=re.S)
    assert count == 1, element
page.write_text(source)

# The public study plan is available in the selected site language.
# Keep the original detailed Russian research notes unchanged.
for language in ['en', 'et']:
    text = ui[language]
    def translated(english):
        key = next(key for key, value in ui['en'].items() if value == english)
        return text[key]
    lines = ['# ' + text['planTitle'], '', translated('Independent study path · materials checked on November 17, 2026.'), '', text['materialsLanguage'], '', translated('Matches are by topic, without credit recognition. Assignment code, learning environments and autograders have not been run.'), '', '## ' + translated('Getting started'), '', translated('After roughly half a year at UT, start by strengthening your mathematical foundations. Work on one supplementary course at a time.'), '', translated('PS1, Problem 1 · 30–45 minutes'), '', translated('Prove the irrationality of') + ' `log₄6`.', '', '[PS1](https://openlearninglibrary.mit.edu/assets/courseware/v1/432a6320bb11c2bfba8ed2a47e68f86d/asset-v1:OCW+6.042J+2T2019+type@asset+block/MIT6_042JS15_ps1.pdf)', '', '## ' + translated('How to study'), '', translated('Start with 3–5 extra hours per week alongside UT. This is a suggested schedule for selected topics. Full MIT and CMU courses usually require considerably more time.'), '', translated('Start with a question from your current subject. Find the relevant lecture or reading, work through an example, close the material and explain the idea in your own words.'), '', translated('CMU 17-214 and MIT 6.031 overlap. Introductory courses 15-110 and 6.0001 are useful if you have gaps in the basics. Optional courses are alternatives, not extra requirements.'), '', '## ' + translated('Courses by module'), '']
    for c in courses:
        v = c['translations'][language]
        lines.extend(['### ' + c['school'] + ' ' + c['code'] + ' — ' + c['name'], '', v.get('edition', c['edition']) + ' · ' + ' / '.join('M' + str(m) for m in c['modules']), '', v['role'] + ' · ' + v['format'] + (' · ' + text['reserve'] if c['priority'] == 'reserve' else ''), '', v['description'], '', '**' + text['howToUse'] + ':** ' + v['use'], '', '**' + text['prerequisites'] + ':** ' + v['prereq'], '', v['limit'], ''])
        lines.extend('- [' + label + '](' + url + ')' for label, (_, url) in zip(v['linkLabels'], c['links']))
        lines.append('')
    for heading, body in [('New courses on CMU Learn', 'As of November 17, 2026, CS Learn is launching lecture videos. Self-paced courseware with feedback and AI tutoring are announced as future stages. Playlist completeness has not been verified. Leave Machine Learning Systems, ML in Production, AI Agents and Software Architectures until you have the required foundations.'), ('Versions and limitations', 'This map uses the UT 2026–2027 curriculum and specific course editions. Future content may change. CMU 17-214 Fall 2026 is called Agentic Software Development; this path uses Spring 2023 for foundational software design. Formal languages, abstract algebra and web security are only partially covered.')]:
        lines.extend(['## ' + translated(heading), '', translated(body), ''])
    (root / f'learning-plan.{language}.md').write_text('\n'.join(lines))
print(f'Embedded {len(courses)} courses and {len(ui["en"])} UI keys in English, Estonian and Russian.')
