import json
r = json.load(open('/home/user/Doubao/chats/38442579084875522/_v6base/tests/raw-results.json'))
print('=== DOCS sample CDN details ===')
for d in r['docs']:
    print(d['file'], '| cdn=', d['has_cdn'], '| errs=', d['console_error_count'])
    for u in d['cdn_deps'][:3]:
        print('    ->', u)
print()
total = sum(g['console_error_count'] for g in r['golden'])
print('Total golden console.error:', total)
dtotal = sum(d['console_error_count'] for d in r['docs'])
print('Total docs console.error:', dtotal)
for d in r['docs']:
    if d['console_errors']:
        print('  ERR', d['file'], d['console_errors'])
