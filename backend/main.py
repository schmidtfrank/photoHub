#API setup to receive images/send to Pi
import aiohttp
import asyncio
from aiohttp import web

routes = web.RouteTableDef()

@routes.post('/createFolder/{folder_type}')
async def folderCreation(request : web.Request) -> web.Response:
    folder_type = request.match_info["folder_type"]
    print(folder_type)
    return web.Response(status=200)

@routes.get("/photos/{folder_type}")
async def givePhotos(request : web.Request) -> web.Response:
    folder_type = request.match_info["folder_type"]
    print(folder_type)
    return web.Response(status=200)

@routes.post("/upload")
async def uploadPhotos(request : web.Request) -> web.Response:
    print("post request recevied")
    print(request)

if __name__ == '__main__': 
    app = web.Application()
    app.add_routes(routes)
    web.run_app(app, host="0.0.0.0",port=8000)