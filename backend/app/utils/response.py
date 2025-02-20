from typing import Any, Dict, Optional
from fastapi import status
from fastapi.responses import JSONResponse

class ResponseUtils:
    @staticmethod
    def success_response(
        data: Any,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK
    ) -> JSONResponse:
        """Create a standardized success response."""
        return JSONResponse(
            status_code=status_code,
            content={
                "success": True,
                "message": message,
                "data": data
            }
        )

    @staticmethod
    def error_response(
        message: str,
        error_code: Optional[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        """Create a standardized error response."""
        content = {
            "success": False,
            "message": message,
            "error_code": error_code or "UNKNOWN_ERROR"
        }
        if details:
            content["details"] = details
            
        return JSONResponse(
            status_code=status_code,
            content=content
        )