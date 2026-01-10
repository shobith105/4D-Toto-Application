import os
from dotenv import load_dotenv
from supabase import create_client, Client
from uuid import UUID
from fastapi import Header, HTTPException,Depends



load_dotenv()
url=os.getenv("SUPABASE_URL")
key=os.getenv("SUPABASE_KEY")
svc_key = os.environ["SUPABASE_SVC_KEY"]
supabase: Client=create_client(url,key)
admin: Client=create_client(url,svc_key)

sb: Client = create_client(url,key)