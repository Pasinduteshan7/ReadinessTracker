import httpx
import asyncio

async def test():
    try:
        async with httpx.AsyncClient() as c:
            r = await c.get('https://api.github.com/users/pasinduteshan7')
            print(f"Status: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(test())
