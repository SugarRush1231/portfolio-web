from pathlib import Path
from aiohttp import web

# FileResponse supplies byte ranges, which video seeking needs.
app = web.Application()
app.router.add_static('/', Path(__file__).resolve().parents[2], show_index=False)

if __name__ == '__main__':
    web.run_app(app, host='127.0.0.1', port=8879)
