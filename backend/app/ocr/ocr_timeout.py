# app/services/ocr_timeout.py
import anyio
from fastapi import HTTPException

async def run_blocking_with_timeout(fn, *args, timeout_s: int = 20, **kwargs):
    try:
        with anyio.fail_after(timeout_s):
            # AnyIO v4 uses abandon_on_cancel
            try:
                return await anyio.to_thread.run_sync(
                    fn, *args, **kwargs, abandon_on_cancel=True
                )
            except TypeError:
                # AnyIO v3 uses cancellable
                return await anyio.to_thread.run_sync(
                    fn, *args, **kwargs, cancellable=True
                )
    except TimeoutError:
        raise HTTPException(status_code=504, detail="OCR timed out. Please try again.")
