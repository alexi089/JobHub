"""
Greenhouse Harvest API Integration

Fetches candidate applications from Greenhouse using API key authentication.
"""
import httpx
import base64
from typing import List, Dict, Any, Optional
from datetime import datetime


class GreenhouseClient:
    """Client for Greenhouse Harvest API."""
    
    BASE_URL = "https://harvest.greenhouse.io/v1"
    
    def __init__(self, api_key: str):
        """
        Initialize Greenhouse client.
        
        Args:
            api_key: Greenhouse API key (format: api_key:)
        """
        # Greenhouse uses Basic auth with api_key: (note the colon)
        credentials = f"{api_key}:"
        encoded = base64.b64encode(credentials.encode()).decode()
        
        self.client = httpx.Client(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Basic {encoded}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
    
    def test_connection(self) -> bool:
        """
        Test if API key is valid.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            response = self.client.get("/candidates", params={"per_page": 1})
            return response.status_code == 200
        except Exception:
            return False
    
    def get_applications(
        self,
        created_after: Optional[datetime] = None,
        per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch applications from Greenhouse.
        
        Args:
            created_after: Only get applications created after this date
            per_page: Results per page (max 500)
        
        Returns:
            List of application dictionaries
        """
        applications = []
        page = 1
        
        params = {
            "per_page": per_page,
        }
        
        if created_after:
            params["created_after"] = created_after.isoformat()
        
        while True:
            params["page"] = page
            
            try:
                response = self.client.get("/applications", params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if not data:
                    break
                
                applications.extend(data)
                
                # Check if there are more pages
                if len(data) < per_page:
                    break
                
                page += 1
                
            except httpx.HTTPStatusError as e:
                raise Exception(f"Greenhouse API error: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                raise Exception(f"Failed to fetch applications: {str(e)}")
        
        return applications
    
    def get_candidate(self, candidate_id: int) -> Dict[str, Any]:
        """
        Get detailed candidate information.
        
        Args:
            candidate_id: Greenhouse candidate ID
        
        Returns:
            Candidate dictionary
        """
        try:
            response = self.client.get(f"/candidates/{candidate_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Failed to fetch candidate: {e.response.status_code}")
    
    def get_application(self, application_id: int) -> Dict[str, Any]:
        """
        Get detailed application information.
        
        Args:
            application_id: Greenhouse application ID
        
        Returns:
            Application dictionary
        """
        try:
            response = self.client.get(f"/applications/{application_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Failed to fetch application: {e.response.status_code}")
    
    def close(self):
        """Close HTTP client."""
        self.client.close()


def map_greenhouse_status(greenhouse_status: str) -> str:
    """
    Map Greenhouse application status to our internal status.
    
    Args:
        greenhouse_status: Greenhouse status string
    
    Returns:
        Our internal status string
    """
    status_map = {
        "active": "interviewing",
        "hired": "offer",
        "rejected": "rejected",
        "pending": "applied",
    }
    
    return status_map.get(greenhouse_status.lower(), "applied")


def extract_application_data(gh_application: Dict[str, Any], company_name: str) -> Dict[str, Any]:
    """
    Extract relevant data from Greenhouse application for our database.
    
    Args:
        gh_application: Raw Greenhouse application dict
        company_name: Company name from ATS account
    
    Returns:
        Dictionary ready for Application model
    """
    # Get job details
    job = gh_application.get("jobs", [{}])[0] if gh_application.get("jobs") else {}
    
    return {
        "job_title": job.get("name", "Unknown Position"),
        "company_name": company_name,
        "status": map_greenhouse_status(gh_application.get("status", "pending")),
        "applied_at": gh_application.get("applied_at"),
        "job_url": None,  # Greenhouse doesn't provide public job URL in API
        "job_data": gh_application,  # Store full JSON for reference
        "notes": None,
    }
