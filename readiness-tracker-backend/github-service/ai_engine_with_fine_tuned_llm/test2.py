from src.config.settings import settings
import httpx
import asyncio

async def test():
    try:
        url = f"{settings.GITHUB_API_BASE}/users/pasinduteshan7"
        print(f"URL being used: {url}")
        async with httpx.AsyncClient() as c:
            r = await c.get(url)
            print(f"Status: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(test())
